import type { Global } from '@jest/types'
// import type { MatcherState } from '@jest/expect'
import { tfDeploy, tfDestroy } from './helper/deploy'
import { TestAppConfig } from './app'
import console from 'console'

type Outputs = Record<string, any>
type Global = Global.Global

declare type CloudEachTestFn<EachCallback extends Global.TestCallback> = (
  stack: Outputs,
  context?: CloudTestContext,
) => ReturnType<EachCallback>

export interface CloudSetup {
  testApp: TestAppConfig
  force?: boolean
  forceDestroy?: boolean
  verbose?: boolean
  setupTimeout?: number
  destroyTimeout?: number
}

export interface CloudTestContextConfig {
  // state: MatcherState & Record<string, any>
  appName: string
  testRunId: string
}

export class CloudTestContext {
  public relativePath?: string
  public currentTestName?: string

  constructor(config: CloudTestContextConfig) {
    const { appName, testRunId } = config

    // this.currentTestName = state.isExpectingAssertions ? state.currentTestName ?? 'hook' : 'hook'
    // const invalidCharacters = /[^a-zA-Z0-9.:/%&#=+\-@\s]/g
    // this.relativePath = state.testPath?.replace(process.cwd(), '') || ''
  }

  public async done(): Promise<void> {}

  public fail(error: Error): void {}
}

const install = (g: Global) => {
  let outputs: Outputs

  const bind = (t: Global.EachTestFn<Global.PromiseReturningTestFn>) => {
    return async (..._args: any) => {
      const context = new CloudTestContext({
        appName: g.__APP_NAME__ as string,
        testRunId: g.__TEST_RUN_ID__ as string,
      })
      try {
        await t(outputs, context)
      } catch (e: any) {
        context.fail(e)
        console.log({ e })
        throw e
      } finally {
        context.done()
      }
    }
  }

  const test = (title: string, t: CloudEachTestFn<Global.PromiseReturningTestFn>, timeout?: number) => {
    g.test(title, bind(t), timeout)
  }

  const it = (title: string, t: Global.EachTestFn<Global.PromiseReturningTestFn>, timeout?: number) => {
    g.it(title, bind(t), timeout)
  }

  const afterAll = (t: Global.HookBase, timeout?: number) => {
    g.afterAll(bind(t), timeout)
  }

  const setup = (config: CloudSetup) => {
    g.console = console
    g.beforeAll(
      bind(async () => {
        const { testApp, force = false, verbose = false } = config // tmp dir for outputs
        outputs = await tfDeploy(testApp, force, verbose) // runner

        if (!outputs) {
          throw new Error('No outputs found')
        }
      }),
      config.setupTimeout || 240_000,
    )

    g.afterAll(async () => {
      const { testApp, verbose = false, forceDestroy = false } = config // tmp dir for outputs
      if (forceDestroy || process.env.DESTROY_CDK_STACKS === 'true') {
        await tfDestroy(testApp, verbose)
      }
    }, config.destroyTimeout || 240_000)
  }

  const beforeAll = (t: Global.HookBase, timeout?: number) => {
    g.beforeAll(bind(t), timeout)
  }

  // test.skip = bind(g.test.skip)(table, ...data);
  // test.only = bind(g.test.only)(table, ...data);

  return { test, it, afterAll, beforeAll, setup }
}

export const cdkSpec = install(global as unknown as Global)

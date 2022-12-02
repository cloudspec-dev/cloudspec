import type { Global } from '@jest/types'
// import type { MatcherState } from '@jest/expect'
import { cdkDeploy, cdkDestroy } from './helper/cdk-deploy'
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
  verbose?: boolean
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
        const result = await cdkDeploy(testApp.outDir, testApp.testDir, force, verbose) // runner

        outputs = result[testApp.stackName]

        // sleep for 2 seconds to allow for AWS to finish
        await new Promise((resolve) => setTimeout(resolve, 2_000))

        if (!outputs) {
          throw new Error('No outputs found')
        }
      }),
      240_000,
    )

    g.afterAll(async () => {
      const { testApp, force = false, verbose = false } = config // tmp dir for outputs
      if (process.env.DESTROY_CDK_STACKS === 'true') {
        await cdkDestroy(testApp.outDir, testApp.testDir, force, verbose)
      }
    }, 240_000)
  }

  const beforeAll = (t: Global.HookBase, timeout?: number) => {
    g.beforeAll(bind(t), timeout)
  }

  // test.skip = bind(g.test.skip)(table, ...data);
  // test.only = bind(g.test.only)(table, ...data);

  return { test, it, afterAll, beforeAll, setup }
}

export const cdkSpec = install(global as unknown as Global)

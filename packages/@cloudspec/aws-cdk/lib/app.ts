import * as cdk from 'aws-cdk-lib'
import { Construct } from 'constructs'
import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'
import { createHash } from 'crypto'
import { cdkDeploy, cdkDestroy } from './helper/cdk-deploy'

export class TestStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props)
  }
}
export type Outputs = Record<string, any>

export interface TestAppConfig {
  stackName: string
  outDir: string
  testDir: string
  stack: TestStack,
  outputs: Outputs,
  workDir: string
}

export class CloudSpec {
  constructor(public readonly projectName: string, public readonly cwd: string) {
  }

  public static async deploy(app: TestAppConfig) {
    const force = false
    const verbose = false
    const result = await cdkDeploy(app.outDir, app.workDir, force, verbose)

    return result[app.stackName]
  }

  public static async destroy(app: TestAppConfig) {
    const verbose = false
    await cdkDestroy(app.outDir, app.workDir, verbose)
  }

  public createTestApp(id: string, creator: (app: cdk.Stack, outputs: (outputs: Outputs) => Outputs) => void)  {
    const projectName = (global as any).CLOUD_SPEC_PROJECT_NAME;

    // create tmp dir
    const workDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cdk-test-app-'))
    const outdir = path.join(workDir, 'cdk.out')
    const digest = createHash('sha256').update(id).digest('hex').substr(0, 8)
    const name = `CloudSpec-${id}-${process.env.GITHUB_REF_NAME || process.env.USER}-${digest}`

    // replace all non-alphanumeric characters with '-'
    const stackName = name.replace(/[^a-zA-Z0-9]/g, '-')

    const app = new cdk.App({ outdir })
    const stack = new TestStack(app, stackName, {})
    let stackOutputs: Outputs = {}

    const outputsHandler = (outputs: Outputs) => {
      for (const [key, value] of Object.entries(outputs)) {
        new cdk.CfnOutput(stack, key, { value })
      }

      stackOutputs = outputs;

      return outputs
    }

    creator?.(stack, outputsHandler)

    const excludeResourceTypes = ['AWS::Lambda::Function']

    cdk.Tags.of(stack).add('Test', 'true', {
      excludeResourceTypes,
    })
    cdk.Tags.of(stack).add('TestPath', this.cwd, {
      excludeResourceTypes,
    })
    cdk.Tags.of(stack).add('CloudSpecProjectName', projectName, {
      excludeResourceTypes,
    })
    if (process.env.GITHUB_REF_NAME) {
      cdk.Tags.of(stack).add('GitRefName', process.env.GITHUB_REF_NAME, {
        excludeResourceTypes,
      })
    }

    app.synth()
    return {
      outDir: outdir,
      workDir,
      stackName,
      testDir: path.dirname(this.cwd),
      outputs: stackOutputs,
      stack
    }
  }
}
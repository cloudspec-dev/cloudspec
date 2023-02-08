import * as cdk from 'aws-cdk-lib'
import { Construct } from 'constructs'
import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'
import { createHash } from 'crypto'
import { cdkDeploy, cdkDestroy } from './helper/cdk-deploy'
import { Aspects, IAspect } from 'aws-cdk-lib'
import { ForceEphemeralResources } from './helper/ephemeral'

export type StackOutputs = Record<string, any>

export interface TestStackConfig extends cdk.StackProps {
  readonly cwd: string
  readonly projectName: string
}

export class TestStack extends cdk.Stack {
  public stackOutputs: StackOutputs = {}

  public static generateName(id: string): string {
    const digest = createHash('sha256').update(id).digest('hex').substr(0, 8)
    return `CloudSpec-${id}-${process.env.GITHUB_REF_NAME || process.env.USER}-${digest}`
  }

  constructor(scope: Construct, id: string, public readonly props: TestStackConfig) {
    super(scope, TestStack.generateName(id), props)
  }

  public outputs(o: StackOutputs): void {
    for (const [key, value] of Object.entries(o)) {
      new cdk.CfnOutput(this, key, { value })
    }

    this.stackOutputs = o;
  }

  public prepareForTest(): void {
    this.ephemeral()
    this.tagAll()
  }

  public ephemeral(): void {
    Aspects.of(this).add(this.ephemeralAspect())
  }

  public ephemeralAspect(): IAspect {
    return new ForceEphemeralResources()
  }

  public tagAll(): void {
    const excludeResourceTypes = ['AWS::Lambda::Function']

    cdk.Tags.of(this).add('Test', 'true', {
      excludeResourceTypes,
    })
    cdk.Tags.of(this).add('TestPath', this.props.cwd, {
      excludeResourceTypes,
    })
    cdk.Tags.of(this).add('CloudSpecProjectName', this.props.projectName, {
      excludeResourceTypes,
    })
    if (process.env.GITHUB_REF_NAME) {
      cdk.Tags.of(this).add('GitRefName', process.env.GITHUB_REF_NAME, {
        excludeResourceTypes,
      })
    }
  }
}

export interface TestAppConfig {
  readonly force?: boolean
  readonly verbose?: boolean
}

export class CloudSpec {
  public readonly outdir: string
  public readonly app: cdk.App
  public readonly stack: TestStack

  constructor(public readonly projectName: string, public readonly cwd: string, public readonly env?: cdk.Environment) {
    const workDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cdk-test-app-'))
    this.outdir = path.join(workDir, 'cdk.out')
    this.app = new cdk.App({outdir: this.outdir})
    this.stack = new TestStack(this.app, projectName, {
      projectName: this.projectName,
      cwd: this.cwd,
      env: this.env,
    })
  }

  public async deploy(app: TestAppConfig = {}): Promise<any> {
    this.stack.prepareForTest()
    this.app.synth()
    const { force = false, verbose = false } = app
    const result = await cdkDeploy(this.outdir, this.cwd, force, verbose)

    return result[this.stack.stackName]
  }

  public async destroy(app: TestAppConfig = {}) {
    const { verbose = false } = app
    await cdkDestroy(this.outdir, this.cwd, verbose)
  }
}
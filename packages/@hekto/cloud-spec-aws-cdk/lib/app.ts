#!/usr/bin/env node
import 'source-map-support/register'
import * as cdk from 'aws-cdk-lib'
import { Construct } from 'constructs'
import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'
import { createHash } from 'crypto'

class TestStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props)
  }
}
export type Outputs = Record<string, any>

export interface CreateTestAppProps {
  name?: string
  outdir?: string
  creator?: (app: cdk.Stack, outputs: (outputs: Outputs) => Outputs) => void
}

export interface TestAppConfig {
  stackName: string
  outDir: string
  testDir: string
  stack: TestStack,
  outputs: Outputs,
  workDir: string
}

export const createTestApp = (props: CreateTestAppProps): TestAppConfig => {
  const testPath = expect.getState().testPath;
  const projectName = (global as any).CLOUD_SPEC_PROJECT_NAME;

  if (!testPath) {
    throw new Error('Jest test path not found')
  }

  if (!projectName) {
    throw new Error('Project name not found. Please set CLOUD_SPEC_PROJECT_NAME as global config in jest.')
  }

  // create tmp dir
  const workDir = props.outdir || fs.mkdtempSync(path.join(os.tmpdir(), 'cdk-test-app-'))
  const outdir = path.join(workDir, 'cdk.out')
  const digest = createHash('sha256').update(testPath).digest('hex').substr(0, 8)
  const defaultName = `CloudSpec-${projectName}-${process.env.GITHUB_REF_NAME || process.env.USER}-${digest}`

  const { name = defaultName, creator } = props

  // replace all non-alphanumeric characters with '-'
  const stackName = name.replace(/[^a-zA-Z0-9]/g, '-')

  const app = new cdk.App({ outdir })
  const stack = new TestStack(app, stackName, {})
  stack.tags.setTag('Test', 'true')
  stack.tags.setTag('TestPath', testPath)
  stack.tags.setTag('CloudSpecProjectName', projectName)
  if (process.env.GITHUB_REF_NAME) {
    stack.tags.setTag('GitRefName', process.env.GITHUB_REF_NAME)
  }

  let stackOutputs: Outputs = {}

  const outputsHandler = (outputs: Outputs) => {
    for (const [key, value] of Object.entries(outputs)) {
      new cdk.CfnOutput(stack, key, { value })
    }

    stackOutputs = outputs;

    return outputs
  }

  creator?.(stack, outputsHandler)
  app.synth()
  return {
    outDir: outdir,
    workDir,
    stackName,
    testDir: path.dirname(testPath),
    outputs: stackOutputs,
    stack
  }
}

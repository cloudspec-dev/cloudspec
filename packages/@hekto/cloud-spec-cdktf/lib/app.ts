#!/usr/bin/env node
import 'source-map-support/register'
import * as cdktf from 'cdktf'
import { IManifest } from 'cdktf/lib/manifest'
import { Construct } from 'constructs'
import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'
import { createHash } from 'crypto'

class TestStack extends cdktf.TerraformStack {
  constructor(scope: Construct, id: string) {
    super(scope, id)
  }
}
export type Outputs = Record<string, any>

export interface CreateTestAppProps {
  name?: string
  outdir?: string
  creator?: (app: cdktf.TerraformStack, outputs: (outputs: Outputs) => Outputs) => void
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

  const digest = createHash('sha256').update(testPath).digest('hex').substr(0, 8)
  const defaultName = `CloudSpec-${projectName}-${process.env.GITHUB_REF_NAME || process.env.USER}-${digest}`
  const { name = defaultName, creator } = props

  // replace all non-alphanumeric characters with '-'
  const stackName = name.replace(/[^a-zA-Z0-9]/g, '-')

  const workDir = props.outdir || path.join(path.dirname(testPath), '.cloud-spec', stackName)
  const outdir = workDir

  fs.mkdirSync(outdir, { recursive: true })

  const app = new cdktf.App({ outdir })
  const stack = new TestStack(app, stackName)

  let stackOutputs: Outputs = {}

  const outputsHandler = (outputs: Outputs) => {
    for (const [key, value] of Object.entries(outputs)) {
      new cdktf.TerraformOutput(stack, key, { value, staticId: true })
    }

    stackOutputs = outputs;

    return outputs
  }


  creator?.(stack, outputsHandler)
  app.synth()

  const manifest: IManifest = JSON.parse(fs.readFileSync(path.join(outdir, 'manifest.json'), 'utf-8'))
  const stackWorkDir = path.join(outdir, manifest.stacks[stackName].workingDirectory)

  return {
    outDir: outdir,
    workDir: stackWorkDir,
    stackName,
    testDir: path.dirname(testPath),
    outputs: stackOutputs,
    stack
  }
}

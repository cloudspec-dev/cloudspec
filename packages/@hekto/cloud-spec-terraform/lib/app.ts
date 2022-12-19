#!/usr/bin/env node
import 'source-map-support/register'
import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'
import { createHash } from 'crypto'
import { TerraformConfig } from './terraform-config'

class TestRootModule {
  public config: TerraformConfig

  constructor() {
    this.config = {}
  }

  public merge(config: TerraformConfig) {
    this.config = { ...this.config, ...config }
  }
}
export type Outputs = Record<string, any>

export interface CreateTestAppProps {
  name?: string
  outdir?: string
  creator?: (app: TestRootModule) => void
}

export interface TestAppConfig {
  stackName: string
  outDir: string
  testDir: string
  stack: TestRootModule,
  outputs: Outputs,
  workDir: string,
  configChecksumChanged: boolean
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
  const workDir = props.outdir || path.join(path.dirname(testPath), '.cloud-spec')
  const outdir = workDir
  const digest = createHash('sha256').update(testPath).digest('hex').substr(0, 8)
  const defaultName = `CloudSpec-${projectName}-${process.env.GITHUB_REF_NAME || process.env.USER}-${digest}`

  const { name = defaultName, creator } = props

  // replace all non-alphanumeric characters with '-'
  const stackName = name.replace(/[^a-zA-Z0-9]/g, '-')

  const stack = new TestRootModule()

  let stackOutputs: Outputs = {}

  fs.mkdirSync(workDir, { recursive: true })
  creator?.(stack)

  // checksum the config to detect changes
  const configChecksum = createHash('sha256').update(JSON.stringify(stack.config)).digest('hex')
  const configChecksumPath = path.join(workDir, 'config-checksum')
  let configChecksumChanged = false

  if (fs.existsSync(configChecksumPath)) {
    const oldConfigChecksum = fs.readFileSync(configChecksumPath, 'utf-8')
    if (oldConfigChecksum !== configChecksum) {
      configChecksumChanged = true
    }
  } else {
    configChecksumChanged = true
  }
  fs.writeFileSync(configChecksumPath, configChecksum)
  fs.writeFileSync(path.join(workDir, 'main.tf.json'), JSON.stringify(stack.config, null, 2))

  return {
    outDir: outdir,
    workDir,
    stackName,
    testDir: path.dirname(testPath),
    outputs: stackOutputs,
    stack,
    configChecksumChanged,
  }
}

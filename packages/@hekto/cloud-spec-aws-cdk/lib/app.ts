#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { createHash } from 'crypto';

class TestStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
  }
}

export interface CreateTestAppProps  {
  name?: string;
  outdir?: string;
  creator?: (app: cdk.Stack) => void;
}

export interface TestAppConfig {
  stackName: string;
  outDir: string;
  testDir: string;
}

export const createTestApp = (props: CreateTestAppProps): TestAppConfig => {
  const testPath = expect.getState().testPath;

  if (!testPath) {
    throw new Error('Jest test path not found');
  }

  // create tmp dir
  const outdir = props.outdir || fs.mkdtempSync(path.join(os.tmpdir(), 'cdk-test-app-'));
  const digest = createHash('sha256').update(testPath).digest('hex').substr(0, 8);
  const defaultName = `TestStack-${process.env.GITHUB_REF_NAME || process.env.USER}-${digest}`;

  const { name = defaultName, creator } = props;
  const app = new cdk.App({outdir});
  const stack = new TestStack(app, name, {})
  stack.tags.setTag('Test', 'true');
  stack.tags.setTag('TestPath', testPath);

  creator?.(stack)
  app.synth();
  // console.log({ result })
  return {
    outDir: outdir,
    stackName: name,
    testDir: path.dirname(testPath),
  }
}
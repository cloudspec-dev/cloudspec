#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

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
  name: string;
  outdir: string;
}

export const createTestApp = (props: CreateTestAppProps): TestAppConfig => {
  // create tmp dir
  const outdir = props.outdir || fs.mkdtempSync(path.join(os.tmpdir(), 'cdk-test-app-'));

  const { name = (process.env.GITHUB_REF_NAME ? `TestStack-${process.env.GITHUB_REF_NAME}` : 'TestStack'), creator } = props;
  const app = new cdk.App({outdir});
  const stack = new TestStack(app, name, {})
  creator?.(stack)
  app.synth();
  // console.log({ result })
  return {
    outdir,
    name
  }
}
// import * as cdk from 'aws-cdk-lib'
// import { Aspects, CfnOutput } from 'aws-cdk-lib'
// import { Construct } from 'constructs'
// import { UserPool, ResetCognitoUsers } from '.'
// import { ForceEphemeralResources } from './helper/ephemeral'

// const app = new cdk.App()

// class TestStack extends cdk.Stack {
//   constructor(scope: Construct, id: string, props?: cdk.StackProps) {
//     super(scope, id, props)

//     const pool = new UserPool(this, 'testing').resource

//     const reset = new ResetCognitoUsers(this, 'reset-cognito-users', {
//       userPoolId: pool.userPoolId,
//     })

//     new CfnOutput(this, 'stateMachineArn', {
//       value: reset.resource.stateMachineArn,
//     }).overrideLogicalId('stateMachineArn')
//   }
// }

// const stackName = process.env.GITHUB_REF_NAME ? `CognitoTest-${process.env.GITHUB_REF_NAME}` : 'CognitoTest'
// const stack = new TestStack(app, stackName)
// Aspects.of(stack).add(new ForceEphemeralResources())

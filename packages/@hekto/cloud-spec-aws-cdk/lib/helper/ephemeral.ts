// import { IConstruct } from 'constructs'
// import { IAspect, RemovalPolicy } from 'aws-cdk-lib'
// import { Bucket } from 'aws-cdk-lib/aws-s3'
// import { Table } from 'aws-cdk-lib/aws-dynamodb'
// import { UserPool } from 'aws-cdk-lib/aws-cognito'
// import { Topic } from 'aws-cdk-lib/aws-sns'

// export class ForceEphemeralResources implements IAspect {
//   visit(node: IConstruct) {
//     if (node instanceof Bucket) {
//       node.applyRemovalPolicy(RemovalPolicy.DESTROY)
//       node['enableAutoDeleteObjects']()
//     } else if (node instanceof Table) {
//       node.applyRemovalPolicy(RemovalPolicy.DESTROY)
//     } else if (node instanceof UserPool) {
//       node.applyRemovalPolicy(RemovalPolicy.DESTROY)
//     } else if (node instanceof Topic) {
//       node.applyRemovalPolicy(RemovalPolicy.DESTROY)
//     }
//   }
// }

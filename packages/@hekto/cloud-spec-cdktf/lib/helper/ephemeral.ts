// import { IConstruct } from 'constructs'
// import { IAspect, Annotations } from 'cdktf'
// import { Bucket } from 'aws-cdk-lib/aws-s3'
// import { Table } from 'aws-cdk-lib/aws-dynamodb'
// import { UserPool } from 'aws-cdk-lib/aws-cognito'
// import { Topic } from 'aws-cdk-lib/aws-sns'

// export class ForceEphemeralResourcesAws implements IAspect {
//   visit(node: IConstruct) {
//     if (node instanceof Bucket) {
//       node.
//       Annotations.of(node).addInfo('Changed removal policy to DESTROY')
//     } else if (node instanceof Table) {
//       Annotations.of(node).addInfo('Changed removal policy to DESTROY')
//     } else if (node instanceof UserPool) {
//       Annotations.of(node).addInfo('Changed removal policy to DESTROY')
//     } else if (node instanceof Topic) {
//       Annotations.of(node).addInfo('Changed removal policy to DESTROY')
//     }
//   }
// }

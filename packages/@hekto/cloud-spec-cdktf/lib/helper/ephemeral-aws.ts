import { IConstruct } from 'constructs'
import { IAspect, Annotations } from 'cdktf'
import { EcrRepository } from '@cdktf/provider-aws/lib/ecr-repository'
import { S3Bucket } from '@cdktf/provider-aws/lib/s3-bucket'

export class ForceEphemeralResourcesAws implements IAspect {
  visit(node: IConstruct) {
    if (node instanceof EcrRepository) {
      node.forceDelete = true
      Annotations.of(node).addInfo('Changed removal policy to DESTROY')
    } else if (node instanceof S3Bucket) {
      node.forceDestroy = true
      Annotations.of(node).addInfo('Changed removal policy to DESTROY')
    }
  }
}

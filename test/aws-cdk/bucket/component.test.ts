import { cdkSpec as cloud, createTestApp } from '@hekto/cloud-spec-aws-cdk'
import { CfnOutput } from 'aws-cdk-lib'
import { Bucket } from 'aws-cdk-lib/aws-s3'

const testApp = createTestApp({
  creator: (stack) => {
    const component = new Bucket(stack, 'MyBucket')

    new CfnOutput(stack, 'SfnArn', {
      value: component.bucketName,
    })
  },
})

describe('Repository', () => {
  cloud.setup({
    testApp,
  })

  cloud.test(
    'should be defined',
    async (stackOutputs) => {
      const sfnArn = stackOutputs[testApp.stackName].BucketName
      expect(sfnArn).toEqual(expect.stringMatching(/mybucket/))
    },
    300_000,
  )
})

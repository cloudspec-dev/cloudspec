import { cdkSpec as cloud, createTestApp, ForceEphemeralResources } from '@hekto/cloud-spec-aws-cdk'
import { CfnOutput, Aspects } from 'aws-cdk-lib'
import { Bucket } from 'aws-cdk-lib/aws-s3'

const testApp = createTestApp({
  creator: (stack) => {
    const component = new Bucket(stack, 'MyBucket')

    new CfnOutput(stack, 'BucketName', {
      value: component.bucketName,
    })

    Aspects.of(stack).add(new ForceEphemeralResources())
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
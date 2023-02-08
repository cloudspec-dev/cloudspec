import { cdkSpec as cloud, createTestApp, ForceEphemeralResources } from '@cloudspec/aws-cdk'
import { Aspects } from 'aws-cdk-lib'
import { Bucket } from 'aws-cdk-lib/aws-s3'

const testApp = createTestApp({
  creator: (stack, outputs) => {
    const component = new Bucket(stack, 'MyBucket')

    outputs({
      BucketName: component.bucketName,
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
      const bucketName = stackOutputs.BucketName
      expect(bucketName).toEqual(expect.stringMatching(/mybucket/))
    },
    300_000,
  )
})

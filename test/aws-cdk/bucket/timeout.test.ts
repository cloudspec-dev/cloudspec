import { cdkSpec as cloud, createTestApp, ForceEphemeralResources } from '@hekto/cloud-spec-aws-cdk'
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

describe('Stack', () => {
  cloud.setup({
    testApp,
    setupTimeout: 300_000,
    destroyTimeout: 300_000,
  })

  cloud.test(
    'will be destroyed',
    async (stackOutputs) => {
      const bucketName = stackOutputs.BucketName
      expect(bucketName).toEqual(expect.stringMatching(/mybucket/))
    },
    300_000,
  )
})

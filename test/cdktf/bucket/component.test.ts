import { cdkSpec as cloud, createTestApp } from '@cloudspec/cdktf'
import { s3Bucket, provider } from '@cdktf/provider-aws'

const testApp = createTestApp({
  creator: (stack, outputs) => {
    new provider.AwsProvider(stack, 'default', {})
    const component = new s3Bucket.S3Bucket(stack, 'MyBucket')

    outputs({
      BucketName: component.bucket,
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
      const bucketName = stackOutputs.BucketName.value
      expect(bucketName).toEqual(expect.stringMatching(/terraform/))
    },
    300_000,
  )
})

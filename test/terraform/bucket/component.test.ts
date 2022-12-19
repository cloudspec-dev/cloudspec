import { tfSpec as cloud, createTestApp } from '@hekto/cloud-spec-terraform'
import mainTf from './main.tf'

const testApp = createTestApp({
  creator: (rootModule) => {
    rootModule.merge(mainTf)
    rootModule.merge({
      output: {
        BucketName: [{
          value: "${aws_s3_bucket.bucket.id}",
        }],
      },
    })
  },
})

describe('Repository', () => {
  cloud.setup({
    testApp,
  })

  cloud.test(
    'should be defined',
    async (outputs) => {
      const bucketName = outputs.BucketName.value
      expect(bucketName).toEqual(expect.stringMatching(/test-bucket/))
    },
    300_000,
  )

  it('should be defined', () => {
    expect(mainTf).toBeDefined()
    expect(mainTf).toMatchObject({
      resource: {
        aws_s3_bucket: {
          bucket: [{
            bucket_prefix: expect.stringMatching(/test-bucket/),
            acl: 'private',
          }],
        },
      },
    })
  })
})

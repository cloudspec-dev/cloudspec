import { CloudSpec } from '../lib'
import { Bucket } from 'aws-cdk-lib/aws-s3'

interface Outputs {
  BucketName: string
}

const cloud = new CloudSpec('aws-cdk', __dirname);
const component = new Bucket(cloud.stack, 'MyBucket')
cloud.stack.outputs({
  BucketName: component.bucketName,
} as Outputs)

describe('Repository', () => {
  let outputs: Outputs;

  beforeAll(async () => {
    outputs = await cloud.deploy()
  }, 300_000)

  it('should be defined', async () => {
      const bucketName = outputs.BucketName
      expect(bucketName).toEqual(expect.stringMatching(/mybucket/))
    },
    10_000,
  )
})

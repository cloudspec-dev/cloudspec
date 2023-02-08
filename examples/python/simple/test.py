import unittest
import jsii
import cloudspec.aws_cdk as spec
import aws_cdk.aws_s3 as s3

@jsii.implements(spec.ITestStackCreator)
class TestStack():
    def produce(self, app):
        bucket = s3.Bucket(app, 'myBucket')
        # dict of outputs
        app.outputs({'bucketName': bucket.bucket_name})

cloud = spec.CloudSpec('myStack', TestStack(), __file__)
outputs = cloud.deploy()

class TestMyClass(unittest.TestCase):
    def test_create_bucket(self):
        self.assertEqual(outputs.bucketName, 1)

if __name__ == '__main__':
    unittest.main()
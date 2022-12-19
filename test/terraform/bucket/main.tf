terraform {
  required_version = ">= 0.12.0"

  provider "aws" {
    region = "eu-central-1"
  }
}

resource "aws_s3_bucket" "bucket" {
  bucket_prefix = "test-bucket-a"
  acl    = "private"
}
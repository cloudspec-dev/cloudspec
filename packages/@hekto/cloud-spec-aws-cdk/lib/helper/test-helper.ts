// import { GetObjectCommand, PutObjectCommand, PutObjectCommandOutput, S3Client } from '@aws-sdk/client-s3'
// import { Readable } from 'stream'
// import * as getStream from 'get-stream'

// const client = new S3Client({ region: 'eu-central-1' })

// export const getObject = async (bucket: string, key: string): Promise<Buffer> => {
//   const command = new GetObjectCommand({
//     Bucket: bucket,
//     Key: key,
//   })

//   const result = await client.send(command)

//   // WTF? https://github.com/aws/aws-sdk-js-v3/issues/1877
//   const file_stream = result.Body!
//   if (file_stream instanceof Readable) {
//     const s = await getStream.buffer(file_stream as any)
//     return s
//   } else {
//     throw new Error('Unknown object stream type.')
//   }
// }

// export const putObject = async (
//   bucket: string,
//   key: string,
//   file: string,
//   contentType: string,
// ): Promise<PutObjectCommandOutput> => {
//   const putCommand = new PutObjectCommand({
//     Bucket: bucket,
//     Key: key,
//     Body: file,
//     ContentType: contentType,
//     ContentEncoding: 'utf-8',
//   })

//   const s = await client.send(putCommand)
//   return s
// }

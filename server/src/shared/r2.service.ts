import { Injectable } from '@nestjs/common';
import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
} from '@aws-sdk/client-s3';

@Injectable()
export class R2Service {
  private s3Client: S3Client;
  private bucketName = process.env.R2_BUCKET_NAME;

  constructor() {
    const endpoint = process.env.R2_ENDPOINT;
    const accessKeyId = process.env.R2_ACCESS_KEY_ID;
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
    const bucketName = process.env.R2_BUCKET_NAME;
    if (!endpoint || !accessKeyId || !secretAccessKey || !bucketName) {
      throw new Error(
        'Missing required Cloudflare R2 configurations in environment variables ' +
          '(R2_ENDPOINT, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME).',
      );
    }
    this.bucketName = bucketName;
    this.s3Client = new S3Client({
      region: 'auto',
      endpoint: endpoint,
      credentials: {
        accessKeyId: accessKeyId,
        secretAccessKey: secretAccessKey,
      },
    });
  }

  // Fetches the content of a file from Cloudflare R2 storage using the provided key.
  // This is functional and can be used to retrieve files stored in R2, such as exercise templates or other resources.
  async getFileContent(key: string): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });
      const response = await this.s3Client.send(command);
      if (!response.Body) {
        throw new Error('Response body is empty or undefined.');
      }
      return await response.Body.transformToString();
    } catch (error: any) {
      throw new Error(
        `Cannot download file from R2 (Key: ${key}): ${error.message}`,
      );
    }
  }

  // Uploads a file to Cloudflare R2 storage with the specified filename and content type.
  // This method is functional and can be used to store files in R2, such as user submissions or generated outputs.
  async upFile(file: Buffer, filename: string, Type: string): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: filename,
      Body: file,
      ContentType: Type,
    });
    await this.s3Client.send(command); // Send to R2
    return filename; // return pathfile to save DB
  }
}

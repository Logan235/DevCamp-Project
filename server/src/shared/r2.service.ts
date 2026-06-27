import { Injectable } from '@nestjs/common';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';

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
}

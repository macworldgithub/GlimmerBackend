import { Injectable } from '@nestjs/common';
import { AwsService } from './aws.service';
import * as AWS from 'aws-sdk';
import { v4 as uuid } from 'uuid';
import sharp from 'sharp';

@Injectable()
export class S3Service extends AwsService {
  private s3: AWS.S3;
  private bucketName: string;

  constructor() {
    super();
    AWS.config.update({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION,
    });

    this.s3 = new AWS.S3();
    this.bucketName = process.env.AWS_BUCKET_NAME || 'your-bucket-name';
  }

  async uploadFiles(files: Express.Multer.File[], isVideo: boolean = false): Promise<string[]> {
    const filePaths: string[] = [];

    for (const file of files) {
      try {
        const fileExtension = isVideo ? file.mimetype.split('/')[1] : 'webp';
        const fileKey = `${isVideo ? 'videos' : 'cars'}/${uuid()}.${fileExtension}`;
        
        const buffer = isVideo ? file.buffer : await sharp(file.buffer)
          .toFormat('webp')
          .toBuffer();

        const uploadParams: AWS.S3.PutObjectRequest = {
          Bucket: this.bucketName,
          Key: fileKey,
          Body: buffer,
          ContentType: isVideo ? file.mimetype : 'image/webp',
        };

        await this.s3.upload(uploadParams).promise();
        filePaths.push(fileKey);
      } catch (error:any) {
        console.error(`Error uploading file to S3: ${error.message}`);
      }
    }

    return filePaths;
  }

  async upload_file_by_key(
    file: Express.Multer.File,
    key: string,
  ): Promise<AWS.S3.ManagedUpload.SendData> {
    const params: AWS.S3.PutObjectRequest = {
      Bucket: this.bucketName,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    return this.s3.upload(params).promise();
  }

  async upload_many_files(
    files: Array<Express.Multer.File>,
    path: string,
  ): Promise<string[]> {
    const uploadPromises = files.map(async (file) => {
      const fileKey = `${path}/${uuid()}_${file.originalname}`;

      const params: AWS.S3.PutObjectRequest = {
        Bucket: this.bucketName,
        Key: fileKey,
        Body: file.buffer,
        ContentType: file.mimetype,
      };

      return this.s3
        .upload(params)
        .promise()
        .then((val) => {
          return fileKey;
        });
    });

    return Promise.all(uploadPromises);
  }

  get_path_from_url(url: string): string | null {
    const regex = new RegExp(
      `https://${this.bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/(.*)`,
    );
    const match = url.match(regex);
    return match ? match[1] : null;
  }

  async deleteFileByUrl(url: string): Promise<void> {
    const fileKey = this.get_path_from_url(url);
    if (!fileKey) {
      throw new Error('Invalid S3 URL');
    }

    const params: AWS.S3.DeleteObjectRequest = {
      Bucket: this.bucketName,
      Key: fileKey,
    };

    await this.s3.deleteObject(params).promise();
  }

  async get_image_url(key: string): Promise<string> {
    const params = {
      Bucket: this.bucketName,
      Key: key,
      Expires: 604800, // URL expires in 1 hour
    };

    return this.s3.getSignedUrlPromise('getObject', params);
  }

  async get_image_urls(images_keys: string[]) {
    const image_pre_signed_urls_promises = images_keys.map((key) => {
      return this.get_image_url(key);
    });

    const images_url = await Promise.all(image_pre_signed_urls_promises);

    return images_url;
  }
}

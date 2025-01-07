import { Injectable } from "@nestjs/common";
import { AwsService } from "./aws.service";
import * as AWS from 'aws-sdk';
import { v4 as uuid } from 'uuid';

@Injectable()
export class S3Service extends AwsService {
    private s3: AWS.S3;
    private bucketName: string;

    constructor() {
        super()
        AWS.config.update({
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            region: process.env.AWS_REGION,
        });

        this.s3 = new AWS.S3();
        this.bucketName = process.env.AWS_BUCKET_NAME || 'your-bucket-name';
    }

    async upload_file(file: Express.Multer.File, path: string): Promise<string> {
        const fileKey = `${path}/${uuid()}_${file.originalname}`;

        const params: AWS.S3.PutObjectRequest = {
            Bucket: this.bucketName,
            Key: fileKey,
            Body: file.buffer,
            ContentType: file.mimetype,
        };

        console.log("FILEKEY", fileKey)
        const d = await this.s3.upload(params).promise();
        console.log(d, " file resh ")

        return `https://${this.bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;
    }

    async upload_many_files(files: Array<Express.Multer.File>, path: string): Promise<string[]> {
        const uploadPromises = files.map(async (file) => {
            const fileKey = `${path}/${uuid()}_${file.originalname}`;

            const params: AWS.S3.PutObjectRequest = {
                Bucket: this.bucketName,
                Key: fileKey,
                Body: file.buffer,
                ContentType: file.mimetype,
            };
            console.log("FILEKEY", fileKey)

            return this.s3.upload(params).promise().then((val) => {
                console.log(val, " file resh ")
                return `https://${this.bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;
            });
        });

        return Promise.all(uploadPromises);
    }



    get_path_from_url(url: string): string | null {
        const regex = new RegExp(`https://${this.bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/(.*)`);
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

}

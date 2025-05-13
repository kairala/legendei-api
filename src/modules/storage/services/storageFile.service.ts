import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  StorageFile,
  StorageFileDocument,
} from '../../../db/schemas/storageFile.schema';
import { ConfigService } from '@nestjs/config';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import { Injectable } from '@nestjs/common';

@Injectable()
export class StorageFileService {
  constructor(
    @InjectModel(StorageFile.name)
    private readonly storageFileModel: Model<StorageFileDocument>,
    private readonly configService: ConfigService,
  ) {}

  async upload({
    body,
    fileName,
    contentType,
  }: {
    body: Express.Multer.File;
    fileName: string;
    contentType: string;
  }) {
    const bucketName = this.configService.getOrThrow<string>('AWS_S3_BUCKET');
    const awsRegion = this.configService.getOrThrow<string>('AWS_REGION');
    const client = new S3Client({ region: awsRegion });

    const key = uuidv4();

    const command = new PutObjectCommand({
      Bucket: bucketName,
      ContentType: contentType,
      Key: key,
      Body: body.buffer,
    });

    await client.send(command);

    return this.storageFileModel.create({
      fileName,
      fileType: contentType,
      fileSize: body.size,
      key,
      url: `https://${bucketName}.s3.${awsRegion}.amazonaws.com/${key}`,
    });
  }
}

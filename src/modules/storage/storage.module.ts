import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  StorageFile,
  StorageFileSchema,
} from '../../db/schemas/storageFile.schema';
import { StorageController } from './controller/storage.controller';
import { StorageFileService } from './services/storageFile.service';

@Module({
  controllers: [StorageController],
  providers: [StorageFileService],
  imports: [
    MongooseModule.forFeature([
      { name: StorageFile.name, schema: StorageFileSchema },
    ]),
  ],
  exports: [],
})
export class StorageModule {}

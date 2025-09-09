import { Module } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { DocumentsController } from './documents.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Document, DocumentSchema } from './entities/document.entity';
import { FileStorageService } from './file-storage/file-storage.service';
import { CloudinaryStorageService } from './file-storage/cloudinary-storage.service';


@Module({
  imports: [
    MongooseModule.forFeature([{ name: Document.name, schema: DocumentSchema }]),
  ],
  controllers: [DocumentsController],
  providers: [DocumentsService , CloudinaryStorageService],
  exports: [DocumentsService],
})
export class DocumentsModule {}
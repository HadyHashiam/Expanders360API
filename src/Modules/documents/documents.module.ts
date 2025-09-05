import { Module } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { DocumentsController } from './documents.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Document, DocumentSchema } from './entities/document.entity';
import { FileStorageService } from './file-storage/file-storage.service';


@Module({
  imports: [
    MongooseModule.forFeature([{ name: Document.name, schema: DocumentSchema }]),
  ],
  controllers: [DocumentsController],
  providers: [DocumentsService , FileStorageService],
  exports: [DocumentsService],
})
export class DocumentsModule {}
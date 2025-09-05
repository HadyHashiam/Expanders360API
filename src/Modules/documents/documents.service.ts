import { Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateDocumentDto } from './dto/create-document.dto';
import { SearchDocumentsDto } from './dto/search-documents.dto';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Document } from './entities/document.entity';
import { FileStorageService } from './file-storage/file-storage.service';
import * as handlerFactory from '../../utils/handlerfactory/handler-factory.mongo';

@Injectable()
export class DocumentsService {
  private readonly logger = new Logger(DocumentsService.name);

  constructor(
    @InjectModel(Document.name) private readonly documentModel: Model<Document>,
    private readonly fileStorageService: FileStorageService,
  ) {}

  async createDocument(createDocumentDto: CreateDocumentDto, file?: Express.Multer.File): Promise<Document> {
    const filePath = file ? await this.fileStorageService.uploadFile(file, createDocumentDto.projectId) : undefined;
    const document = new this.documentModel({
      ...createDocumentDto,
      filePath,
    });
    return handlerFactory.createOne(this.documentModel)(document);
  }

  async searchDocuments(searchDocumentsDto: SearchDocumentsDto): Promise<Document[]> {
    try {
      const { projectId, tags, text } = searchDocumentsDto;
      const query: any = {};

      if (projectId) query.projectId = projectId;
      if (tags && tags.length > 0) query.tags = { $all: tags };
      if (text) {
        query.$or = [
          { title: { $regex: text, $options: 'i' } },
          { content: { $regex: text, $options: 'i' } }
        ];
      }

      const documents = await this.documentModel.find(query).exec();
      return documents.map(doc => doc.toJSON());
    } catch (error) {
      this.logger.error(`Failed to search documents: ${error.message}`);
      throw new InternalServerErrorException('Failed to search documents');
    }
  }

  async countDocumentsByProjectIds(projectIds: number[]): Promise<number> {
    try {
      return await this.documentModel.countDocuments({ projectId: { $in: projectIds } }).exec();
    } catch (error) {
      this.logger.error(`Failed to count documents: ${error.message}`);
      throw new InternalServerErrorException('Failed to count documents');
    }
  }

  async getDocumentFilePath(id: string): Promise<string> {
    try {
      const document = await this.documentModel.findById(id).exec();
      if (!document) {
        throw new NotFoundException('Document not found');
      }
      if (!document.filePath) {
        throw new NotFoundException('No file in this document');
      }
      return this.fileStorageService.getFilePath(document.filePath);
    } catch (error) {
      this.logger.error(`Failed to fetch document file path for ID ${id}: ${error.message}`);
      throw error instanceof NotFoundException ? error : new InternalServerErrorException('Failed to fetch document file path');
    }
  }

  async getAllDocuments(query: any) {
    return handlerFactory.getAll(this.documentModel, 'documents')(query);
  }

  async getDocumentById(id: string) {
    return handlerFactory.getOne(this.documentModel)(id);
  }

  async updateDocument(id: string, data: any) {
    return handlerFactory.updateOne(this.documentModel)(id, data);
  }

  async deleteDocument(id: string) {
    return handlerFactory.deleteOne(this.documentModel)(id);
  }
}
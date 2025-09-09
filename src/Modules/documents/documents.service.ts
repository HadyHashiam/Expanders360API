
import { Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateDocumentDto } from './dto/create-document.dto';
import { SearchDocumentsDto } from './dto/search-documents.dto';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Document } from './entities/document.entity';
import { CloudinaryStorageService } from './file-storage/cloudinary-storage.service';
import * as handlerFactory from '../../utils/handlerFactory/handler-factory.mongo';
import { PaginationQuery } from '../../utils/types/types';

@Injectable()
export class DocumentsService {
  private readonly logger = new Logger(DocumentsService.name);

  constructor(
    @InjectModel(Document.name) private readonly documentModel: Model<Document>,
    private readonly cloudinaryStorageService: CloudinaryStorageService,
  ) {}

  async createDocument(createDocumentDto: CreateDocumentDto, file?: Express.Multer.File): Promise<any> {
    let secureUrl: string | undefined;
    let publicId: string | undefined;
    if (file) {
      const uploaded = await this.cloudinaryStorageService.uploadFile(file, createDocumentDto.projectId);
      secureUrl = uploaded.secureUrl;
      publicId = uploaded.publicId;
    }
    const document = new this.documentModel({
      ...createDocumentDto,
      secureUrl,
      publicId,
    });
    const savedDocument = await handlerFactory.createOne(this.documentModel)(document);
    return savedDocument.toJSON();                                                // Convert Mongoose document to plain object
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
          { content: { $regex: text, $options: 'i' } },
        ];
      }

      const documents = await this.documentModel.find(query).exec();
      return documents.map(doc => doc.toJSON());                                        // Convert all documents to plain objects
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
      if (!document.secureUrl) {
        throw new NotFoundException('No file in this document');
      }
      return document.secureUrl;
    } catch (error) {
      this.logger.error(`Failed to fetch document file path for ID ${id}: ${error.message}`);
      throw error instanceof NotFoundException ? error : new InternalServerErrorException('Failed to fetch document file path');
    }
  }

  async getAllDocuments(query: PaginationQuery) {
    const result = await handlerFactory.getAll(this.documentModel, 'documents')(query);
    return {
      status: 'success',
      message: 'Documents retrieved successfully',
      results: result.results,
      pagination: result.pagination,
      data: result.data.map(doc => doc.toJSON()),
    };
  }


  async getDocumentById(id: string) {
    const document = await handlerFactory.getOne(this.documentModel)(id);
    return document ? document.toJSON() : null;                                      // Convert to plain object
  }

  async updateDocument(id: string, data: any) {
    const updatedDocument = await handlerFactory.updateOne(this.documentModel)(id, data);
    return updatedDocument ? updatedDocument.toJSON() : null;                          // Convert to plain object
  }

  async deleteDocument(id: string) {
    const doc = await this.documentModel.findById(id).exec();
    if (doc?.publicId) {
      try {
        await this.cloudinaryStorageService.deleteFile(doc.publicId);
      } catch {}
    }
    return handlerFactory.deleteOne(this.documentModel)(id);
  }
}

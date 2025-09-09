import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DocumentsService } from './documents.service';
import { CloudinaryStorageService } from './file-storage/cloudinary-storage.service';
import { Document } from './entities/document.entity';
import { CreateDocumentDto } from './dto/create-document.dto';
import { SearchDocumentsDto } from './dto/search-documents.dto';
import { PaginationQuery } from '../../utils/types/types';

describe('DocumentsService', () => {
  let service: DocumentsService;
  let documentModel: Model<Document>;
  let cloudinaryStorageService: CloudinaryStorageService;

  const mockDocumentModel = jest.fn().mockImplementation((data) => ({
    ...data,
    save: jest.fn().mockResolvedValue({ ...data, id: '1' }),
    toJSON: jest.fn().mockReturnValue({ ...data, id: '1' })
  }));

  // Add static methods to the constructor
  Object.assign(mockDocumentModel, {
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    countDocuments: jest.fn(),
    create: jest.fn()
  });

  const mockCloudinaryStorageService = {
    uploadFile: jest.fn(),
    deleteFile: jest.fn()
  };

  const mockDocument = {
    id: '1',
    title: 'Test Document',
    content: 'Test content',
    projectId: 1,
    secureUrl: 'https://example.com/file.pdf',
    publicId: 'test-public-id',
    save: jest.fn(),
    toJSON: jest.fn().mockReturnValue({
      id: '1',
      title: 'Test Document',
      content: 'Test content',
      projectId: 1,
      secureUrl: 'https://example.com/file.pdf',
      publicId: 'test-public-id'
    })
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentsService,
        {
          provide: getModelToken(Document.name),
          useValue: mockDocumentModel
        },
        {
          provide: CloudinaryStorageService,
          useValue: mockCloudinaryStorageService
        }
      ],
    }).compile();

    service = module.get<DocumentsService>(DocumentsService);
    documentModel = module.get<Model<Document>>(getModelToken(Document.name));
    cloudinaryStorageService = module.get<CloudinaryStorageService>(CloudinaryStorageService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createDocument', () => {
    it('should create document with file upload', async () => {
      const createDto: CreateDocumentDto = {
        title: 'Test Document',
        content: 'Test content',
        projectId: 1,
        tags: ['test']
      };

      const mockFile = {
        originalname: 'test.pdf',
        buffer: Buffer.from('test content'),
        mimetype: 'application/pdf'
      } as Express.Multer.File;

      const uploadResult = {
        secureUrl: 'https://example.com/file.pdf',
        publicId: 'test-public-id'
      };

      mockCloudinaryStorageService.uploadFile.mockResolvedValue(uploadResult);
      mockDocumentModel.mockReturnValue(mockDocument);
      
      // Mock handlerFactory.createOne
      const mockCreateOne = jest.fn().mockResolvedValue(mockDocument);
      jest.spyOn(require('../../utils/handlerfactory/handler-factory.mongo'), 'createOne').mockReturnValue(mockCreateOne);
      mockDocument.save.mockResolvedValue(mockDocument);

      const result = await service.createDocument(createDto, mockFile);

      expect(mockCloudinaryStorageService.uploadFile).toHaveBeenCalledWith(mockFile, createDto.projectId);
      expect(result).toEqual(mockDocument.toJSON());
    });

    it('should create document without file upload', async () => {
      const createDto: CreateDocumentDto = {
        title: 'Test Document',
        content: 'Test content',
        projectId: 1,
        tags: ['test']
      };

      mockDocumentModel.mockReturnValue(mockDocument);
      
      // Mock handlerFactory.createOne
      const mockCreateOne = jest.fn().mockResolvedValue(mockDocument);
      jest.spyOn(require('../../utils/handlerfactory/handler-factory.mongo'), 'createOne').mockReturnValue(mockCreateOne);
      mockDocument.save.mockResolvedValue(mockDocument);

      const result = await service.createDocument(createDto);

      expect(mockCloudinaryStorageService.uploadFile).not.toHaveBeenCalled();
      expect(result).toEqual(mockDocument.toJSON());
    });
  });

  describe('searchDocuments', () => {
    it('should search documents by projectId', async () => {
      const searchDto: SearchDocumentsDto = {
        projectId: 1
      };

      (mockDocumentModel as any).find.mockReturnValue({
        exec: jest.fn().mockResolvedValue([mockDocument])
      });

      const result = await service.searchDocuments(searchDto);

      expect((mockDocumentModel as any).find).toHaveBeenCalledWith({ projectId: 1 });
      expect(result).toEqual([mockDocument.toJSON()]);
    });

    it('should search documents by tags', async () => {
      const searchDto: SearchDocumentsDto = {
        tags: ['test', 'document']
      };

      (mockDocumentModel as any).find.mockReturnValue({
        exec: jest.fn().mockResolvedValue([mockDocument])
      });

      const result = await service.searchDocuments(searchDto);

      expect((mockDocumentModel as any).find).toHaveBeenCalledWith({
        tags: { $all: ['test', 'document'] }
      });
      expect(result).toEqual([mockDocument.toJSON()]);
    });

    it('should search documents by text', async () => {
      const searchDto: SearchDocumentsDto = {
        text: 'test'
      };

      (mockDocumentModel as any).find.mockReturnValue({
        exec: jest.fn().mockResolvedValue([mockDocument])
      });

      const result = await service.searchDocuments(searchDto);

      expect((mockDocumentModel as any).find).toHaveBeenCalledWith({
        $or: [
          { title: { $regex: 'test', $options: 'i' } },
          { content: { $regex: 'test', $options: 'i' } }
        ]
      });
      expect(result).toEqual([mockDocument.toJSON()]);
    });
  });

  describe('countDocumentsByProjectIds', () => {
    it('should count documents by project IDs', async () => {
      const projectIds = [1, 2, 3];
      const expectedCount = 5;

      (mockDocumentModel as any).countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(expectedCount)
      });

      const result = await service.countDocumentsByProjectIds(projectIds);

      expect((mockDocumentModel as any).countDocuments).toHaveBeenCalledWith({
        projectId: { $in: projectIds }
      });
      expect(result).toBe(expectedCount);
    });
  });

  describe('getDocumentFilePath', () => {
    it('should return document file path', async () => {
      const documentId = '1';
      (mockDocumentModel as any).findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockDocument)
      });

      const result = await service.getDocumentFilePath(documentId);

      expect((mockDocumentModel as any).findById).toHaveBeenCalledWith(documentId);
      expect(result).toBe(mockDocument.secureUrl);
    });

    it('should throw NotFoundException when document not found', async () => {
      const documentId = '1';
      (mockDocumentModel as any).findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null)
      });

      await expect(service.getDocumentFilePath(documentId))
        .rejects.toThrow('Document not found');
    });

    it('should throw NotFoundException when no file in document', async () => {
      const documentId = '1';
      const documentWithoutFile = { ...mockDocument, secureUrl: null };
      (mockDocumentModel as any).findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(documentWithoutFile)
      });

      await expect(service.getDocumentFilePath(documentId))
        .rejects.toThrow('No file in this document');
    });
  });

  describe('getAllDocuments', () => {
    it('should return all documents with pagination', async () => {
      const query: PaginationQuery = { page: 1, limit: 10 };
      const mockResult = {
        results: 1,
        pagination: { page: 1, limit: 10, total: 1 },
        data: [mockDocument]
      };

      // Mock the handlerFactory.getAll function
      const mockGetAll = jest.fn().mockResolvedValue(mockResult);
      jest.spyOn(require('../../utils/handlerfactory/handler-factory.mongo'), 'getAll').mockReturnValue(mockGetAll);

      const result = await service.getAllDocuments(query);

      expect(result.status).toBe('success');
      expect(result.message).toBe('Documents retrieved successfully');
      expect(result.results).toBe(1);
      expect(result.pagination).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
    });
  });

  describe('getDocumentById', () => {
    it('should return document by id', async () => {
      const documentId = '1';

      // Mock the handlerFactory.getOne function
      const mockGetOne = jest.fn().mockResolvedValue(mockDocument);
      jest.spyOn(require('../../utils/handlerfactory/handler-factory.mongo'), 'getOne').mockReturnValue(mockGetOne);

      const result = await service.getDocumentById(documentId);

      expect(result).toEqual(mockDocument.toJSON());
    });
  });

  describe('updateDocument', () => {
    it('should update document', async () => {
      const documentId = '1';
      const updateData = { title: 'Updated Title' };

      // Mock the handlerFactory.updateOne function
      const mockUpdateOne = jest.fn().mockResolvedValue(mockDocument);
      jest.spyOn(require('../../utils/handlerfactory/handler-factory.mongo'), 'updateOne').mockReturnValue(mockUpdateOne);

      const result = await service.updateDocument(documentId, updateData);

      expect(result).toEqual(mockDocument.toJSON());
    });
  });

  describe('deleteDocument', () => {
    it('should delete document and file from cloudinary', async () => {
      const documentId = '1';
      (mockDocumentModel as any).findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockDocument)
      });
      mockCloudinaryStorageService.deleteFile.mockResolvedValue(undefined);

      // Mock the handlerFactory.deleteOne function
      const mockDeleteOne = jest.fn().mockResolvedValue({ message: 'Deleted' });
      jest.spyOn(require('../../utils/handlerfactory/handler-factory.mongo'), 'deleteOne').mockReturnValue(mockDeleteOne);

      const result = await service.deleteDocument(documentId);

      expect((mockDocumentModel as any).findById).toHaveBeenCalledWith(documentId);
      expect(mockCloudinaryStorageService.deleteFile).toHaveBeenCalledWith(mockDocument.publicId);
    });

    it('should delete document without cloudinary file', async () => {
      const documentId = '1';
      const documentWithoutFile = { ...mockDocument, publicId: null };
      (mockDocumentModel as any).findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(documentWithoutFile)
      });

      // Mock the handlerFactory.deleteOne function
      const mockDeleteOne = jest.fn().mockResolvedValue({ message: 'Deleted' });
      jest.spyOn(require('../../utils/handlerfactory/handler-factory.mongo'), 'deleteOne').mockReturnValue(mockDeleteOne);

      const result = await service.deleteDocument(documentId);

      expect(mockCloudinaryStorageService.deleteFile).not.toHaveBeenCalled();
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';
import { JwtAuthGuard } from '../auth/guards/JwtAuthGuard';
import { RolesGuard } from '../auth/guards/RolesGuard';
import { CloudinaryStorageService } from './file-storage/cloudinary-storage.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { SearchDocumentsDto } from './dto/search-documents.dto';
import { Response } from 'express';

describe('DocumentsController', () => {
  let controller: DocumentsController;
  let service: DocumentsService;
  let cloudinaryStorage: CloudinaryStorageService;

  const mockDocumentsService = {
    createDocument: jest.fn(),
    getAllDocuments: jest.fn(),
    searchDocuments: jest.fn(),
    getDocumentById: jest.fn(),
    updateDocument: jest.fn(),
    deleteDocument: jest.fn()
  };

  const mockCloudinaryStorageService = {
    uploadFile: jest.fn(),
    deleteFile: jest.fn()
  };

  const mockResponse = {
    setHeader: jest.fn(),
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
    pipe: jest.fn()
  } as unknown as Response;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DocumentsController],
      providers: [
        {
          provide: DocumentsService,
          useValue: mockDocumentsService
        },
        {
          provide: CloudinaryStorageService,
          useValue: mockCloudinaryStorageService
        }
      ],
    })
    .overrideGuard(JwtAuthGuard)
    .useValue({ canActivate: jest.fn(() => true) })
    .overrideGuard(RolesGuard)
    .useValue({ canActivate: jest.fn(() => true) })
    .compile();

    controller = module.get<DocumentsController>(DocumentsController);
    service = module.get<DocumentsService>(DocumentsService);
    cloudinaryStorage = module.get<CloudinaryStorageService>(CloudinaryStorageService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createDocument', () => {
    it('should create document with file', async () => {
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

      const expectedResult = { id: '1', ...createDto };

      mockDocumentsService.createDocument.mockResolvedValue(expectedResult);

      const result = await controller.createDocument(createDto, mockFile);

      expect(result).toEqual(expectedResult);
      expect(mockDocumentsService.createDocument).toHaveBeenCalledWith(createDto, mockFile);
    });

    it('should create document without file', async () => {
      const createDto: CreateDocumentDto = {
        title: 'Test Document',
        content: 'Test content',
        projectId: 1,
        tags: ['test']
      };

      const expectedResult = { id: '1', ...createDto };

      mockDocumentsService.createDocument.mockResolvedValue(expectedResult);

      const result = await controller.createDocument(createDto);

      expect(result).toEqual(expectedResult);
      expect(mockDocumentsService.createDocument).toHaveBeenCalledWith(createDto, undefined);
    });
  });

  describe('getAllDocuments', () => {
    it('should return all documents', async () => {
      const query = { page: 1, limit: 10 };
      const expectedResult = {
        status: 'success',
        data: [{ id: '1', title: 'Test Document' }],
        pagination: { page: 1, limit: 10, total: 1 }
      };

      mockDocumentsService.getAllDocuments.mockResolvedValue(expectedResult);

      const result = await controller.getAllDocuments(query);

      expect(result).toEqual(expectedResult);
      expect(mockDocumentsService.getAllDocuments).toHaveBeenCalledWith(query);
    });
  });

  describe('searchDocuments', () => {
    it('should search documents', async () => {
      const searchDto: SearchDocumentsDto = {
        projectId: 1,
        text: 'test'
      };

      const mockDocuments = [
        { id: '1', title: 'Test Document', projectId: 1 }
      ];

      mockDocumentsService.searchDocuments.mockResolvedValue(mockDocuments);

      const result = await controller.searchDocuments(searchDto);

      expect(result).toEqual({
        length: 1,
        documents: mockDocuments
      });
      expect(mockDocumentsService.searchDocuments).toHaveBeenCalledWith(searchDto);
    });
  });

  describe('uploadDocument', () => {
    it('should upload document for project', async () => {
      const projectId = '1';
      const body = {
        title: 'Test Document',
        content: 'Test content',
        tags: ['test']
      };

      const mockFile = {
        originalname: 'test.pdf',
        buffer: Buffer.from('test content'),
        mimetype: 'application/pdf'
      } as Express.Multer.File;

      const expectedResult = { id: '1', projectId: 1, ...body };

      mockDocumentsService.createDocument.mockResolvedValue(expectedResult);

      const result = await controller.uploadDocument(projectId, body, mockFile);

      expect(result).toEqual(expectedResult);
      expect(mockDocumentsService.createDocument).toHaveBeenCalledWith(
        { ...body, projectId: 1 },
        mockFile
      );
    });
  });

  describe('getDocumentById', () => {
    it('should return document by id', async () => {
      const documentId = '1';
      const expectedResult = { id: '1', title: 'Test Document' };

      mockDocumentsService.getDocumentById.mockResolvedValue(expectedResult);

      const result = await controller.getDocumentById(documentId);

      expect(result).toEqual(expectedResult);
      expect(mockDocumentsService.getDocumentById).toHaveBeenCalledWith(documentId);
    });
  });

  describe('updateDocument', () => {
    it('should update document', async () => {
      const documentId = '1';
      const updateData = { title: 'Updated Document' };
      const expectedResult = { id: '1', ...updateData };

      mockDocumentsService.updateDocument.mockResolvedValue(expectedResult);

      const result = await controller.updateDocument(documentId, updateData);

      expect(result).toEqual(expectedResult);
      expect(mockDocumentsService.updateDocument).toHaveBeenCalledWith(documentId, updateData);
    });
  });

  describe('deleteDocument', () => {
    it('should delete document', async () => {
      const documentId = '1';
      const expectedResult = { message: 'Document deleted successfully' };

      mockDocumentsService.deleteDocument.mockResolvedValue(expectedResult);

      const result = await controller.deleteDocument(documentId);

      expect(result).toEqual(expectedResult);
      expect(mockDocumentsService.deleteDocument).toHaveBeenCalledWith(documentId);
    });
  });

  describe('downloadDocument', () => {
    it('should download document successfully', async () => {
      const documentId = '1';
      const download = 'true';
      const mockDocument = {
        id: '1',
        title: 'Test Document',
        secureUrl: 'https://example.com/file.pdf',
        publicId: 'test-public-id'
      };

      mockDocumentsService.getDocumentById.mockResolvedValue(mockDocument);

      // Mock https.get
      const mockHttpsGet = jest.fn().mockImplementation((url, callback) => {
        const mockResponse = {
          on: jest.fn().mockImplementation((event, handler) => {
            if (event === 'data') {
              handler(Buffer.from('test file content'));
            } else if (event === 'end') {
              handler();
            }
          }),
          statusCode: 200,
          headers: {
            'content-type': 'application/pdf'
          },
          pipe: jest.fn()
        };
        callback(mockResponse);
        return mockResponse;
      });
      jest.spyOn(require('https'), 'get').mockImplementation(mockHttpsGet);

      await controller.downloadDocument(documentId, download, mockResponse);

      expect(mockDocumentsService.getDocumentById).toHaveBeenCalledWith(documentId);
      expect(mockResponse.setHeader).toHaveBeenCalled();
    });

    it('should throw NotFoundException when document not found', async () => {
      const documentId = '1';
      const download = 'true';

      mockDocumentsService.getDocumentById.mockResolvedValue(null);

      await expect(controller.downloadDocument(documentId, download, mockResponse))
        .rejects.toThrow('Document or file not found');
    });
  });
});


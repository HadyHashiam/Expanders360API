import { Test, TestingModule } from '@nestjs/testing';
import { DocumentsService } from './documents.service';
import { getModelToken } from '@nestjs/mongoose';
import { FileStorageService } from './file-storage/file-storage.service';

describe('DocumentsService', () => {
  let service: DocumentsService;
  let model: any;
  let storage: any;

  beforeAll(async () => {
    model = {
      find: jest.fn().mockReturnThis(),
      exec: jest.fn(),
      countDocuments: jest.fn().mockReturnThis(),
      findById: jest.fn().mockReturnThis(),
    };
    storage = { uploadFile: jest.fn(), getFilePath: jest.fn() };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentsService,
        { provide: getModelToken('Document'), useValue: model },
        { provide: FileStorageService, useValue: storage },
      ],
    }).compile();

    service = module.get<DocumentsService>(DocumentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('searchDocuments: builds query and returns mapped docs', async () => {
    const docs = [{ toJSON: () => ({ id: '1' }) }];
    model.exec.mockResolvedValue(docs);
    const result = await service.searchDocuments({ text: 'x' } as any);
    expect(Array.isArray(result)).toBe(true);
    expect(result[0]).toEqual({ id: '1' });
  });

  it('countDocumentsByProjectIds: returns count', async () => {
    model.exec.mockResolvedValueOnce(5);
    const count = await service.countDocumentsByProjectIds([1, 2]);
    expect(count).toBe(5);
  });

  it('getDocumentFilePath: returns resolved filePath', async () => {
    model.exec.mockResolvedValueOnce({ filePath: '/path' });
    storage.getFilePath.mockReturnValue('/abs/path');
    const res = await service.getDocumentFilePath('id');
    expect(res).toBe('/abs/path');
  });
});



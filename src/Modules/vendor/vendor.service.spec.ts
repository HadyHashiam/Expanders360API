import { Test, TestingModule } from '@nestjs/testing';
import { VendorsService } from './vendor.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vendor } from './entities/vendor.entity';
import { UserType } from '../../utils/enums';

describe('VendorsService', () => {
  let service: VendorsService;
  let vendorRepo: any;

  beforeAll(async () => {
    vendorRepo = {
      findOne: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VendorsService,
        { provide: getRepositoryToken(Vendor), useValue: vendorRepo as Partial<Repository<Vendor>> },
      ],
    }).compile();

    service = module.get<VendorsService>(VendorsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('createVendor: throws on duplicate name', async () => {
    vendorRepo.findOne.mockResolvedValue({ id: 1, name: 'dup' });
    (service as any).factory = { create: jest.fn() };
    await expect(service.createVendor({ name: 'dup' } as any)).rejects.toBeTruthy();
  });

  it('createVendor: returns success on new vendor', async () => {
    vendorRepo.findOne.mockResolvedValue(null);
    const created = { id: 3, name: 'ok' };
    (service as any).factory = { create: jest.fn().mockResolvedValue(created) };
    const result = await service.createVendor({ name: 'ok' } as any);
    expect(result.status).toBe('success');
    expect(result.data).toEqual(created);
  });

  it('getAllVendors: returns factory result mapped', async () => {
    (service as any).factory = {
      getAll: jest.fn().mockResolvedValue({ data: [{ id: 1 }], pagination: { page: 1 } }),
    } as any;
    const res = await service.getAllVendors({ page: 1 } as any);
    expect(res.status).toBe('success');
    expect(res.results).toBe(1);
  });

  it('getVendorById: uses factory.getOne', async () => {
    (service as any).factory = { getOne: jest.fn().mockResolvedValue({ id: 5 }) } as any;
    const res = await service.getVendorById(5);
    expect(res.status).toBe('success');
    expect(res.data).toEqual({ id: 5 });
  });

  it('updateVendor: updates and returns payload', async () => {
    vendorRepo.findOne.mockResolvedValue(null);
    (service as any).factory = {
      getOne: jest.fn().mockResolvedValue({ id: 7, name: 'old' }),
      updateOne: jest.fn().mockResolvedValue({ id: 7, name: 'new' }),
    } as any;
    const res = await service.updateVendor(7, { name: 'new' } as any, { id: 1 } as any);
    expect(res.status).toBe('Success');
    expect(res.data).toEqual({ id: 7, name: 'new' });
  });

  it('deleteVendor: forbids non-admin', async () => {
    await expect(service.deleteVendor(3, { id: 1, userType: UserType.CLIENT } as any)).rejects.toBeTruthy();
  });

  it('deleteVendor: allows admin and calls factory.deleteOne', async () => {
    (service as any).factory = { deleteOne: jest.fn().mockResolvedValue({ message: 'ok' }) } as any;
    const res = await service.deleteVendor(3, { id: 1, userType: UserType.ADMIN } as any);
    expect(res).toEqual({ message: 'ok' });
  });
});



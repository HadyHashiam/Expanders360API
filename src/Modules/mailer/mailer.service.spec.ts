import { Test, TestingModule } from '@nestjs/testing';
import { MailerService } from './mailer.service';
import { MailerService as NestMailerService } from '@nestjs-modules/mailer';

describe('MailerService', () => {
  let service: MailerService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailerService,
        { provide: NestMailerService, useValue: { sendMail: jest.fn() } },
      ],
    }).compile();

    service = module.get<MailerService>(MailerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});



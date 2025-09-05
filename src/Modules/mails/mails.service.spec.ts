import { Test, TestingModule } from '@nestjs/testing';
import { MailsService } from './mails.service';
import { MailerService } from '../mailer/mailer.service';
import { ConfigService } from '@nestjs/config';

describe('MailsService', () => {
  let service: MailsService;
  let mailer: any;

  beforeAll(async () => {
    mailer = { sendMail: jest.fn() };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailsService,
        { provide: MailerService, useValue: mailer },
        { provide: ConfigService, useValue: {} },
      ],
    }).compile();

    service = module.get<MailsService>(MailsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('confirmRegisterUser: sends email with verification link', async () => {
    await service.confirmRegisterUser('u@test.com', 'tok');
    expect(mailer.sendMail).toHaveBeenCalled();
  });
});



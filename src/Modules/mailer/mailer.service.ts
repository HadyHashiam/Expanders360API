import { Injectable, Logger } from '@nestjs/common';
import { MailerService as NestMailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);

  constructor(private readonly mailerService: NestMailerService) {}

  async sendMail(to: string, subject: string, text: string, html?: string): Promise<void> {
    this.logger.debug(`Sending email to ${to} with subject: ${subject}`);
    try {
      await this.mailerService.sendMail({
        to,
        subject,
        text,
        html,
      });
      this.logger.debug(`Email sent successfully to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}: ${error.message}`, error.stack);
      this.logger.error('Error details:', JSON.stringify(error, null, 2)); 
      throw error;
    }
  }
}
import { Injectable } from '@nestjs/common';
import { MailerService } from '../mailer/mailer.service';
import { ConfigService } from '@nestjs/config';
import { getEmailVerificationTemplate } from './templates/email-verification.template';
import { getPasswordResetTemplate } from './templates/password-reset.template';
import { getMatchNotificationTemplate } from './templates/match-notification.template';

@Injectable()
export class MailsService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}
  // Send email verification link
  async confirmRegisterUser(email: string, token: string): Promise<void> {
    const verificationLink = `${ process.env.DOMAIN_URL}/api/v1/auth/verify-email/${token}`;
    const subject = 'Verify Your Email Address';
    const text = `Please verify your email by clicking the following link: ${verificationLink}`;
    const html = getEmailVerificationTemplate(verificationLink);

    await this.mailerService.sendMail(email, subject, text, html);
  }

   // Send password reset code
  async sendPasswordResetEmail(email: string, resetCode: string): Promise<void> {
    const subject = 'Reset Your Password';
    const text = `Your password reset code is: ${resetCode}. This code is valid for 1 hour.`;
    const html = getPasswordResetTemplate(resetCode);

    await this.mailerService.sendMail(email, subject, text, html);
  }

  // Send Match Notification 
  async sendMatchNotification(email: string, projectId: number, newMatchesCount: number, totalMatchesCount: number): Promise<void> {
    const subject = `New Matches for Project ${projectId}`;
    const text = `We have found ${newMatchesCount} new matches for your project (ID: ${projectId}). Total matches: ${totalMatchesCount}. Please login to review them.`;
    const html = getMatchNotificationTemplate(projectId, newMatchesCount, totalMatchesCount);

    await this.mailerService.sendMail(email, subject, text, html);
  }
}
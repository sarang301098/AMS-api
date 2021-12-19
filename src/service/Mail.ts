import { Options as SMTPTransportOptions } from 'nodemailer/lib/smtp-transport';
import nodemailer, { SentMessageInfo } from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';
import { Auth } from 'googleapis';

import config from '../config';
import logger from './log';

export interface MailBody {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

export class MailService {
  private transport: Mail | undefined;
  private static instance: MailService;

  private oauth2Client = new Auth.OAuth2Client({
    clientId:
      '929820003338-9hshs5a26bgndsn1tt1es0dm2gs3ik7u.apps.googleusercontent.com' ||
      config.GMAIL_CLIENT_ID,
    clientSecret: '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' || config.GMAIL_CLIENT_SECRET,
    redirectUri: 'https://developers.google.com/oauthplayground',
  });

  constructor() {
    if (MailService.instance instanceof MailService) {
      return MailService.instance;
    }
    this.transport = this.createTransport();
    MailService.instance = this;
  }

  private async createSmtpTransport() {
    try {
      this.oauth2Client.setCredentials({
        refresh_token:
          '1//04On7W-ViPLKYCgYIARAAGAQSNwF-L9IrSOBlZrtWXfLGPI0MAynpVD-4-ycmhioK8H9Gf5T9h6wmuBdSjUt-UDiP5mw_KzM81UI' ||
          config.GMAIL_REFRESH_TOKEN,
      });
      const accessToken = await this.oauth2Client.getAccessToken();

      if (accessToken && accessToken.token) {
        const options: SMTPTransportOptions = {
          service: 'gmail',
          auth: {
            type: 'OAuth2',
            user: 'sarangp021@gmail.com' || config.GMAIL_USER,
            clientId:
              '929820003338-9hshs5a26bgndsn1tt1es0dm2gs3ik7u.apps.googleusercontent.com' ||
              config.GMAIL_CLIENT_ID,
            clientSecret: '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' || config.GMAIL_CLIENT_SECRET,
            refreshToken:
              '1//04On7W-ViPLKYCgYIARAAGAQSNwF-L9IrSOBlZrtWXfLGPI0MAynpVD-4-ycmhioK8H9Gf5T9h6wmuBdSjUt-UDiP5mw_KzM81UI' ||
              config.GMAIL_REFRESH_TOKEN,
            accessToken:
              'ya29.a0ARrdaM86CRZMKe7VRYTqgaKrud947mX4gFJgKrt0CktnagAS4N5vKaSRj7MCBESV09QOoWWHgsFXOYKugveMRF9DXm2mepre4r29CRnOTYsB0tMVuPFST0VNviwCDxqSM-wiZqQa9bJ81ozdbcnzCd_hjQz8' ||
              accessToken.token,
          },
        };

        return nodemailer.createTransport(options);
      }
    } catch (error) {
      logger.error(error);
    }
  }

  private createTransport() {
    const transport = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: 'sarangp021@gmail.com' || config.GMAIL_USER,
        pass: 'sa30101998' || config.GMAIL_PASSWORD,
      },
    });
    return transport;
  }

  async send({ to, subject, text, html }: MailBody): Promise<SentMessageInfo> {
    const transport = (await this.createSmtpTransport()) || this.transport;
    if (!transport) {
      logger.error(`Transport is not present to send email.`);
      throw new Error(`Transport is not present to send email.`);
    }

    return transport.sendMail({
      from: `Sarang <sarangp021@gmail.com>`,
      to,
      subject,
      text,
      html,
    });
  }
}

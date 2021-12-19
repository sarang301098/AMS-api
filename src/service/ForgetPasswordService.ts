import { getConnection } from 'typeorm';
import randtoken from 'rand-token';
import { utc } from 'moment';
import path from 'path';
import ejs from 'ejs';

import { MailService } from '../service/Mail';
import { generateRandomHex } from './random';
import { BadRequestError } from '../error';
import { Verifications as MongoVerifications } from '../model/mongo/Verifications';
import { Users as MongoUsers } from '../model/mongo/users';
import logger from './log';

interface Request {
  email: string;
}

interface Response {
  message: string;
}

class ForgetPasswordService {
  private static instance: ForgetPasswordService;

  constructor() {
    if (ForgetPasswordService.instance instanceof ForgetPasswordService) {
      return ForgetPasswordService.instance;
    }
    ForgetPasswordService.instance = this;
  }

  public async execute(request: Request): Promise<Response> {
    const { email } = request;

    const mongoConn = getConnection('mongodb');
    const userRepository = mongoConn.getMongoRepository(MongoUsers);

    const user = await userRepository.findOne({ where: { email } });

    if (!user) {
      logger.error(`Invalid email id : [${email}]`);
      throw new BadRequestError('Invalid email id');
    }

    const { link, token } = this.getForgetPasswordLink(user.email as string);

    await this.addVerification(user, token);
    await this.sendMail(user, link);

    const response: Response = {
      message: 'Reset password link has been sent to your email id.',
    };

    return response;
  }

  private async addVerification(user: MongoUsers, token: string) {
    const mongoConn = getConnection('mongodb');
    const verificationsRepository = mongoConn.getMongoRepository(MongoVerifications);

    const verification = verificationsRepository.create({
      id: generateRandomHex(10),
      identifier: user.email as string,
      token,
      expireAt: utc().add(15, 'minutes'),
    });

    await verificationsRepository.save(verification);
  }

  private getForgetPasswordLink(emailId: string) {
    const token = randtoken.uid(16);
    const link = `http://localhost:3000/reset-Password?email=${emailId}&token=${token}`; // url might be differ
    return { link, token };
  }

  private async getMailBody(user: MongoUsers, link: string) {
    const mailBody = {
      to: user.email as string,
      subject: 'Forget Password | Peerbits',
      html: await this.getEmailHtml({
        name: user.username ? user.username : 'Unknown',
        email: user.email ? user.email : '',
        link,
      }),
    };

    return mailBody;
  }

  private async sendMail(user: MongoUsers, link: string) {
    const mailService = new MailService();
    const mailBody = await this.getMailBody(user, link);
    await mailService.send(mailBody);
  }

  private getEmailHtml(templateData: Record<string, string>) {
    return ejs.renderFile(
      path.join(__dirname, '..', '..', 'views', 'forget_password_email.ejs'),
      templateData,
    );
  }
}

export default ForgetPasswordService;

import { getConnection } from 'typeorm';

import { BadRequestError } from '../error';
import { hashPassword } from './password';
import {
  Verifications as MongoVerifications,
  VerificationStatus,
} from '../model/mongo/Verifications';
import { Users as MongoUsers } from '../model/mongo/users';
import logger from './log';

interface Request {
  email: string;
  token: string;
  newPassword: string;
}

interface Response {
  message: string;
}

class UpdatePasswordService {
  private static instance: UpdatePasswordService;

  constructor() {
    if (UpdatePasswordService.instance instanceof UpdatePasswordService) {
      return UpdatePasswordService.instance;
    }
    UpdatePasswordService.instance = this;
  }

  public async execute(request: Request): Promise<Response> {
    const { email, token, newPassword: password } = request;

    const verification = await this.getVerification(email, token);

    if (!verification) {
      logger.error(`Invalid email id : [${email}] or token : [${token}]`);
      throw new BadRequestError('Invalid email id or token', 'INVALID_EMAIL_ID_OR_TOKEN');
    }

    this.validateVerification(verification);

    const mongoConn = getConnection('mongodb');
    const userRepository = mongoConn.getMongoRepository(MongoUsers);
    const verificationsRepository = mongoConn.getMongoRepository(MongoVerifications);

    const user = await userRepository.findOne({
      where: {
        email,
      },
    });

    if (!user) {
      logger.error(`user does not exist with email id : [${email}]`);
      throw new BadRequestError('User does not exist', 'USER_DOES_NOT_EXIST');
    }

    user.password = await hashPassword(password);

    await userRepository.save(user);

    await verificationsRepository.deleteMany({ identifier: email });

    const response: Response = {
      message: 'Password has been changed successfully',
    };

    return response;
  }

  private validateVerification(verification: MongoVerifications) {
    if (verification.status === VerificationStatus.PENDING) {
      logger.error(`verification of token is pending : [${verification.status}]`);
      throw new BadRequestError('verification of token is pending', 'VERIFICATION_PENDING');
    }
  }

  private async getVerification(email: string, token: string) {
    const mongoConn = getConnection('mongodb');
    const verificationsRepository = mongoConn.getMongoRepository(MongoVerifications);

    const verification = await verificationsRepository.findOne({
      where: {
        identifier: email,
        token,
      },
    });

    return verification;
  }
}

export default UpdatePasswordService;

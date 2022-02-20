import { getConnection } from 'typeorm';
import { Server } from 'http';
import WebSocket from 'ws';

import { isAccessToken, verifyToken } from './service/token';
import { BadRequestError, UnauthorizedError } from './error';
import { RedisService } from './service/redis';
import { getAuthCookie } from './utils/cookie';
import { Users as MongoUsers } from './model/mongo/users';
import { Token } from './constants';
import logger from './service/log';

interface TokenPayload {
  iat: number;
  exp: number;
  sub: string;
}

interface SubscriberInfo {
  ws: WebSocket;
  channel: string;
}

export const channelType = 'machine:';

export class WebSocketWrapper {
  private connections: Record<string, SubscriberInfo> = {};
  private wss: WebSocket.Server | null = null;

  private static instance: WebSocketWrapper;

  constructor(private server: Server, private redisService: RedisService) {
    if (WebSocketWrapper.instance instanceof WebSocketWrapper) {
      return WebSocketWrapper.instance;
    }

    this.wss = new WebSocket.Server({ noServer: true });
    this.addWebSocketListener();

    WebSocketWrapper.instance = this;
  }

  init(): void {
    this.server.on('upgrade', async (request, socket, head: Buffer) => {
      try {
        const userInfo = await this.authenticate(request);

        let key = `${channelType}Stop:${userInfo.factoryId}`;
        if (userInfo.machineId && userInfo.machineId !== undefined) {
          key = `${channelType}${userInfo.machineId}`;
        }

        this.wss?.handleUpgrade(request, socket, head, (ws) => {
          this.wss?.emit('connection', ws, request, { ...userInfo, channel: key });
        });
      } catch (error) {
        logger.error('Error in socket connection : ', error);
        socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
        socket.destroy();
      }
    });
  }

  private addWebSocketListener() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.wss?.on('connection', (ws: WebSocket, _: any, client: Record<string, string | number>) => {
      const { userId } = client;

      this.connections[userId] = {
        ws,
        channel: client.channel as string,
      };

      logger.info(`Socket connection established with user : [${userId}]`);
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async authenticateUser(request: any) {
    const authCookie = getAuthCookie(request.headers.cookie as string);
    const authHeader = request.headers.authorization;

    if (!authHeader && !authCookie) {
      logger.error('JWT token is missing');
      throw new Error('JWT token is missing');
    }

    const [, token] = (authCookie || authHeader).split(' ');

    try {
      const decoded = await verifyToken(token, Token.ACCESS);

      if (!isAccessToken(decoded)) {
        logger.error(`Provided token is not valid access token : [${token}]`);
        throw new BadRequestError(
          'Provided token is not valid access token',
          'INVALID_ACCESS_TOKEN',
        );
      }

      const { sub } = decoded as TokenPayload;

      const mongoConn = getConnection('mongodb');
      const userRepository = mongoConn.getMongoRepository(MongoUsers);

      const user = await userRepository.findOne(sub);

      if (!user) {
        logger.info(`user does not exists with user id [${sub}]`);
        throw new UnauthorizedError('User does not exist.');
      }

      request.user = {
        id: sub,
      };

      return user;
    } catch (err) {
      logger.error('Error in socket connection : ', err);
      throw new UnauthorizedError('Invalid JWT token', 'INVALID_TOKEN');
    }
  }

  // TODO
  // private async checkUserAccess(
  //   userInfo: Record<string, string | number | undefined>,
  //   user: Users,
  // ) {

  // }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async authenticate(request: any) {
    if (!request) {
      logger.error('request object missing : ', request);
      throw new Error('request missing');
    }

    const user = await this.authenticateUser(request);

    const userInfo: Record<string, string | number | undefined> = {
      userId: user.id,
    };

    if (!userInfo.factoryId) {
      logger.error('factory id missing');
      throw new Error('factory id missing');
    }

    // await this.checkUserAccess(userInfo, user);

    return userInfo;
  }
}

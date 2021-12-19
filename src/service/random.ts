import crypto from 'crypto';

export const generateRandomHex = (length: number): string =>
  createRandomBytes(length).toString('hex');

const createRandomBytes = (bytes: number): Buffer => crypto.randomBytes(bytes);

import jwt, { type SignOptions } from 'jsonwebtoken';
import type { Role } from '@prisma/client';
import { env } from '../config/env';

export interface JwtPayload {
  sub: string; // user id
  role: Role;
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    algorithm: 'HS256',
    expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn'],
  });
}

export function verifyToken(token: string): JwtPayload {
  // Pin the algorithm so a token is only ever accepted as HS256 — shuts the door
  // on algorithm-confusion forgeries (e.g. a crafted `alg: none` token).
  return jwt.verify(token, env.JWT_SECRET, { algorithms: ['HS256'] }) as JwtPayload;
}

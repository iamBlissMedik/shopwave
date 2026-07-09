import bcrypt from 'bcryptjs';
import type { Role } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { signToken } from '../../lib/jwt';
import { ApiError } from '../../utils/ApiError';
import type { LoginInput, RegisterInput } from './auth.schema';

const SALT_ROUNDS = 10;

/** Shape of the user we are safe to send to clients (never the password hash). */
function toPublicUser(user: {
  id: string;
  name: string;
  email: string;
  role: Role;
  storeName: string | null;
}) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    storeName: user.storeName,
  };
}

export async function register(input: RegisterInput) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) throw ApiError.conflict('An account with this email already exists');

  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      password: passwordHash,
      role: input.role,
      storeName: input.role === 'MERCHANT' ? input.storeName : null,
      // Customers get an empty cart up-front so add-to-cart never has to worry
      // about whether a cart exists. Merchants/admins don't need one.
      ...(input.role === 'USER' ? { cart: { create: {} } } : {}),
    },
  });

  const token = signToken({ sub: user.id, role: user.role });
  return { user: toPublicUser(user), token };
}

export async function login(input: LoginInput) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  // Use the same error for "no user" and "wrong password" to avoid leaking
  // which emails are registered (user enumeration).
  if (!user) throw ApiError.unauthorized('Invalid email or password');

  const valid = await bcrypt.compare(input.password, user.password);
  if (!valid) throw ApiError.unauthorized('Invalid email or password');

  const token = signToken({ sub: user.id, role: user.role });
  return { user: toPublicUser(user), token };
}

export async function getMe(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw ApiError.notFound('User not found');
  return toPublicUser(user);
}

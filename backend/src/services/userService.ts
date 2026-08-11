import prisma from '../config/database';
import { Prisma, Role, UserStatus } from '@prisma/client';
import bcrypt from 'bcrypt';

const excludePassword = (user: any) => {
  const { passwordHash, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

export const getUsers = async ({
  page = 1,
  limit = 10,
  search,
  role,
  status,
}: {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  status?: string;
}) => {
  const skip = (page - 1) * limit;

  const where: Prisma.UserWhereInput = {};

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (role) {
    where.role = role as Role;
  }

  if (status) {
    where.status = status as UserStatus;
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.count({ where }),
  ]);

  return {
    users: users.map(excludePassword),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const createUser = async (data: any) => {
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    throw new Error('EMAIL_EXISTS');
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(data.password, salt);

  const newUser = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      passwordHash,
      role: data.role,
      status: data.status,
    },
  });

  return excludePassword(newUser);
};

export const updateUser = async (id: string, data: any) => {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new Error('USER_NOT_FOUND');

  if (data.email && data.email !== user.email) {
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) throw new Error('EMAIL_EXISTS');
  }

  // Safety check: Cannot deactivate or change role of the last active admin
  if (user.role === Role.ADMIN && (data.status === UserStatus.INACTIVE || (data.role && data.role !== Role.ADMIN))) {
    const activeAdminCount = await prisma.user.count({
      where: { role: Role.ADMIN, status: UserStatus.ACTIVE },
    });
    // If they are the only active admin, block the change
    if (activeAdminCount <= 1 && user.status === UserStatus.ACTIVE) {
      throw new Error('LAST_ADMIN');
    }
  }

  const updatedUser = await prisma.user.update({
    where: { id },
    data: {
      name: data.name,
      email: data.email,
      role: data.role,
      status: data.status,
    },
  });

  return excludePassword(updatedUser);
};

export const resetPassword = async (id: string, newPassword: string) => {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new Error('USER_NOT_FOUND');

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(newPassword, salt);

  await prisma.user.update({
    where: { id },
    data: { passwordHash },
  });

  return { message: 'Password updated successfully' };
};

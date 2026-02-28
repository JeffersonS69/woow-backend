import { Prisma } from '@prisma/client';
import prisma from '../config/prisma';
import { UserResponse } from '../models/user.model';

const safeUserSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  createdAt: true,
  updatedAt: true,
  password: false,
} as const;

export const userRepository = {
  async findByEmail(email: string): Promise<UserResponse | null> {
    return prisma.user.findUnique({
      where: { email },
      select: safeUserSelect,
    });
  },

  async findByEmailWithPassword(email: string) {
    return prisma.user.findUnique({ where: { email } });
  },

  async findById(id: number): Promise<UserResponse | null> {
    return prisma.user.findUnique({
      where: { id },
      select: safeUserSelect,
    });
  },

  async create(data: { name: string; email: string; password: string }): Promise<UserResponse> {
    return prisma.user.create({
      data,
      select: safeUserSelect,
    });
  },

  async update(id: number, data: Prisma.UserUpdateInput): Promise<UserResponse> {
    return prisma.user.update({
      where: { id },
      data,
      select: safeUserSelect,
    });
  },

  async findAll(): Promise<UserResponse[]> {
    return prisma.user.findMany({
      select: safeUserSelect,
      orderBy: { createdAt: 'desc' },
    });
  },

  async emailExistsForOtherUser(email: string, excludeId: number): Promise<boolean> {
    const user = await prisma.user.findUnique({ where: { email } });
    return user !== null && user.id !== excludeId;
  },
};

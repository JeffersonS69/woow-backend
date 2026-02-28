import bcrypt from 'bcryptjs';
import { userRepository } from '../repositories/user.repository';
import { UpdateProfileDto, UserResponse } from '../models/user.model';

const SALT_ROUNDS = 12;

export const userService = {
  async getProfile(userId: number): Promise<UserResponse> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }
    return user;
  },

  async updateProfile(userId: number, data: UpdateProfileDto): Promise<UserResponse> {
    if (data.email) {
      const taken = await userRepository.emailExistsForOtherUser(data.email, userId);
      if (taken) {
        throw new Error('El correo ya está en uso');
      }
    }

    const updateData: Record<string, unknown> = {};
    if (data.name) updateData.name = data.name;
    if (data.email) updateData.email = data.email;
    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, SALT_ROUNDS);
    }

    return userRepository.update(userId, updateData);
  },

  async listUsers(): Promise<UserResponse[]> {
    return userRepository.findAll();
  },
};

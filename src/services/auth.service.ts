import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { userRepository } from '../repositories/user.repository';
import { LoginResponse, UserResponse } from '../models/user.model';

const SALT_ROUNDS = 12;

export const authService = {
  async register(name: string, email: string, password: string): Promise<UserResponse> {
    const existing = await userRepository.findByEmail(email);
    if (existing) {
      throw new Error('El correo electrónico ya está registrado');
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    return userRepository.create({ name, email, password: hashedPassword });
  },

  async login(email: string, password: string): Promise<LoginResponse> {
    const user = await userRepository.findByEmailWithPassword(email);
    if (!user) {
      throw new Error('Credenciales inválidas');
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw new Error('Credenciales inválidas');
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn } as jwt.SignOptions
    );

    const { password: _, ...safeUser } = user;
    return { token, user: safeUser };
  },
};

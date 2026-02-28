import { Request } from 'express';

export interface RegisterDto {
  name: string;
  email: string;
  password: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface UpdateProfileDto {
  name?: string;
  email?: string;
  password?: string;
}

export interface UserResponse {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface JwtPayload {
  userId: number;
  email: string;
  role: string;
}

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

export interface LoginResponse {
  token: string;
  user: UserResponse;
}

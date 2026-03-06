import bcrypt from 'bcryptjs';
import { InternalServerError, BadRequestError } from '../errors/ApiError';

export async function hashPassword(password: string): Promise<string> {
  // Validate password input
  if (!password || typeof password !== 'string') {
    throw new BadRequestError('Invalid password provided', {
      field: 'password',
    });
  }

  if (password.length < 8) {
    throw new BadRequestError('Password must be at least 8 characters long', {
      field: 'password',
      minLength: 8,
    });
  }

  if (password.length > 72) {
    throw new BadRequestError('Password is too long (maximum 72 characters)', {
      field: 'password',
      maxLength: 72,
    });
  }

  try {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
  } catch (error) {
    console.error('Bcrypt hashing error:', error);
    throw new InternalServerError('Failed to hash password', {
      operation: 'hashPassword',
    });
  }
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  if (!hash || !password) return false;

  // Validate inputs
  if (typeof password !== 'string' || typeof hash !== 'string') {
    return false;
  }

  try {
    return await bcrypt.compare(password, hash);
  } catch (error) {
    console.error('Bcrypt comparison error:', error);
    // Don't throw error, just return false for security
    return false;
  }
}

import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createUser, findUserByEmail } from '../services/authService';
import { loginSchema, signupSchema } from '../validation/auth';

export function signup(req: Request, res: Response) {
  const parse = signupSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ message: 'Invalid payload', errors: parse.error.flatten() });
  }

  const existing = findUserByEmail(parse.data.email);
  if (existing) {
    return res.status(409).json({ message: 'Email already registered' });
  }

  const hash = bcrypt.hashSync(parse.data.password, 10);
  const userId = createUser(parse.data.email, hash);
  const token = jwt.sign({ userId }, process.env.JWT_SECRET || 'changeme', { expiresIn: '7d' });

  return res.status(201).json({ token });
}

export function login(req: Request, res: Response) {
  const parse = loginSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ message: 'Invalid payload', errors: parse.error.flatten() });
  }

  const user = findUserByEmail(parse.data.email);
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const ok = bcrypt.compareSync(parse.data.password, user.password_hash);
  if (!ok) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'changeme', { expiresIn: '7d' });
  return res.json({ token });
}

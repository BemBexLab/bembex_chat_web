import jwt from 'jsonwebtoken';

export const generateToken = (id: string, type: string = 'admin') => {
  return jwt.sign({ id, type }, process.env.JWT_SECRET || 'secret', {
    expiresIn: '7d',
  });
};

export const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'secret');
  } catch (error) {
    return null;
  }
};

export const decodeToken = (token: string) => {
  try {
    return jwt.decode(token);
  } catch (error) {
    return null;
  }
};

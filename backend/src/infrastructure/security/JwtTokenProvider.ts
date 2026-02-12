import jwt, { SignOptions } from 'jsonwebtoken';

export interface TokenPayload {
  id: number;
  username: string;
}

export class JwtTokenProvider {
  private readonly secret: string;
  private readonly expiresIn: string;

  constructor(
    secret: string = process.env.JWT_SECRET || 'default-secret-key',
    expiresIn: string = process.env.JWT_EXPIRES_IN || '24h'
  ) {
    this.secret = secret;
    this.expiresIn = expiresIn;
  }

  sign(payload: TokenPayload): string {
    return jwt.sign(payload, this.secret, { expiresIn: this.expiresIn } as SignOptions);
  }

  verify(token: string): TokenPayload {
    return jwt.verify(token, this.secret) as TokenPayload;
  }
}

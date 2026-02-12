import bcryptjs from 'bcryptjs';

export class PasswordHasher {
  private readonly rounds: number;

  constructor(rounds: number = parseInt(process.env.BCRYPT_ROUNDS || '10')) {
    this.rounds = rounds;
  }

  async hash(password: string): Promise<string> {
    return await bcryptjs.hash(password, this.rounds);
  }

  async compare(password: string, hashedPassword: string): Promise<boolean> {
    return await bcryptjs.compare(password, hashedPassword);
  }
}

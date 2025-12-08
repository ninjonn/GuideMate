import { Injectable } from '@nestjs/common';

export interface User {
  userId: number;
  username: string;
  email: string;
  password: string;
  role: string;
  createdAt: Date;
}

@Injectable()
export class UsersService {
  private readonly users: User[] = [
    {
      userId: 1,
      username: 'john',
      email: 'john@example.com',
      password: 'changeme',
      role: 'user',
      createdAt: new Date('2025-01-01T00:00:00Z'),
    },
    {
      userId: 12,
      username: 'maria',
      email: 'maria@example.com',
      password: 'guess',
      role: 'user',
      createdAt: new Date('2025-01-02T00:00:00Z'),
    },
  ];

  async findOneByEmail(email: string): Promise<User | undefined> {
    const user = this.users.find((u) => u.email === email);
    return await Promise.resolve(user);
  }

  async createUser(data: {
    username: string;
    email: string;
    password: string;
  }): Promise<User> {
    const nextId =
      this.users.reduce((max, user) => Math.max(max, user.userId), 0) + 1;
    const newUser: User = {
      userId: nextId,
      username: data.username,
      email: data.email,
      password: data.password,
      role: 'user',
      createdAt: new Date(),
    };
    this.users.push(newUser);
    return await Promise.resolve(newUser);
  }
}

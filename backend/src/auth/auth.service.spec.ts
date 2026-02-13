import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

describe('AuthService', () => {
  const usersService = {
    findOneByEmail: jest.fn(),
    createUser: jest.fn(),
  };
  const jwtService = {
    signAsync: jest.fn(),
  } as unknown as JwtService;

  const service = new AuthService(usersService as any, jwtService);

  const bcryptCompare = bcrypt.compare as jest.Mock;
  const bcryptHash = bcrypt.hash as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    bcryptCompare.mockReset();
    bcryptHash.mockReset();
  });

  it('bejelentkezés – siker', async () => {
    usersService.findOneByEmail.mockResolvedValue({
      userId: 2,
      username: 'Teszt User',
      email: 'a@b.com',
      passwordHash: 'hash',
      role: 'felhasznalo',
      createdAt: new Date(),
    });
    bcryptCompare.mockResolvedValue(true);
    (jwtService.signAsync as jest.Mock).mockResolvedValue('jwt-token');

    const result = await service.signInHu('a@b.com', 'pass');

    expect(result.token).toBe('jwt-token');
    expect(result.felhasznalo).toEqual({
      azonosito: 2,
      nev: 'Teszt User',
      email: 'a@b.com',
      szerepkor: 'felhasznalo',
    });
  });

  it('bejelentkezés – rossz jelszó', async () => {
    usersService.findOneByEmail.mockResolvedValue({
      userId: 1,
      username: 'Teszt User',
      email: 'a@b.com',
      passwordHash: 'hash',
      role: 'felhasznalo',
      createdAt: new Date(),
    });
    bcryptCompare.mockResolvedValue(false);

    await expect(service.signInHu('a@b.com', 'pass')).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('regisztráció – email foglalt', async () => {
    usersService.findOneByEmail.mockResolvedValue({
      userId: 1,
      username: 'Existing',
      email: 'a@b.com',
      passwordHash: 'hash',
      role: 'felhasznalo',
      createdAt: new Date(),
    });

    await expect(
      service.signUpHu('Teszt', 'User', 'a@b.com', 'pass'),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('regisztráció – siker', async () => {
    usersService.findOneByEmail.mockResolvedValue(undefined);
    bcryptHash.mockResolvedValue('hashed-pass');
    usersService.createUser.mockResolvedValue({
      userId: 10,
      username: 'Teszt User',
      email: 'a@b.com',
      passwordHash: 'hashed-pass',
      role: 'felhasznalo',
      createdAt: new Date('2026-01-01T10:00:00.000Z'),
    });

    const result = await service.signUpHu('Teszt', 'User', 'a@b.com', 'pass');

    expect(result).toEqual({
      azonosito: 10,
      nev: 'Teszt User',
      email: 'a@b.com',
      szerepkor: 'felhasznalo',
      regisztracio_datum: '2026-01-01T10:00:00.000Z',
    });

    expect(usersService.createUser).toHaveBeenCalledWith({
      username: 'Teszt User',
      email: 'a@b.com',
      passwordHash: 'hashed-pass',
    });
  });
});

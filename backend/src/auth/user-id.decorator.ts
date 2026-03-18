import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';

type AuthedRequest = Request & { user?: { sub: number; email: string } };

export const UserId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): number => {
    const req = ctx.switchToHttp().getRequest<AuthedRequest>();
    const user = req.user;
    if (!user || !user.sub) {
      throw new UnauthorizedException('Nincs felhasznalo a tokenben.');
    }
    return user.sub;
  },
);

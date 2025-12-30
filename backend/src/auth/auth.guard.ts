import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard as PassportAuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';
import { IS_PUBLIC_KEY } from './public.decorator';

@Injectable()
// JWT guard, a @Public vegpontokat atengedi, minden masnal token szukseges.
export class AuthGuard extends PassportAuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    // Publikus vegpont eseten nincs token ellenorzes.
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Ha @Public, engedjuk a keresztulmenetet.
    if (isPublic) {
      return true;
    }

    // Minden masnal a passport-jwt validal.
    return super.canActivate(context);
  }
}

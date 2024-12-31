import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from './roles.decorator';
import { AuthPayload } from './payloads/auth.payload';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const role = this.reflector.get(Role, context.getHandler());
    if (!role) {
      return true;
    }
    const request = context.switchToHttp().getRequest();

    const user : AuthPayload = request.user;
    console.log(role, user?.role);

    if (user.role === role){
        return true
    }
    return false
  }
}

import { Reflector } from '@nestjs/core';

export const Role = Reflector.createDecorator<string>();
export const Roles = Reflector.createDecorator<string[]>();
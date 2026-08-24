import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const UserId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): number => {
    // Obtiene el objeto de la solicitud HTTP
    const request = ctx.switchToHttp().getRequest();
    // Devuelve el userId del usuario autenticado
    return request.user.userId as number;
  },
);

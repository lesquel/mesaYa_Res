import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { CurrentUserVo } from '../../domain/value-objects/current-user.value-object';

/**
 * Inyecta CurrentUserVo del JWT en parámetro de controlador.
 *
 * @example
 * ```typescript
 * @Get('profile')
 * @UseGuards(JwtAuthGuard)
 * profile(@CurrentUser() user: CurrentUserVo) {
 *   return user.email;
 * }
 * ```
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): CurrentUserVo | undefined => {
    const request = ctx.switchToHttp().getRequest();
    return request.user as CurrentUserVo | undefined;
  },
);

/**
 * Tipo exportado para conveniencia de tipo en controllers.
 * Compatibilidad hacia atrás si hay código que usa CurrentUserPayload.
 *
 * @deprecated Use CurrentUserVo directly instead.
 */
export type CurrentUserPayload = CurrentUserVo;

/**
 * @file auth.interceptor.fn.ts
 * @Version 1.0.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-07-20
 * @Description Standalone HttpInterceptorFn wrapper voor de AuthInterceptor class.
 */
import { HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthInterceptor } from './auth.interceptor';

export const authInterceptorFn: HttpInterceptorFn = (req, next) => {
  // Dit is een adapter die de nieuwe functionele API koppelt aan de bestaande class-based interceptor.
  const handlerAdapter = { handle: (request: HttpRequest<any>) => next(request) };
  return inject(AuthInterceptor).intercept(req, handlerAdapter);
};
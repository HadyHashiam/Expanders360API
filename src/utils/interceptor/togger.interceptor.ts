import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap, map } from 'rxjs';
import { console } from 'node:inspector/promises';

@Injectable()
export class LoggerInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    console.log('-Before route handler');

    // return next.handle().pipe(tap(() => console.log('-After route handler')));
    return next.handle().pipe(
 
    );
  }
}

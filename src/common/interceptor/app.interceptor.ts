import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ResponseDto } from '../dto/response.dto';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  constructor() {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // Get the request object
    const request = context.switchToHttp().getRequest();
    const url = request.url;

    // Regular response wrapping for other endpoints
    return next.handle().pipe(
      map((data: any) => {
        const response: ResponseDto = {
          status: true,
          code: context.switchToHttp().getResponse().statusCode,
          message: data.message,
          data: data.data,
        };

        return response;
      }),
    );
  }
}

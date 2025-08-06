import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Response } from 'express';
import { ResponseDto } from '../dto/response.dto';

@Catch(HttpException)
export class AppException
  extends BaseExceptionFilter
  implements ExceptionFilter
{
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const statusCode = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    const errorResponse: ResponseDto = {
      status: false,
      code: statusCode,
      message: exceptionResponse || (exceptionResponse as any).message,
    };

    if (statusCode == HttpStatus.BAD_REQUEST) {
      errorResponse.errors =
        typeof exceptionResponse.message == 'string'
          ? [exceptionResponse.message]
          : exceptionResponse.message;

      errorResponse.message = exceptionResponse.error;
    }
    if (statusCode == HttpStatus.UNAUTHORIZED) {
      errorResponse.errors =
        typeof exceptionResponse.message == 'string'
          ? [exceptionResponse.message]
          : exceptionResponse.message;

      errorResponse.message = exceptionResponse.error;
    }
    if (statusCode == HttpStatus.FORBIDDEN) {
      errorResponse.errors =
        typeof exceptionResponse.message == 'string'
          ? [exceptionResponse.message]
          : exceptionResponse.message;

      errorResponse.message = exceptionResponse.error;
    }
    if (statusCode == HttpStatus.NOT_FOUND) {
      errorResponse.errors =
        typeof exceptionResponse.message == 'string'
          ? [exceptionResponse.message]
          : exceptionResponse.message;

      errorResponse.message = exceptionResponse.error;
    }
    if (statusCode == HttpStatus.INTERNAL_SERVER_ERROR) {
      errorResponse.errors =
        typeof exceptionResponse.message == 'string'
          ? [exceptionResponse.message]
          : exceptionResponse.message;

      errorResponse.message = exceptionResponse.error;
    }
    return response.status(statusCode).json(errorResponse);
  }
}

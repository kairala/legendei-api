import {
  HttpStatus,
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  NotFoundException,
  ForbiddenException,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export default class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();

    const mongodbCodes = {
      bulkWriteError: 11000,
    };

    console.error(exception);
    console.error(exception.message);

    if (exception.code === mongodbCodes.bulkWriteError) {
      return res.status(HttpStatus.CONFLICT).json({
        statusCode: HttpStatus.CONFLICT,
        message: 'Conflito',
      });
    }

    if (
      exception instanceof NotFoundException ||
      exception instanceof ForbiddenException ||
      exception instanceof UnauthorizedException ||
      exception instanceof BadRequestException ||
      exception instanceof ConflictException ||
      exception.code === 'ValidationException'
    ) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      return res.status(exception.getStatus()).json({
        statusCode: exception.getStatus(),
        message: exception.response,
        error: exception.message,
        exception: exception,
      });
    }

    return res.status(500).json({
      statusCode: 500,
      message: 'InternalServerError',
      error: exception.message,
      exception: exception,
    });
  }
}

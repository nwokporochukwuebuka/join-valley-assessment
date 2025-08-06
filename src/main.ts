import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import helmet from 'helmet';
import * as compression from 'compression';
import * as bodyParser from 'body-parser';
import { ResponseInterceptor } from './common/interceptor/app.interceptor';
import { AppException } from './common/exceptions/app.exception';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();

  app.use(helmet());

  app.use(compression());

  app.use(bodyParser.json({ limit: '5mb' })); // Increase limit
  app.use(bodyParser.urlencoded({ limit: '5mb', extended: true }));

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      stopAtFirstError: true,
    }),
  );

  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalFilters(new AppException());

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();

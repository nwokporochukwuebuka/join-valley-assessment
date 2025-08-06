import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from 'src/common/database/database.module';
import { ProspectModule } from './lib/prospect/prospect.module';
import { configSchema } from 'src/common/config.validation';
import { AiModule } from './lib/ai/ai.module';
import { SequenceModule } from './features/sequence/sequence.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: configSchema,
      validationOptions: { abortEarly: true },
    }),
    DatabaseModule,
    ProspectModule,
    AiModule,
    SequenceModule,
  ],
})
export class AppModule {}

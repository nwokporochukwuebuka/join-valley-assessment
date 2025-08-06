import { Module } from '@nestjs/common';
import { SequenceController } from './sequence.controller';
import { SequenceService } from './sequence.service';
import { ProspectModule } from 'src/app/lib/prospect/prospect.module';
import { AiModule } from 'src/app/lib/ai/ai.module';

@Module({
  controllers: [SequenceController],
  exports: [SequenceService],
  providers: [SequenceService],
  imports: [ProspectModule, AiModule],
})
export class SequenceModule {}

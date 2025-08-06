import { Module } from '@nestjs/common';
import { ProspectiveService } from './prospect.service';

@Module({
  providers: [ProspectiveService],
  exports: [ProspectiveService],
})
export class ProspectModule {}

import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { SequenceService } from './sequence.service';
import { GenerateSequenceDto } from './dto/generate-sequence.dto';

@Controller('api')
export class SequenceController {
  constructor(private sequenceService: SequenceService) {}

  @Post('generate-sequence')
  async generateSequence(@Body() dto: GenerateSequenceDto) {
    const result = await this.sequenceService.generateSequence(dto);
    return {
      message: 'Sequence generated successfully',
      data: result,
    };
  }

  @Get('sequences/:id')
  async getSequence(@Param('id') id: string) {
    const sequence = await this.sequenceService.getSequenceById(id);
    if (!sequence) {
      return {
        success: false,
        error: 'Sequence not found',
      };
    }
    return {
      message: 'Sequence fetched successully',
      data: sequence,
    };
  }
}

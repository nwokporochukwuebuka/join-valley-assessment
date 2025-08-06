import { Injectable } from '@nestjs/common';

import { GenerateSequenceDto } from './dto/generate-sequence.dto';
import { DatabaseService } from 'src/common/database/database.service';
import { ProspectiveService } from 'src/app/lib/prospect/prospect.service';
import { AiService } from 'src/app/lib/ai/ai.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SequenceService {
  constructor(
    private databaseService: DatabaseService,
    private prospectService: ProspectiveService,
    private aiService: AiService,
    private configService: ConfigService,
  ) {}

  async generateSequence(dto: GenerateSequenceDto) {
    // Step 1: Scrape LinkedIn profile
    const prospectData = await this.prospectService.scrapeLinkedInProfile(
      dto.prospectUrl,
    );
    console.log(prospectData);

    // Step 2: Save prospect to database
    const prospect = await this.prospectService.saveProspect(
      prospectData,
      dto.prospectUrl,
    );

    console.log({ prospect });

    // Step 3: Save TOV config
    const tovConfigId = await this.aiService.saveTOVConfig(dto.tovConfig);

    // Step 4: Generate AI prompt
    const prompt = this.aiService.buildPrompt(
      prospectData,
      dto.tovConfig,
      dto.companyContext,
      dto.sequenceLength || 3,
    );

    console.log({ prompt });

    // Step 5: Call AI API
    const aiResult = await this.aiService.generateWithAI(prompt);

    console.log({ aiResult });

    // Step 6: Save AI generation record
    const aiGenerationId = await this.aiService.saveAIGeneration(aiResult);

    if (!aiResult.success) {
      throw new Error(`AI generation failed: ${aiResult.error}`);
    }

    // Step 7: Save message sequence
    const sequence = await this.databaseService.messageSequence.create({
      data: {
        prospectId: prospect.id,
        tovConfigId,
        aiGenerationId,
        companyContext: dto.companyContext,
        messages: aiResult.data!.messages,
        prospectInsights: aiResult.data!.prospectInsights,
      },
    });

    return {
      sequenceId: sequence.id,
      prospectAnalysis: {
        name: prospectData.name,
        company: prospectData.company,
        industry: prospectData.industry,
        seniorityLevel: prospectData.seniorityLevel,
        headline: prospectData.headline,
      },
      thinkingProcess: aiResult.data!.thinkingProcess,
      prospectInsights: aiResult.data!.prospectInsights,
      messages: aiResult.data!.messages,
      aiMetadata: {
        tokensUsed: aiResult.usage,
        estimatedCost: aiResult.cost?.totalCost,
        model: this.configService.get('OPEN_AI_MODEL'),
      },
    };
  }

  async getSequenceById(id: string) {
    return this.databaseService.messageSequence.findUnique({
      where: { id },
      include: {
        prospect: true,
        tovConfig: true,
        aiGeneration: true,
      },
    });
  }
}

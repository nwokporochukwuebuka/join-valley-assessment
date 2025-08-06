import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DatabaseService } from 'src/common/database/database.service';
import axios from 'axios';

export interface TovConfig {
  formality: number;
  warmth: number;
  directness: number;
  technicalDepth?: number;
  urgency?: number;
}

export interface ProspectData {
  name: string;
  headline?: string;
  company?: string;
  industry?: string;
  seniorityLevel?: string;
  location?: string;
}

export interface AiResponse {
  success: boolean;
  data?: {
    thinkingProcess: string;
    prospectInsights: {
      keyChallenges: string[];
      personalizationAngles: string[];
      decisionMakingFactors: string[];
    };
    messages: Array<{
      sequenceNumber: number;
      purpose: string;
      message: string;
      confidenceScore: number;
      reasoning: string;
    }>;
  };
  usage?: {
    promptTokens: number;
    completionTokens: number;
  };
  cost?: {
    totalCost: number;
  };
  error?: string;
}

export interface ProspectAnalysis {
  name: string;
  headline?: string;
  company?: string;
  industry?: string;
  seniorityLevel?: string;
  location?: string;
}

@Injectable()
export class AiService {
  constructor(
    private readonly configService: ConfigService,
    private readonly databaseService: DatabaseService,
  ) {}

  buildTOVInstructions(tovConfig: TovConfig): string {
    const instructions: string[] = [];

    if (tovConfig.formality > 0.7) {
      instructions.push(
        'Use formal, professional language with proper titles and respectful tone',
      );
    } else if (tovConfig.formality > 0.4) {
      instructions.push('Use professional but approachable language');
    } else {
      instructions.push(
        'Use casual, friendly language that feels conversational',
      );
    }

    if (tovConfig.warmth > 0.7) {
      instructions.push(
        'Be genuinely warm and enthusiastic, show personal interest',
      );
    } else if (tovConfig.warmth > 0.4) {
      instructions.push(
        'Be friendly and positive while maintaining professionalism',
      );
    } else {
      instructions.push(
        'Be direct and business-focused with minimal small talk',
      );
    }

    if (tovConfig.directness > 0.7) {
      instructions.push('Get straight to the point, be clear about your ask');
    } else if (tovConfig.directness > 0.4) {
      instructions.push(
        'Balance relationship building with clear business purpose',
      );
    } else {
      instructions.push(
        'Focus heavily on relationship building before making any asks',
      );
    }

    if ((tovConfig.technicalDepth || 0.5) > 0.6) {
      instructions.push(
        'Use industry-specific terminology and demonstrate technical understanding',
      );
    } else {
      instructions.push('Keep language accessible and avoid technical jargon');
    }

    if ((tovConfig.urgency || 0.3) > 0.6) {
      instructions.push(
        'Create appropriate urgency around timing and opportunities',
      );
    } else {
      instructions.push('Take a patient, long-term relationship approach');
    }

    return instructions.join('. ');
  }

  buildPrompt(
    prospect: ProspectData,
    tovConfig: TovConfig,
    companyContext: string,
    sequenceLength: number,
  ): string {
    const tovInstructions = this.buildTOVInstructions(tovConfig);

    return `You are an expert sales professional creating a personalized LinkedIn messaging sequence.

PROSPECT ANALYSIS:
- Name: ${prospect.name}
- Headline: ${prospect.headline || 'N/A'}
- Company: ${prospect.company || 'Unknown'}
- Industry: ${prospect.industry || 'Unknown'}
- Seniority: ${prospect.seniorityLevel || 'mid'}
- Location: ${prospect.location || 'Unknown'}

COMPANY CONTEXT:
${companyContext}

TONE OF VOICE INSTRUCTIONS:
${tovInstructions}

TASK:
Create a ${sequenceLength}-message LinkedIn sequence. Each message should:
1. Be 150-300 characters (LinkedIn message limit consideration)
2. Have a clear, specific purpose
3. Build progressively toward a meeting request
4. Be highly personalized to this specific prospect

THINKING PROCESS:
Before generating messages, explain your reasoning:
1. What specific insights about this prospect inform your approach?
2. How does their seniority level affect your messaging strategy?
3. What pain points might they have that your company solves?
4. How will you sequence the messages to build rapport and trust?

RESPONSE FORMAT:
{
  "thinkingProcess": "Your detailed analysis and strategy...",
  "prospectInsights": {
    "keyChallenges": ["challenge1", "challenge2"],
    "personalizationAngles": ["angle1", "angle2"],
    "decisionMakingFactors": ["factor1", "factor2"]
  },
  "messages": [
    {
      "sequenceNumber": 1,
      "purpose": "Initial connection/value introduction",
      "message": "The actual message text...",
      "confidenceScore": 0.85,
      "reasoning": "Why this approach for message 1..."
    }
  ]
}

Generate the sequence now:`;
  }

  private getMockResponseTemplates() {
    return {
      senior: {
        insights: {
          keyChallenges: [
            'Scaling operations efficiently',
            'Driving strategic growth',
            'Maximizing ROI',
          ],
          personalizationAngles: [
            'Executive-level strategic focus',
            'Proven business outcomes',
            'Industry leadership',
          ],
          decisionMakingFactors: [
            'Clear ROI demonstration',
            'Strategic alignment',
            'Implementation timeline',
          ],
        },
        messages: [
          {
            purpose: 'Initial connection with credibility',
            template:
              "Hi {name}, noticed {company}'s growth in {industry}. {value_prop}. Worth exploring?",
            confidenceBase: 0.85,
          },
          {
            purpose: 'Value reinforcement with social proof',
            template:
              '{name}, following up on our {solution} - helped similar {industry} leaders achieve {outcome}. Happy to share specifics.',
            confidenceBase: 0.82,
          },
          {
            purpose: 'Direct meeting request',
            template:
              '{name}, have 15 minutes this week to show you exactly how we achieved {outcome} for {company_type}. Available Thursday 2-3pm?',
            confidenceBase: 0.88,
          },
        ],
      },
      mid: {
        insights: {
          keyChallenges: [
            'Meeting targets efficiently',
            'Process optimization',
            'Team productivity',
          ],
          personalizationAngles: [
            'Role-specific pain points',
            'Career growth impact',
            'Team success',
          ],
          decisionMakingFactors: [
            'Ease of implementation',
            'Team adoption',
            'Manager buy-in',
          ],
        },
        messages: [
          {
            purpose: 'Warm introduction with value',
            template:
              'Hi {name}! Saw your work at {company} in {industry}. We help {role} professionals like you {benefit}. Curious about your current challenges?',
            confidenceBase: 0.78,
          },
          {
            purpose: 'Problem agitation with solution hint',
            template:
              "{name}, many {industry} {role} managers struggle with {challenge}. We've developed a solution that addresses exactly this - would love your perspective.",
            confidenceBase: 0.75,
          },
          {
            purpose: 'Soft meeting request',
            template:
              "{name}, would you be open to a brief 15-minute chat about how other {role} managers in {industry} are tackling {challenge}? I think you'd find it valuable.",
            confidenceBase: 0.8,
          },
        ],
      },
      junior: {
        insights: {
          keyChallenges: [
            'Learning and development',
            'Proving value',
            'Building relationships',
          ],
          personalizationAngles: [
            'Career development',
            'Skill building',
            'Industry insights',
          ],
          decisionMakingFactors: [
            'Learning opportunity',
            'Career advancement',
            'Ease of use',
          ],
        },
        messages: [
          {
            purpose: 'Friendly introduction',
            template:
              'Hey {name}! Love what {company} is doing in {industry}. We work with {role} professionals to {benefit} - thought you might be interested!',
            confidenceBase: 0.72,
          },
          {
            purpose: 'Educational value offer',
            template:
              "Hi {name}, putting together insights on {industry} trends that impact {role} work. Would you find a brief overview of what we're seeing valuable?",
            confidenceBase: 0.7,
          },
          {
            purpose: 'Casual meeting suggestion',
            template:
              "{name}, would you be up for a quick coffee chat about {industry} trends and how they're affecting {role} work? Always enjoy connecting with professionals at {company}.",
            confidenceBase: 0.74,
          },
        ],
      },
    };
  }

  private personalizeMessage(
    baseMessage: any,
    prospect: ProspectAnalysis,
    tovConfig: TovConfig,
    companyContext: string,
  ) {
    let message = baseMessage.template;

    // Replace placeholders
    message = message.replace(/{name}/g, prospect.name);
    message = message.replace(/{company}/g, prospect.company || 'your company');
    message = message.replace(
      /{industry}/g,
      prospect.industry || 'your industry',
    );
    message = message.replace(
      /{role}/g,
      this.getRoleFromHeadline(prospect.headline || ''),
    );

    // Adjust based on TOV config
    const formalityAdjustment =
      tovConfig.formality > 0.7
        ? 'formal'
        : tovConfig.formality < 0.4
          ? 'casual'
          : 'balanced';
    const warmthLevel =
      tovConfig.warmth > 0.7
        ? 'warm'
        : tovConfig.warmth < 0.4
          ? 'direct'
          : 'professional';

    // Adjust message tone
    if (formalityAdjustment === 'formal') {
      message = message
        .replace(/Hey/g, 'Hello')
        .replace(/!/g, '.')
        .replace(/Love what/g, 'I appreciate what');
    } else if (formalityAdjustment === 'casual') {
      message = message
        .replace(/Hello/g, 'Hey')
        .replace(/noticed/g, 'saw')
        .replace(/Worth exploring/g, 'Worth a chat');
    }

    const confidenceScore =
      baseMessage.confidenceBase +
      tovConfig.directness * 0.1 -
      Math.random() * 0.1;

    return {
      message,
      confidenceScore: Math.round(confidenceScore * 100) / 100,
      reasoning: `Personalized for ${prospect.seniorityLevel} level ${prospect.industry} professional with ${formalityAdjustment} tone and ${warmthLevel} approach.`,
    };
  }

  private getRoleFromHeadline(headline: string): string {
    const roles = [
      'Manager',
      'Director',
      'VP',
      'CEO',
      'CTO',
      'Developer',
      'Engineer',
      'Specialist',
    ];
    for (const role of roles) {
      if (headline.toLowerCase().includes(role.toLowerCase())) {
        return role;
      }
    }
    return 'Professional';
  }

  private generateMockResponse(
    prospect: ProspectAnalysis,
    tovConfig: TovConfig,
    companyContext: string,
    sequenceLength: number,
  ): AiResponse {
    const mockResponses = this.getMockResponseTemplates();

    // Select response template based on seniority level
    const templateKey = prospect.seniorityLevel || 'mid';
    const template = mockResponses[templateKey] || mockResponses['mid'];

    // Generate messages based on sequence length and TOV
    const messages: Array<{
      sequenceNumber: number;
      purpose: string;
      message: string;
      confidenceScore: number;
      reasoning: string;
    }> = [];
    for (let i = 1; i <= sequenceLength; i++) {
      const baseMessage =
        template.messages[Math.min(i - 1, template.messages.length - 1)];
      const personalizedMessage = this.personalizeMessage(
        baseMessage,
        prospect,
        tovConfig,
        companyContext,
      );

      messages.push({
        sequenceNumber: i,
        purpose: baseMessage.purpose,
        message: personalizedMessage.message,
        confidenceScore: personalizedMessage.confidenceScore,
        reasoning: personalizedMessage.reasoning,
      });
    }

    return {
      success: true,
      data: {
        thinkingProcess: this.buildThinkingProcess(
          prospect,
          tovConfig,
          companyContext,
        ),
        prospectInsights: {
          keyChallenges: template.insights.keyChallenges,
          personalizationAngles: template.insights.personalizationAngles,
          decisionMakingFactors: template.insights.decisionMakingFactors,
        },
        messages,
      },
      usage: {
        promptTokens: 450,
        completionTokens: 280,
      },
      cost: { totalCost: 0.00089 },
    };
  }

  private buildThinkingProcess(
    prospect: ProspectAnalysis,
    tovConfig: TovConfig,
    companyContext: string,
  ): string {
    return (
      `Analyzing ${prospect.name} at ${prospect.company}: This is a ${prospect.seniorityLevel}-level professional in ${prospect.industry}. ` +
      `Based on TOV config (formality: ${tovConfig.formality}, warmth: ${tovConfig.warmth}, directness: ${tovConfig.directness}), ` +
      `I'll use a ${tovConfig.formality > 0.7 ? 'formal' : 'approachable'} tone with ${tovConfig.directness > 0.7 ? 'direct' : 'gradual'} messaging. ` +
      `Company context suggests focus on ${companyContext.includes('SaaS') ? 'software solutions' : 'business outcomes'}.`
    );
  }

  async generateWithAI(prompt: string): Promise<AiResponse> {
    const openaiKey = await this.configService.get('OPEN_AI_API_KEY');

    if (!openaiKey) {
      // Extract mock parameters from the prompt or set default mock data
      const mockProspect: ProspectAnalysis = {
        name: 'John Doe',
        headline: 'VP of Sales',
        company: 'Acme Corp',
        industry: 'Software',
        seniorityLevel: 'senior',
        location: 'San Francisco',
      };
      const mockTovConfig: TovConfig = {
        formality: 0.8,
        warmth: 0.7,
        directness: 0.6,
        technicalDepth: 0.5,
        urgency: 0.3,
      };
      const mockCompanyContext =
        'Leading SaaS provider for enterprise solutions.';
      const mockSequenceLength = 3;

      return this.generateMockResponse(
        mockProspect,
        mockTovConfig,
        mockCompanyContext,
        mockSequenceLength,
      );
    }
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: this.configService.get('OPEN_AI_MODEL'),
          messages: [
            {
              role: 'system',
              content:
                'You are an expert sales professional. Always respond with valid JSON matching the requested format.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: +this.configService.get('OPEN_AI_TEMPERATURE'),
          max_tokens: +this.configService.get('OPEN_AI_MAX_TOKENS'),
        },
        {
          headers: {
            Authorization: `Bearer ${this.configService.get('OPENAI_API_KEY')}`,
            'Content-Type': 'application/json',
          },
        },
      );

      const content = (response.data as any).choices[0].message.content;
      const usage = (response.data as any).usage;

      try {
        const parsed = JSON.parse(content);
        return {
          success: true,
          data: parsed,
          usage: {
            promptTokens: usage.prompt_tokens,
            completionTokens: usage.completion_tokens,
          },
          cost: {
            totalCost: this.calculateCost(usage),
          },
        };
      } catch (parseError) {
        return {
          success: false,
          error: 'Invalid JSON response from AI',
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message,
      };
    }
  }

  private calculateCost(usage: any): number {
    const inputCostPer1k = 0.0015;
    const outputCostPer1k = 0.002;

    const inputCost = (usage.prompt_tokens / 1000) * inputCostPer1k;
    const outputCost = (usage.completion_tokens / 1000) * outputCostPer1k;

    return inputCost + outputCost;
  }

  async saveTOVConfig(tovConfig: TovConfig): Promise<string> {
    const result = await this.databaseService.tovConfig.create({
      data: {
        formality: tovConfig.formality,
        warmth: tovConfig.warmth,
        directness: tovConfig.directness,
        technicalDepth: tovConfig.technicalDepth || 0.5,
        urgency: tovConfig.urgency || 0.3,
      },
    });

    return result.id;
  }

  async saveAIGeneration(generationData: AiResponse): Promise<string> {
    const result = await this.databaseService.aiGeneration.create({
      data: {
        modelUsed: this.configService.getOrThrow('OPEN_AI_MODEL'),
        promptTokens: generationData.usage?.promptTokens || 0,
        completionTokens: generationData.usage?.completionTokens || 0,
        totalCost: generationData.cost?.totalCost || 0,
        thinkingProcess: generationData.data?.thinkingProcess || '',
        rawResponse: JSON.stringify(generationData),
        success: generationData.success,
        errorMessage: generationData.error || null,
      },
    });

    return result.id;
  }
}

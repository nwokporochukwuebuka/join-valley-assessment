### LinkedIn Prospect Messaging API

NestJS + Prisma implementation that generates personalized LinkedIn messaging sequences using AI (with mock fallback).

## Quick Start

```bash
npm install
npx prisma generate && npx prisma migrate dev --name initdb
npm run start:dev
```

### Test endpoint:

LIVE URL: https://join-valley-assessment.onrender.com/v1/api/generate-sequence

```bash
curl -X POST http://localhost:3000/v1/api/generate-sequence \
 -H "Content-Type: application/json" \
 -d '{
    "prospectUrl": "https://linkedin.com/in/test",
    "tovConfig": {"formality": 0.8, "warmth": 0.6, "directness": 0.7},
    "companyContext": "We help SaaS companies automate sales",
    "sequenceLength": 3
    }'
```

### Database Schema Decisions

Core Tables

```sql
prospects (id, name, company, industry, seniority_level, linkedin_url, raw_data)
tov_configs (id, formality, warmth, directness, technical_depth, urgency)
ai_generations (id, model_used, tokens, cost, thinking_process, success)
message_sequences (id, prospect_id, tov_config_id, messages, insights)
```

### Key Design Choices

#### 1. Separated TOV Configs

- **Why**: Enable A/B testing different tone combinations
- **Benefit**: Analytics on which TOV parameters work best by industry/seniority
- **Trade-off**: Extra table vs embedded JSON (chose reusability over simplicity)

#### 2. JSONB for Messages & Insights

```typescript
messages: [
  {
    sequenceNumber: 1,
    purpose: 'Initial connection',
    message: '...',
    confidenceScore: 0.85,
    reasoning: '...',
  },
];
```

- **Why**: Message structure varies (confidence, reasoning, metadata)
- **Benefit**: Flexible schema evolution, complex queries still possible
- **Alternative considered**: Normalized tables (rejected due to over-engineering)

#### 3. AI Generations Table

- **Purpose**: Cost tracking, debugging failed generations, model comparison
- **Critical for**: Budget control and prompt optimization

### AI Integration Patterns

#### 1. TOV Parameter Translation

```typescript
// Convert 0.8 formality → "Use formal, professional language with proper titles"
buildTOVInstructions(tovConfig: TovConfig): string {
  if (tovConfig.formality > 0.7) return "formal, professional language";
  if (tovConfig.formality > 0.4) return "professional but approachable";
  return "casual, friendly language";
}
```

#### 2. Prompt Engineering Strategy

```typescript
const prompt = `PROSPECT: ${prospect.name} at ${prospect.company} (${prospect.seniorityLevel})
TOV: ${tovInstructions}  
TASK: Create ${sequenceLength} messages
FORMAT: Return JSON with thinking_process, messages array`;
```

- **Structured input**: Clear sections (prospect, context, instructions)
- **Forced reasoning**: AI must explain thinking before generating
- **JSON schema**: Reduces parsing errors, enables validation

#### 3. Error Handling & Fallbacks

```typescript
async generateSequence() {
  if (!openaiKey) return generateMockResponse(); // No key fallback

  try {
    const aiResult = await callOpenAI();
    return parseAndValidate(aiResult);
  } catch (error) {
    return generateMockResponse(); // API failure fallback
  }
}
```

## Data Flow Implementation

#### LinkedIn URL → Profile Analysis

```typescript
// Primary: Web scraping with Cheerio
// Fallback: URL-based name extraction + mock data
// Production: Use LinkedIn Sales Navigator API
```

#### TOV Translation → AI Generation

```typescript
// 1. Convert numbers to natural language instructions
// 2. Build structured prompt with clear sections
// 3. Include thinking process requirement
// 4. Specify JSON response format
```

#### Database Storage

```typescript
// Atomic transaction: prospect → tov_config → ai_generation → sequence
// Foreign key relationships maintain data integrity
// JSONB enables flexible message storage
```

#### API Design & Validation

##### Input Validation

```typescript
class TovConfigDto {
  @IsNumber() @Min(0) @Max(1) formality: number;
  @IsNumber() @Min(0) @Max(1) warmth: number;
  // ... validates TOV parameters are in valid range
}
```

##### Response Structure

```typescript
{
status: boolean,
code: 200,
data: {
    sequenceId: string,
    prospectAnalysis: {...}, // Always returned
    thinkingProcess: string, // AI transparency
    messages: [...], // Core output
    aiMetadata: { // Cost tracking
    tokensUsed, estimatedCost, isMockData
    }
  }
}
```

#### Error Handling

- **Partial success**: Return prospect analysis even if AI fails
- **Graceful degradation**: Mock responses when API unavailable
- **Structured errors**: Consistent error format with details

#### Scaling Considerations

##### Performance

- **Database**: Indexes on company, industry, seniority_level
- **JSONB queries**: GIN indexes for message content searches
- **Connection pooling**: Prisma handles DB connections efficiently

##### Cost Optimization

- **Token tracking**: Monitor prompt efficiency vs output quality
- **Model selection**: Easy swap between GPT-3.5/GPT-4 based on needs
- **Caching**: Prospect data changes infrequently (implement Redis)

#### Horizontal Scaling

- **Stateless design**: Each request independent
- **Queue system**: Bull/Redis for heavy AI processing
- **Microservices**: Easy to extract AI service separately

#### What I'd Improve with More Time

##### Immediate (2-4 hours)

- **LinkedIn Integration**: Proper API instead of scraping
- **Prompt Optimization**: Few-shot examples, chain-of-thought
- **Retry Logic**: Exponential backoff for API failures

##### Medium-term (1-2 weeks)

- **A/B Testing Framework**: Compare prompt strategies
- **Performance Tracking**: Integration with email/LinkedIn tools
- **Advanced Personalization**: Company news, social activity

#### Architecture Alternatives Considered

##### 1. Event-Driven Architecture

- **Pros**: Better scalability, async processing
- **Cons**: Added complexity for 4-hour constraint
- **Decision**: Chose synchronous for simplicity

##### 2. Embedded vs Separate AI Service

- **Current**: Embedded in main service
- **Production**: Extract to separate service for scaling
- **Trade-off**: Simplicity now vs flexibility later

##### Technical Discussion Points

**Ready to discuss:**

- Database normalization trade-offs (JSONB vs tables)
- Prompt engineering techniques for consistency
- Cost vs quality optimization strategies
- Scaling patterns for AI workflows
- Error handling in distributed systems
- Alternative approaches and their trade-offs

The implementation demonstrates production-ready patterns while remaining pragmatic for the time constraint.

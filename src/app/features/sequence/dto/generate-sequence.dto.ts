import {
  IsString,
  IsUrl,
  IsObject,
  ValidateNested,
  IsNumber,
  Min,
  Max,
  IsOptional,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

class TovConfigDto {
  @IsNumber()
  @Min(0)
  @Max(1)
  formality: number;

  @IsNumber()
  @Min(0)
  @Max(1)
  warmth: number;

  @IsNumber()
  @Min(0)
  @Max(1)
  directness: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  technicalDepth?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  urgency?: number;
}

export class GenerateSequenceDto {
  @IsUrl({}, { message: 'prospect_url must be a valid URL' })
  prospectUrl: string;

  @ValidateNested()
  @Type(() => TovConfigDto)
  tovConfig: TovConfigDto;

  @IsString()
  @Transform(({ value }) => value?.trim())
  companyContext: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  sequenceLength?: number = 3;
}

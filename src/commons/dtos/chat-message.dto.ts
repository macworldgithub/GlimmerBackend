import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ChatMessageDto {
  @IsNotEmpty()
  @IsString()
  sessionId!: string;

  @IsNotEmpty()
  @IsString()
  message!: string;

  @IsOptional()
  @IsString()
  keyword?: string;
}

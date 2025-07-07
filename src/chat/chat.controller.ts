import { Controller, Post, Body } from '@nestjs/common';
import { ChatService } from './chat.services';
import { CreateLeadDto } from 'src/commons/dtos/chat-lead.dto';
import { ChatMessageDto } from 'src/commons/dtos/chat-message.dto';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('message')
  async handleMessage(@Body() chatMessageDto: ChatMessageDto) {
    console.log('Chat DTO:', chatMessageDto);
    const { message, sessionId } = chatMessageDto;
    const botReply = await this.chatService.getBotResponse(message);
    await this.chatService.saveChatLog(sessionId, message, 'user');
    await this.chatService.saveChatLog(sessionId, botReply, 'bot');
    return { reply: botReply };
  }

  @Post('lead')
  async handleLead(@Body() leadDto: CreateLeadDto) {
    return this.chatService.saveLead(leadDto);
  }
}

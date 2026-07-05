import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { AiMirrorService } from './ai-mirror.service';
import { AiMirrorChatDto } from './dto/ai-mirror-chat.dto';

interface RequestWithUser {
  user: {
    userId: string;
    email?: string;
  };
}

@Controller('ai-mirror')
@UseGuards(JwtAuthGuard)
export class AiMirrorController {
  constructor(private readonly aiMirrorService: AiMirrorService) {}

  @Post('chat')
  async chat(@Request() req: RequestWithUser, @Body() dto: AiMirrorChatDto) {
    return this.aiMirrorService.chat(req.user.userId, dto);
  }
}

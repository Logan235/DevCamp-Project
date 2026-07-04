import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { JudgeService } from './judge.service';
import { JudgeController } from './judge.controller';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
  ],
  providers: [JudgeService],
  exports: [JudgeService],
  controllers: [JudgeController],
})
export class JudgeModule {}

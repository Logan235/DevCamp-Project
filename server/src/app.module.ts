import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq'; // Đã import BullModule
import { UserModule } from './users/user.module';
import { AuthModule } from './auth/auth.module';
import { TestModule } from './test/test.module';
import { RoadmapModule } from './roadmap/roadmap.module';
import { ExerciseModule } from './exercise/exercise.module';
import { CodeExecutionModule } from './code-execution/code-execution.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri:
          configService.get<string>('mongoUrl') || // Hãy check lại xem trong .env viết là mongoUrl hay MONGO_URL nhé
          'mongodb://localhost:27017/FESSIORDEVCAMP_BACKEND',
      }),
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get<string>('REDIS_HOST') || 'localhost',
          port: configService.get<number>('REDIS_PORT') || 6379,
        },
      }),
    }),

    UserModule,
    AuthModule,
    TestModule,
    RoadmapModule,
    ExerciseModule,
    CodeExecutionModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { UserModule } from './users/user.module';
import { AuthModule } from './auth/auth.module';
import { TestModule } from './test/test.module';
import { RoadmapModule } from './roadmap/roadmap.module';
import { ExerciseModule } from './exercise/exercise.module';
import { CodeExecutionModule } from './code-execution/code-execution.module';
import path from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [
        path.resolve(__dirname, '../../.env'),
        path.resolve(__dirname, '../.env'),
        '.env',
      ],
      isGlobal: true,
    }),

    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri:
          configService.get<string>('MONGO_URL') ||
          configService.get<string>('MONGO_URI') ||
          configService.get<string>('MONGODB_URI') ||
          configService.get<string>('mongoUrl') ||
          'mongodb://127.0.0.1:27017/FESSIORDEVCAMP_BACKEND', 
      }),
    }),

    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const redisUrl = configService.get<string>('REDIS_URL');

        if (redisUrl) {
          return {
            connection: {
              url: redisUrl,
            },
          };
        }

        const redisTls = configService.get<string>('REDIS_TLS') === 'true';

        return {
          connection: {
            host: configService.get<string>('REDIS_HOST') || 'localhost',
            port: Number(configService.get<string>('REDIS_PORT')) || 6379,
            password: configService.get<string>('REDIS_PASSWORD') || undefined,
            tls: redisTls ? {} : undefined,
          },
        };
      },
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

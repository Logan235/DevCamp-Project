import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { JwtPayload } from '../../interfaceFile/interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:
        configService.get<string>('JWT_SECRET') || 'default_backup_secret',
    });

    if (!configService.get<string>('JWT_SECRET')) {
      console.warn('JWT_SECRET is not defined in env variables!');
    }
  }

  // This is method that will be called by Passport after it verifies the JWT token. The payload parameter contains the decoded JWT payload.
  validate(payload: JwtPayload) {
    return { userId: payload.userId, email: payload.email, role: payload.role };
  }
}

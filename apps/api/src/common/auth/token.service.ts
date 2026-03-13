import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac, timingSafeEqual } from 'crypto';

type TokenPayload = {
  sub: string;
  email: string;
  name: string;
  exp: number;
  iat: number;
};

type AuthenticatedUser = {
  id: string;
  email: string;
  name: string;
};

@Injectable()
export class TokenService {
  constructor(private readonly configService: ConfigService) {}

  issueToken(user: AuthenticatedUser): string {
    const now = Math.floor(Date.now() / 1000);
    const payload: TokenPayload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      iat: now,
      exp: now + 60 * 60 * 24 * 7,
    };

    const encodedHeader = this.base64UrlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const encodedPayload = this.base64UrlEncode(JSON.stringify(payload));
    const signature = this.sign(`${encodedHeader}.${encodedPayload}`);

    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }

  verifyToken(token: string): AuthenticatedUser {
    const [encodedHeader, encodedPayload, signature] = token.split('.');

    if (!encodedHeader || !encodedPayload || !signature) {
      throw new UnauthorizedException('Malformed bearer token');
    }

    const expectedSignature = this.sign(`${encodedHeader}.${encodedPayload}`);
    const incomingSignature = Buffer.from(signature);
    const validSignature = Buffer.from(expectedSignature);

    if (incomingSignature.length !== validSignature.length || !timingSafeEqual(incomingSignature, validSignature)) {
      throw new UnauthorizedException('Invalid bearer token signature');
    }

    const header = JSON.parse(this.base64UrlDecode(encodedHeader)) as { alg?: string; typ?: string };
    if (header.alg !== 'HS256' || header.typ !== 'JWT') {
      throw new UnauthorizedException('Unsupported bearer token');
    }

    const payload = JSON.parse(this.base64UrlDecode(encodedPayload)) as Partial<TokenPayload>;

    if (!payload.sub || !payload.email || !payload.name || !payload.exp) {
      throw new UnauthorizedException('Invalid bearer token payload');
    }

    if (payload.exp < Math.floor(Date.now() / 1000)) {
      throw new UnauthorizedException('Bearer token expired');
    }

    return {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
    };
  }

  private sign(value: string): string {
    return createHmac('sha256', this.getSecret()).update(value).digest('base64url');
  }

  private getSecret(): string {
    return this.configService.get<string>('JWT_SECRET') ?? 'labops-dev-secret-change-me';
  }

  private base64UrlEncode(value: string): string {
    return Buffer.from(value, 'utf8').toString('base64url');
  }

  private base64UrlDecode(value: string): string {
    return Buffer.from(value, 'base64url').toString('utf8');
  }
}

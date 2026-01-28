import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) { }

  async login(loginDto: LoginDto): Promise<{ access_token: string }> {
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (loginDto.password !== adminPassword) {
      throw new UnauthorizedException('비밀번호가 일치하지 않습니다.');
    }

    const payload = { role: 'admin', sub: 'admin' };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async validateToken(payload: any): Promise<any> {
    if (payload.role === 'admin') {
      return { role: 'admin' };
    }
    return null;
  }
}

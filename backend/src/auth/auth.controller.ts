import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('api/auth')
export class AuthController {
  constructor(private authService: AuthService) { }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const result = await this.authService.login(loginDto);
    return {
      success: true,
      message: '로그인 성공',
      data: result,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('verify')
  async verify() {
    return {
      success: true,
      message: '유효한 토큰입니다.',
    };
  }
}

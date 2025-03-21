import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth/auth.service';
import { AuthDto } from './auth/dto/auth.dto';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() authDto: AuthDto) {
    const { email, password } = authDto;
    return this.authService.login(email, password);
  }

  @Post('register')
  async register(@Body() authDto: AuthDto) {
    const { email, password, username } = authDto;
    return this.authService.signup(email, password, username);
  }
}
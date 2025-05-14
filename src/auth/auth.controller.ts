import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signup(@Body('email') email: string, @Body('password') password: string, @Body('username') username: string) {
    return this.authService.signup(email, password, username);
  }

  @Post('login')
  async login(@Body('email') email: string, @Body('password') password: string) {
    return this.authService.login(email, password);
  }

  @Post('reset-password')
  async resetPassword(@Body('email') email: string) {
    return this.authService.sendPasswordResetEmail(email);
  }

  @Post('reset-password/verify')
  async verifiyResetToken(
    @Body('email') email: string,
    @Body('token') token: string,
    @Body('newPassword') newPassword: string,
  )
  {
    return this.authService.resetPassword(email, token, newPassword);
  }

  @Post('verify-email')
  async verifyEmailUser(
    @Body('email') email: string,
    @Body('token') token: string
  ){
    return this.authService.verifyEmailUser(email, token);
  }

  @Post('verify-admin')
  async verifyAdmin(@Body('email') email: string) {
    return this.authService.verifyAdmin(email);
  }


  // @Get('verify-email')
  // async verifyEmail(@Query('token') token: string, @Query('email') email: string) {
  //   return this.authService.verifyEmail(token, email);
  // }
  
}

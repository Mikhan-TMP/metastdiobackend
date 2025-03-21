// import { Controller, Post, Body } from '@nestjs/common';
// import { AuthService } from './auth/auth.service';
// import { AuthDto } from './auth/dto/auth.dto';

// @Controller('api/auth')
// export class AuthController {
//   constructor(private readonly authService: AuthService) {}

//   @Post('login')
//   async login(@Body() authDto: AuthDto) {
//     const { email, password } = authDto;
//     return this.authService.login(email, password);
//   }

//   @Post('register')
//   async register(@Body() authDto: AuthDto) {
//     const { email, password, username } = authDto;
//     return this.authService.signup(email, password, username);
//   }

//   @Post('reset-password')
//   async resetPassword(@Body() authDto: AuthDto) {
//     const { email } = authDto;
//     return this.authService.sendPasswordResetEmail(email);
//   }

//   @Post('reset-password/verify')
//   async verifiyResetToken(
//     @Body('email') email: string,
//     @Body('token') token: string,
//     @Body('newPassword') newPassword: string,
//   )
//   {
//     return this.authService.resetPassword(email, token, newPassword);
//   }
// }
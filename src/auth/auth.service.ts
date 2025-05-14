import { Injectable, ConflictException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { Model } from 'mongoose';
import { User, UserDocument } from '../models/user.model';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import * as nodemailer from 'nodemailer';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  private transporter: nodemailer.Transporter;

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private configService: ConfigService,
  ) {
    // Initialize nodemailer transporter
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.configService.get<string>('EMAIL_USER'),
        pass: this.configService.get<string>('EMAIL_PASS'),
      },
    });
  }

  async signup(email: string, password: string, username: string): Promise<{ message: string ; status: string }> {
    // 1. Check if the user already exists
    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      throw new ConflictException('Email already registered.');
    }
    const existingUsername = await this.userModel.findOne({ username });
    if (existingUsername) {
      throw new ConflictException('Username already taken.');
    }

    // 2. Hash the Password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // 3. Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // 4. Create and save user
    const user = new this.userModel({
      email,
      password: hashedPassword,
      username,
      isVerified: false,
      emailVerificationToken: verificationToken
    });
    await user.save();

    // 5. Send verification email
    await this.sendVerificationEmail(email, verificationToken);

    return { message: 'Registration successful. Please check your email to verify your account.', status: 'success' };
  }

  async login(identifier: string, password: string): Promise<{ token: string, user: { email: string, username: string } }> {
    // 1. Find the user in the database by email or username
    const user = await this.userModel.findOne({
      $or: [{ email: identifier }, { username: identifier }]
    });

    // 2. If the user doesn't exist, throw an error
    if (!user) {
      throw new UnauthorizedException('User does not exist.');
    }

    // 3. Check if email is verified
    if (!user.isVerified) {
      throw new UnauthorizedException('Please verify your email address before logging in. Check your email for the verification link.');
    }

    // 4. Compare the password the user gave to the one in the database
    const isPasswordValid = await bcrypt.compare(password, user.password);

    // 5. If the passwords don't match, throw an error 
    if (!isPasswordValid) {
      throw new UnauthorizedException('Incorrect Login Credentials.');
    }

    // 6. Create a token that will be sent back to the user
    const jwtSecret = this.configService.get<string>('JWT_SECRET') || '';
    const token = jwt.sign({ userId: user._id }, jwtSecret, { expiresIn: '1d' });

    // 7. Return the token
    return { 
      token,
      user: { email: user.email, username: user.username } 
    };
  }

  async sendPasswordResetEmail(email: string) {
    // 1. Find user
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // 2. Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const tokenExpiration = new Date();
    tokenExpiration.setHours(tokenExpiration.getHours() + 1); // Token expires in 1 hour

    // 3. Save token to user
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = tokenExpiration;
    await user.save();

    // 4. Send email
    const resetUrl = `${this.configService.get<string>('FRONTEND_URL')}/?token=${resetToken}&email=${email}&isReset=true`;
    
    const emailTemplate = `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <div style="text-align: center; padding: 20px;">
          <img src="${this.configService.get<string>('FRONTEND_URL')}/metatown.png" alt="Metatown" style="width: 200px; margin-bottom: 20px;">
        </div>
        <h1 style="text-align: center; color: #BB30C9;">Password Reset</h1>
        <p style="text-align: center;">You requested a password reset. Click the link below to reset your password:</p>
        <div style="text-align: center; padding: 1rem;">
          <a style="text-decoration: none; font-size: 1.5rem; background-color: #BB30C9; color: white; padding: 1rem 2rem; border-radius: 5px; display: inline-block;" href="${resetUrl}">Reset Password</a>
        </div>
        <p style="text-align: center; color: #666;">This link will expire in 1 hour.</p>
        <p style="text-align: center; color: #666;">If you didn't request this, please ignore this email.</p>
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666;">
          <small>&copy; ${new Date().getFullYear()} Metatown. All rights reserved.</small>
        </div>
      </div>
    `;

    await this.transporter.sendMail({
      to: email,
      subject: 'Password Reset Request',
      html: emailTemplate,
    });

    return { message: 'Password reset email sent successfully' };
  }

  async resetPassword(email: string, token: string, newPassword: string) {
    // 1. Find user and verify token
    const user = await this.userModel.findOne({
      email,
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid or expired reset token');
    }

    // 2. Update password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return { message: 'Password reset successful' };
  }

  async sendVerificationEmail(email: string, token: string) {
    const verificationUrl = `${this.configService.get<string>('FRONTEND_URL')}/Auth/?token=${token}&email=${email}&isVerify=true`;
    
    const emailTemplate = `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <div style="text-align: center; padding: 20px;">
          <img src="${this.configService.get<string>('FRONTEND_URL')}/public/metatown.png" alt="Metatown" style="width: 200px; margin-bottom: 20px;">
        </div>
        <h1 style="text-align: center; color: #BB30C9;">Verify Your Email</h1>
        <p style="text-align: center;">Thank you for registering! Please click the link below to verify your email address:</p>
        <div style="text-align: center; padding: 1rem;">
          <a style="text-decoration: none; font-size: 1.5rem; background-color: #BB30C9; color: white; padding: 1rem 2rem; border-radius: 5px; display: inline-block;" href="${verificationUrl}">Verify Email</a>
        </div>
        <p style="text-align: center; color: #666;">If you didn't create an account, please ignore this email.</p>
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666;">
          <small>&copy; ${new Date().getFullYear()} Metatown. All rights reserved.</small>
        </div>
      </div>
    `;

    await this.transporter.sendMail({
      to: email,
      subject: 'Verify Your Email Address',
      html: emailTemplate,
    });
  }

  async verifyEmailUser(email: string, token: string) {
    const user = await this.userModel.findOne({ email });
    // show the email and token in console
    console.log('Email:', email);
    console.log('Token: ', token);
    if (!user || user.emailVerificationToken.trim() !== token.trim()) {
      throw new UnauthorizedException('Invalid or expired verification token');
    }
  
    if (user.isVerified) {
      throw new BadRequestException('Email is already verified');
    }
  
    // Clear the token and mark as verified
    user.emailVerificationToken = '';
    user.isVerified = true;
    await user.save();
  
    return { message: 'Email verified successfully' };
  }

  async verifyAdmin(email: string){
    console.log('Verifying admin for email:', email);
    const user = await this.userModel.findOne({ email });
    if (!user) {
      return {
        message: 'User not found',
        status: 'error'
      }
    }
    if (user.isAdmin != true) {
      console.log('User is not an admin:', user.isAdmin);
      return{
        message: 'User is not an admin',
        status: 'error'
      }
    }
    if (!user.isVerified) {
      return {
        message: 'User is not verified',
        status: 'error'
      }
    }

    if (user.isAdmin && user.isVerified) {
      console.log('User is an admin:', user.isAdmin);
      return {
        message: 'User is an admin',
        status: 200
      }
    }
    
  }
}

import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { Model } from 'mongoose';
import { User, UserDocument } from '../models/user.model';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private configService: ConfigService,
  ) {}

  async signup(email: string, password: string, username: string): Promise<{ token: string }> {
    // 1. Check if the user already exists
    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      throw new ConflictException('Email already registered.');
    }
    const existingUsername = await this.userModel.findOne({ username });
    if (existingUsername) {
      throw new ConflictException('Username already taken.');
    }
    //2. Hash the Password. 
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new this.userModel({ email, password: hashedPassword, username });
    await user.save();
    //3. Set the Token for login session
    const jwtSecret = this.configService.get<string>('JWT_SECRET') || '';
    
    const token = jwt.sign({ userId: user._id }, jwtSecret, { expiresIn: '1d' });

    return { token };
  }

  async login(identifier: string, password: string): Promise<{ token: string }> {
    // 1. Find the user in the database by email or username
    const user = await this.userModel.findOne({
      $or: [{ email: identifier }, { username: identifier }]
    });

    // 2. If the user doesn't exist, throw an error
    if (!user) {
      throw new UnauthorizedException('User does not exist.');
    }

    // 3. Compare the password the user gave to the one in the database
    const isPasswordValid = await bcrypt.compare(password, user.password);

    // 4. If the passwords don't match, throw an error 
    if (!isPasswordValid) {
      throw new UnauthorizedException('Incorrect Login Credentials.');
    }

    // 5. Create a token that will be sent back to the user
    const jwtSecret = this.configService.get<string>('JWT_SECRET') || '';

    const token = jwt.sign({ userId: user._id }, jwtSecret, { expiresIn: '1d' });

    // 6. Return the token
    return { token };
  }
}

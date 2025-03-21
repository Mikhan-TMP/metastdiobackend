import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthDto } from './auth/dto/auth.dto';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(authDto: AuthDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: authDto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      authDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return {
      token: this.jwtService.sign({ userId: user.id }),
    };
  }

  async register(authDto: AuthDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: authDto.email },
    });

    if (existingUser) {
      throw new UnauthorizedException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(authDto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: authDto.email,
        password: hashedPassword,
      },
    });

    return {
      token: this.jwtService.sign({ userId: user.id }),
    };
  }
}
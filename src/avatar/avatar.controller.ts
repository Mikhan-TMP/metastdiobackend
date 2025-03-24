import { Controller, Post, Body, Get, Query} from '@nestjs/common';
import { AvatarGenService } from './avatargen.service';
import { Buffer } from 'buffer';

@Controller('avatar')
export class AvatarController {
    constructor(private readonly avatarGenService: AvatarGenService) {}

    @Post('generate')
    async generate(
        @Body('email') email: string,
        @Body('image') imgSrc: string,
        @Body('style') style: string
    ) {
        if (!imgSrc) {
            return { message: "Invalid image data" };
        }
        const imageBuffer = Buffer.from(imgSrc, 'base64');

        return await this.avatarGenService.generate(email, imageBuffer, style);
    }

    @Get('getAvatars')
    async fetchAvatars(@Query('email') email: string) {
        return await this.avatarGenService.getAvatars(email);
    }
}

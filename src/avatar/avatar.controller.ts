import { Controller, Post, Body, Get, Query, Delete, Patch, Param} from '@nestjs/common';
import { AvatarGenService } from './avatargen.service';
import { Buffer } from 'buffer';

@Controller('avatar')
export class AvatarController {
    constructor(private readonly avatarGenService: AvatarGenService) {}

    @Post('addAvatar')
    async addAvatar(
        @Body('name') name: string, 
        @Body('email') email: string,
        @Body('image') imgSrc: string,
        @Body('style') style: string
    ) {
        if (!imgSrc) {
            return { message: "Invalid image data" };
        }
        const imageBuffer = Buffer.from(imgSrc, 'base64');

        return await this.avatarGenService.addAvatar(email, imageBuffer, style, name);
    }

    @Get('getAvatars')
    async fetchAvatars(@Query('email') email: string, @Query('style') style?: string, @Query('name') name?: string) {
        return await this.avatarGenService.getAvatars(email, style, name);
    }

    @Delete('delete')
    async deleteAvatar(
        @Query('email') email: string, 
        @Query('id') id: string
    ) {
        return await this.avatarGenService.deleteAvatar(email, id);
    }

    @Patch('updateAvatar')
    async updateAvatar(
      @Query('id') id: string,
      @Query('email') email: string,
      @Query('name') name: string 
    ) {
      return this.avatarGenService.updateAvatar(id, email, name);
    }
}

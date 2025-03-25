import { Controller, Post, Body, Get, Query, Delete, Patch, Param} from '@nestjs/common';
import { StudioService } from './studio.service';
import { Buffer } from 'buffer';

@Controller('studio')
export class StudioController {
    constructor (private readonly studioService: StudioService) {}

    @Post('addStudio')
    async addStudio(
        @Body('name') name: string, 
        @Body('email') email: string,
        @Body('image') imgSrc: string,
        @Body('type') studioType: string
    ) {
        if (!imgSrc) {
            return { message: "Invalid image data" };
        }
        const imageBuffer = Buffer.from(imgSrc, 'base64');

        return await this.studioService.addStudio(email, imageBuffer, studioType, name);
    }

    @Get('getStudios')
    async getStudios(@Query('email') email: string, @Query('type') studioType?: string, @Query('name') name?: string) {
        return await this.studioService.getStudios(email, studioType, name);
    }

    @Delete('deleteStudio')
    async deleteStudio(
        @Query('email') email : string,
        @Query('id') id : string,
    ){
        return await this.studioService.deleteStudio(email, id);
    }

    @Patch('updateStudio')
    async updateStudio(
        @Query('id') id: string,
        @Query('email') email: string,
        @Query('name') name?: string,
        @Query('type') studioType?: string
    ) {
        return this.studioService.updateStudio(id, email, name, studioType);
    }

}

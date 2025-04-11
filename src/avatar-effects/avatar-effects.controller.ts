import { Controller, Post, UploadedFiles, UseInterceptors, Body, Get, Query } from '@nestjs/common';
import { AvatarEffectsService } from './avatar-effects.service';
import { AnyFilesInterceptor } from '@nestjs/platform-express';

@Controller('avatar-effects')
export class AvatarEffectsController {
  constructor(private readonly avatarEffectsService: AvatarEffectsService) {}

  @Post()
  @UseInterceptors(AnyFilesInterceptor())
  async uploadEffects(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() body: any,
  ) {
    return this.avatarEffectsService.saveEffects(body, files);
  }

  @Get('getAllEffects')
  async getAllEffects(  
    @Query('email') email: string,
    @Query('avatarID') avatarID: string,){
      return this.avatarEffectsService.getAllEffects(email, avatarID);
  }
}

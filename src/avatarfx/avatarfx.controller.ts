import { Controller, Post, Body, Param, Get, Query } from '@nestjs/common';
import { AvatarfxService } from './avatarfx.service';

@Controller('avatarfx')
export class AvatarfxController {
  constructor(private readonly avatarfxService: AvatarfxService) {}

  @Post('initializeAvatarFx')
  async initializeAvatarFx(@Body() avatarfx: any) {
    return this.avatarfxService.initializeAvatarFx(
      avatarfx.email,
      avatarfx.avatarID,
      avatarfx.cameraViews,
    );
  }
}

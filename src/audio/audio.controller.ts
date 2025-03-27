import { Controller, Post, Body, Get, Query, Put, Patch, Param, Delete } from '@nestjs/common';
import { AudioService } from './audio.service';
import { Audio } from '../models/audio.model';

@Controller('audio')
export class AudioController {
  constructor(private readonly audioService: AudioService) {}

  @Post('addAudio')
  async addAudio(@Body() body: { email: string; title: string; audio: Audio[] }) {
    const { email, title, audio } = body;
    return this.audioService.addAudio(email, title, audio);
  }

  @Get('getAllScript')
  async getAllScript(@Query('email') email: string) {
    return this.audioService.getAllScript(email);
  }

  @Get('getScript')

  async getScript(
    @Query('email') email: string,
    @Query('titleId') titleId: string
  ) {
    return this.audioService.getScript(email, titleId);
  }

  @Patch('updateAudio')
  async updateAudio(
    @Query('email') email: string,
    @Query('titleId') titleId: string,
    @Query('audioId') audioId: string,
    @Body() updateData: Partial<{ 
      name?: string; 
      category?: string; 
      speaker?: string; 
      type?: string; 
      volume?: number; 
      fadeIn?: number; 
      fadeOut?: number; 
      voiceEnhance?: boolean; 
      noiseReduction?: boolean;
    }>
  ) {
    return this.audioService.updateAudio(email, titleId, audioId, updateData);
  }

  @Patch('updateTitle')
  async updateTitle(
    @Query('email') email: string,
    @Query('titleId') titleId: string,
    @Body() body: { newTitle: string }
  ) {
    return this.audioService.updateTitle(email, titleId, body.newTitle);
  }
  
  @Delete('deleteAudio')
  async deleteAudio(
    @Query('email') email: string,
    @Query('titleId') titleId: string,
    @Query('audioId') audioId: string
  )
  {
    return this.audioService.deleteAudio(email, titleId, audioId);
  }

  @Delete('deleteScript')
  async deleteScript(
    @Query('email') email: string,
    @Query('titleId') titleId: string
  ){
    return this.audioService.deleteScript(email, titleId);
  }
}

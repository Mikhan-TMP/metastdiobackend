import { Controller, Post, Body, Get, Query } from '@nestjs/common';
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
}

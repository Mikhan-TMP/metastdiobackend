import { Controller, Get, Query, Post, Body, Param } from '@nestjs/common';
import { EmotionsService } from './emotions.service';
@Controller('emotions')
export class EmotionsController {
    constructor(private readonly emotionsService: EmotionsService) {}

    @Get()
    async GetEmotions() {
        // await this.emotionsService.getEmotionNames();
        return this.emotionsService.getEmotionNames();
    }
}

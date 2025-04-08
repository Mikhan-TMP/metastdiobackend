import { Controller, Get, Query, Post, Body, Param } from '@nestjs/common';
import { GesturesService } from './gestures.service';
@Controller('gestures')
export class GesturesController {
    constructor(private readonly gesturesService: GesturesService) {}
    
    @Get()
    async getGestures() {
      // await this.gesturesService.getGestureNames();
      return this.gesturesService.getGestureNames();
    }

}


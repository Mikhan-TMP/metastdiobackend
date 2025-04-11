// sequences.controller.ts
import { Body, Controller, Get, Param, Post, Query} from '@nestjs/common';
import { SequencesService } from './sequences.service';
import { Sequences } from '../models/sequences.model';

@Controller('sequences')
export class SequencesController {
    constructor(private readonly sequencesService: SequencesService) {}

    @Post('addSequence')
    async create(@Body() body: { email: string, avatarID: string, sequenceName: string, actions: any[] }): Promise<Sequences> {
        return this.sequencesService.addSequence(body);
    }
    @Get('getAllSequences')
    async getAllSequences(@Query('email') email: string, @Query('avatarID') avatarID: string): Promise<Sequences[]> {
        return this.sequencesService.getAllSequences(email, avatarID);
    }
}

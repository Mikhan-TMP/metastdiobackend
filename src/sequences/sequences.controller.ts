// sequences.controller.ts
import { Body, Controller, Get, Param, Post, Query, Delete} from '@nestjs/common';
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
    @Delete('deleteSequence')
    async deleteSequence(
        @Query('email') email: string,
        @Query('avatarID') avatarID: string,
        @Query('sequenceID') sequenceID: string
    ): Promise<Sequences[]>{
        return this.sequencesService.deleteSequence(email, avatarID, sequenceID);
    }
}

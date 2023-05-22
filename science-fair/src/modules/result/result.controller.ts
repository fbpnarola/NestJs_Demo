import { Controller, Get, Param, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ResultService } from './result.service';

@Controller('result')
export class ResultController {
    constructor(private readonly resulService: ResultService) {
    }

    @Post()
    @UseGuards(AuthGuard())
    async addResult(@Req() req, @Res() res) {
        const result = await this.resulService.create(req.body, req.user)
        return res.send(result)
    }

    @Post('/getAll')
    @UseGuards(AuthGuard())
    async getAllResult(@Req() req, @Res() res) {
        const result = await this.resulService.getAllResult(req.body, req.auth)
        return res.send(result)
    }

    @Get('/:id')
    @UseGuards(AuthGuard())
    async getResultById(@Req() req, @Res() res, @Param() param) {
        const result = await this.resulService.getResultById(param.id)
        return res.send(result)
    }

    @Post('/approveEvaluation/:id')
    @UseGuards(AuthGuard())
    async approveEvaluation(@Req() req, @Res() res, @Param() param) {
        const result = await this.resulService.approveEvaluation(req.body, param.id)
        return res.send(result)
    }

    @Post('/topScore')
    @UseGuards(AuthGuard())
    async getTopScore(@Req() req, @Res() res) {
        const result = await this.resulService.getTopScore(req.body)
        return res.send(result)
    }

    @Post('/allScore')
    @UseGuards(AuthGuard())
    async getAllScore(@Req() req, @Res() res) {
        const result = await this.resulService.getAllProject(req.body)
        return res.send(result)
    }

    @Get('/rawResultCSV/:scienceFairId')
    @UseGuards(AuthGuard())
    async rawResultCSV(@Req() req, @Res() res, @Param() param) {
        const result = await this.resulService.rawResultCSV(req.user, param.scienceFairId)
        return res.send(result)
    }

    @Post('/convertToCSV')
    @UseGuards(AuthGuard())
    async convertToCSV(@Req() req, @Res() res) {
        const result = await this.resulService.convertToCSVFile(req.body)
        return res.send(result)
    }

    @Get('/CSVFile/:fileName')
    downloadFile(@Param('csv') fileName, @Res() res) {
        return res.sendFile(fileName, { root: 'public/csv' });
    }
}

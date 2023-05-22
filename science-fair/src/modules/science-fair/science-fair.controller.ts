import { Body, Controller, Get, Post, Req, Put, UseGuards, UseInterceptors, UploadedFile, Res, Param, Delete } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { upload } from 'src/middleware/image.middleware';
import { CreateScienceFairDto } from './dto/createScienceFair.dto';
import { ScienceFairService } from './science-fair.service';

@Controller('api/science-fair')
export class ScienceFairController {
    constructor(private readonly scienceFairService: ScienceFairService) { }

    @Post()
    @UseGuards(AuthGuard())
    @UseInterceptors(FileInterceptor('image', upload))
    async createUser(@Body() createScienceFairDto: CreateScienceFairDto, @UploadedFile() file, @Res() res) {
        let addScienceFair
        if (file !== undefined) {
            const fileData = file;
            addScienceFair = await this.scienceFairService.create(createScienceFairDto, fileData.filename);
        }
        else {
            addScienceFair = await this.scienceFairService.create(createScienceFairDto);
        }
        return res.send(addScienceFair);
    }

    @Put('/:id')
    @UseGuards(AuthGuard())
    @UseInterceptors(FileInterceptor('image', upload))
    async update(@Req() req, @Res() res, @UploadedFile() file, @Param() params) {
        let updateScienceFair
        if (file !== undefined) {
            const fileData = file
            updateScienceFair = await this.scienceFairService.update(req.body, params.id, fileData.filename);
        }
        else {
            updateScienceFair = await this.scienceFairService.update(req.body, params);
        }
        return res.send(updateScienceFair);
    }

    @Delete('/:id')
    @UseGuards(AuthGuard())
    async delete(@Res() res, @Param() params) {
        const deleteScienceFair = await this.scienceFairService.delete(params.id);
        return res.send(deleteScienceFair);
    }

    @Get('/:id')
    @UseGuards(AuthGuard())
    async getScienceFairById(@Res() res, @Param() params) {
        const scienceFair = await this.scienceFairService.getScienceFairById(params.id);
        return res.send(scienceFair);
    }

    @Post('/getAll')
    @UseGuards(AuthGuard())
    async getAllScienceFair(@Req() req, @Res() res) {
        const scienceFairData = await this.scienceFairService.getData(req.body);
        return res.send(scienceFairData);
    }

    @Get('/lockScienceFair/:id')
    @UseGuards(AuthGuard())
    async lockScienceFair(@Res() res, @Param() params) {
        const scienceFair = await this.scienceFairService.lockScienceFair(params.id);
        return res.send(scienceFair);
    }

    @Get('/getTotalCount/:id')
    @UseGuards(AuthGuard())
    async getTotalCount(@Req() req, @Res() res, @Param() params) {
        const scienceFair = await this.scienceFairService.totalCount(req.user, params.id);
        return res.send(scienceFair);
    }

    @Post('/getAllScienceFairPublic')
    async getAllScienceFairPublic(@Req() req, @Res() res) {
        const scienceFairData = await this.scienceFairService.getScienceFairPublic();
        return res.send(scienceFairData);
    }
}

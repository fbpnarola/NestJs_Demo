import { Body, Controller, Delete, Get, Param, Post, Put, Req, Res, UseGuards, UseInterceptors } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CreateSchoolDto } from './dto/createSchool.dto';
import { SchoolService } from './school.service';

@Controller('api/school')
export class SchoolController {
    constructor(private readonly schoolService: SchoolService) {
    }

    @Post()
    @UseGuards(AuthGuard())
    async createSchool(@Body() createSchoolDto: CreateSchoolDto, @Res() res) {
        const addSchool = await this.schoolService.create(createSchoolDto);
        return res.send(addSchool);
    }

    @Put('/:id')
    @UseGuards(AuthGuard())
    async update(@Req() req, @Res() res, @Param() params) {
        const updateSchool = await this.schoolService.update(req.body, params.id);
        return res.send(updateSchool);
    }

    @Delete('/:id')
    @UseGuards(AuthGuard())
    async delete(@Res() res, @Param() params) {
        const deleteSchool = await this.schoolService.delete(params.id);
        return res.send(deleteSchool);
    }

    @Get('/:id')
    @UseGuards(AuthGuard())
    async getSchoolById(@Res() res, @Param() params) {
        const school = await this.schoolService.getSchoolById(params.id);
        return res.send(school);
    }

    @Post('/getAll')
    @UseGuards(AuthGuard())
    async getAllSchool(@Req() req, @Res() res) {
        const schoolData = await this.schoolService.getData(req.body, req.user);
        return res.send(schoolData);
    }
}
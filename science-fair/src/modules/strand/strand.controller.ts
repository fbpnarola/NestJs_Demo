import { Body, Controller, Delete, Get, Param, Post, Put, Req, Res } from '@nestjs/common';
import { CreateStrandDto } from './dto/createStrand.dto';
import { StrandService } from './strand.service';

@Controller('api/strand')
export class StrandController {

    constructor(private readonly strandService: StrandService) { }

    @Post()
    async createCategory(@Body() createStrandDto: CreateStrandDto, @Res() res) {
        const addStrand = await this.strandService.create(createStrandDto);
        return res.send(addStrand);
    }

    @Put('/:id')
    async update(@Req() req, @Res() res, @Param() params) {
        const updateStrand = await this.strandService.update(req.body, params.id);
        return res.send(updateStrand);
    }

    @Delete('/:id')
    async delete(@Res() res, @Param() params) {
        const deleteStrand = await this.strandService.delete(params.id);
        return res.send(deleteStrand);
    }

    @Get('/:id')
    async getStrandById(@Res() res, @Param() params) {
        const strand = await this.strandService.getStrandById(params.id);
        return res.send(strand);
    }

    @Post('/getAll')
    async getAllStrand(@Req() req, @Res() res) {
        const strandData = await this.strandService.getData(req.body);
        return res.send(strandData);
    }
}

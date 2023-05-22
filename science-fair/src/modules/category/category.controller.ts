import { Body, Controller, Delete, Get, Param, Post, Put, Req, Res } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/createCategory.dto';

@Controller('api/category')
export class CategoryController {

    constructor(private readonly categoryService: CategoryService) { }

    @Post()
    async createCategory(@Body() createCategoryDto: CreateCategoryDto, @Res() res) {
        const addCategory = await this.categoryService.create(createCategoryDto);
        return res.send(addCategory);
    }

    @Put('/:id')
    async update(@Req() req, @Res() res, @Param() params) {
        const updateCategory = await this.categoryService.update(req.body, params.id);
        return res.send(updateCategory);
    }

    @Delete('/:id')
    async delete(@Res() res, @Param() params) {
        const deleteCategory = await this.categoryService.delete(params.id);
        return res.send(deleteCategory);
    }

    @Get('/:id')
    async getCategoryById(@Res() res, @Param() params) {
        const category = await this.categoryService.getCategoryById(params.id);
        return res.send(category);
    }

    @Post('/getAll')
    async getAllCategory(@Req() req, @Res() res) {
        const categoryData = await this.categoryService.getData(req.body);
        return res.send(categoryData);
    }

}

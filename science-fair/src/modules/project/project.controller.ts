import { Body, Controller, Delete, Get, Param, Post, Put, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CreateProjectDto } from './dto/createProject.dto';
import { ProjectService } from './project.service';

@Controller('api/project')
export class ProjectController {

    constructor(private readonly projectService: ProjectService) { }

    @Post()
    @UseGuards(AuthGuard())
    async createProject(@Body() createProjectDto: CreateProjectDto, @Req() req, @Res() res) {
        const addProject = await this.projectService.create(createProjectDto, req.user);
        return res.send(addProject);
    }

    @Put('/:id')
    @UseGuards(AuthGuard())
    async update(@Req() req, @Res() res, @Param() params) {
        const updateProject = await this.projectService.update(req.body, params.id);
        return res.send(updateProject);
    }

    @Delete('/:id')
    @UseGuards(AuthGuard())
    async delete(@Res() res, @Param() params) {
        const deleteProject = await this.projectService.delete(params.id);
        return res.send(deleteProject);
    }

    @Get('/:id')
    @UseGuards(AuthGuard())
    async getProjectById(@Res() res, @Param() params) {
        const project = await this.projectService.getProjectById(params.id);
        return res.send(project);
    }

    @Post('/getAll')
    @UseGuards(AuthGuard())
    async getAllProject(@Req() req, @Res() res) {
        const projectData = await this.projectService.getData(req.body, req.user);
        return res.send(projectData);
    }

    @Post('/projectCSV/:scienceFairId')
    @UseGuards(AuthGuard())
    async projectCSV(@Req() req, @Res() res, @Param() params) {
        const projectData = await this.projectService.projectCSV(req.user, params.scienceFairId);
        return res.send(projectData);
    }
}

import { Body, Controller, Delete, Get, Param, Post, Put, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CreateStudentDto } from './dto/createStudent.dto';
import { StudentService } from './student.service';

@Controller('api/student')
export class StudentController {
    constructor(private readonly studentService: StudentService) { }
    @Post()
    @UseGuards(AuthGuard())
    async createUser(@Body() createUserDto: CreateStudentDto, @Req() req, @Res() res) {
        let addStudent = await this.studentService.create(createUserDto, req.user);
        return res.send(addStudent);
    }

    @Put('/:id')
    @UseGuards(AuthGuard())
    async update(@Req() req, @Res() res, @Param() params) {
        const updateStudent = await this.studentService.update(req.body, params.id);
        return res.send(updateStudent);
    }

    @Delete('/:id')
    @UseGuards(AuthGuard())
    async delete(@Req() req, @Res() res, @Param() params) {
        const deleteStudent = await this.studentService.delete(params.id);
        return res.send(deleteStudent);
    }

    @Get('/:id')
    @UseGuards(AuthGuard())
    async getStudentById(@Res() res, @Param() params) {
        const student = await this.studentService.getStudentById(params.id);
        return res.send(student);
    }

    @Post('/getAll')
    @UseGuards(AuthGuard())
    async getAllStudent(@Req() req, @Res() res) {
        const StudentData = await this.studentService.getData(req.body, req.user);
        return res.send(StudentData);
    }

    @Get('/userCSV/:scienceFairId')
    @UseGuards(AuthGuard())
    async studentCSV(@Req() req, @Res() res, @Param() param) {
        const user = await this.studentService.studentCSV(req.user, param.scienceFairId);
        return res.send(user);
    }

}

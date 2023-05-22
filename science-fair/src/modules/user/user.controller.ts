import { Body, Controller, Get, Param, Post, Res, Req, UploadedFile, UploadedFiles, UseInterceptors, UseGuards, Put, Delete } from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { upload } from 'src/middleware/image.middleware';
import { CreateUserDto } from './dto/createUser.dto';
import { UserService } from './user.service';
import { AuthGuard } from '@nestjs/passport';
// import 

@Controller('api/user')
export class UserController {

    constructor(private readonly userService: UserService) {
    }

    @Post()
    @UseGuards(AuthGuard())
    @UseInterceptors(FileInterceptor('avatar', upload))
    async createUser(@Body() createUserDto: CreateUserDto, @UploadedFile() file, @Req() req, @Res() res) {
        let addUser
        if (file !== undefined) {
            const fileData = file
            addUser = await this.userService.create(createUserDto, req.user, fileData.filename);
        }
        else {
            addUser = await this.userService.create(createUserDto, req.user);
        }
        return res.send(addUser);
    }

    @Put('/:id')
    @UseGuards(AuthGuard())
    @UseInterceptors(FileInterceptor('avatar', upload))
    async update(@Req() req, @Res() res, @UploadedFile() file, @Param() params) {
        let updateUser
        if (file !== undefined) {
            const fileData = file
            updateUser = await this.userService.update(req.body, params.id, fileData.filename);
        }
        else {
            updateUser = await this.userService.update(req.body, params.id);
        }
        return res.send(updateUser);
    }

    @Delete('/:id')
    @UseGuards(AuthGuard())
    async delete(@Req() req, @Res() res, @Param() params) {
        const deleteUser = await this.userService.delete(params.id, req.user);
        return res.send(deleteUser);
    }

    @Get('/:id')
    @UseGuards(AuthGuard())
    async getUserById(@Res() res, @Param() params) {
        const user = await this.userService.getUserById(params.id);
        return res.send(user);
    }

    @Post('/getAll')
    @UseGuards(AuthGuard())
    async getAllUser(@Req() req, @Res() res) {
        const UserData = await this.userService.getData(req.body);
        return res.send(UserData);
    }

    @Get('/userCSV/:scienceFairId')
    @UseGuards(AuthGuard())
    async userCSV(@Req() req, @Res() res, @Param() param) {
        const user = await this.userService.userCSV(req.user, param.scienceFairId);
        return res.send(user);
    }

    // @Post('/fileUpload')
    // @UseInterceptors(
    //     FileInterceptor('avatar', upload)
    // )
    // uploadFile(@Req() req, @UploadedFile() file) {
    //     const fileData = file
    //     file.filename = fileData.filename
    //     return file
    // }

    // @Get(':avatar')
    // downloadFile(@Param('avatar') avatar, @Res() res) {
    //     res.sendFile(avatar, { root: 'public/avatar' });
    // }
}
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { Project, ProjectSchema } from '../project/project.schema';
import { Student, StudentSchema } from '../student/student.schema';
import { User, UserSchema } from '../user/user.schema';
import { SchoolController } from './school.controller';
import { School, SchoolSchema } from './school.schema';
import { SchoolService } from './school.service';

@Module({
  imports: [AuthModule, MongooseModule.forFeature([
    { name: School.name, schema: SchoolSchema },
    { name: Student.name, schema: StudentSchema },
    { name: User.name, schema: UserSchema },
    { name: Project.name, schema: ProjectSchema }
  ])],
  controllers: [SchoolController],
  providers: [SchoolService]
})
export class SchoolModule { }

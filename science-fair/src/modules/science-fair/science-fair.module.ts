import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { Project, ProjectSchema } from '../project/project.schema';
import { Result, ResultSchema } from '../result/result.schema';
import { School, SchoolSchema } from '../school/school.schema';
import { Student, StudentSchema } from '../student/student.schema';
import { User, UserSchema } from '../user/user.schema';
import { ScienceFairController } from './science-fair.controller';
import { ScienceFair, ScienceFairSchema } from './science-fair.schema';
import { ScienceFairService } from './science-fair.service';

@Module({
  imports: [AuthModule, MongooseModule.forFeature([
    { name: ScienceFair.name, schema: ScienceFairSchema },
    { name: User.name, schema: UserSchema },
    { name: Student.name, schema: StudentSchema },
    { name: Project.name, schema: ProjectSchema },
    { name: Result.name, schema: ResultSchema },
    { name: School.name, schema: SchoolSchema }
  ])],
  controllers: [ScienceFairController],
  providers: [ScienceFairService]
})
export class ScienceFairModule { }

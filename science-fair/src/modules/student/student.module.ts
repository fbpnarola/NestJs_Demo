import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { Project, ProjectSchema } from '../project/project.schema';
import { ScienceFair, ScienceFairSchema } from '../science-fair/science-fair.schema';
import { StudentController } from './student.controller';
import { Student, StudentSchema } from './student.schema';
import { StudentService } from './student.service';

@Module({
  imports: [AuthModule, MongooseModule.forFeature([
    { name: Student.name, schema: StudentSchema },
    { name: Project.name, schema: ProjectSchema },
    { name: ScienceFair.name, schema: ScienceFairSchema }
  ])],
  controllers: [StudentController],
  providers: [StudentService]
})
export class StudentModule { }

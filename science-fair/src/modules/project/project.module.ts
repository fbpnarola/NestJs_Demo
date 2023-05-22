import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { Result, ResultSchema } from '../result/result.schema';
import { School, SchoolSchema } from '../school/school.schema';
import { ScienceFair, ScienceFairSchema } from '../science-fair/science-fair.schema';
import { User, UserSchema } from '../user/user.schema';
import { ProjectController } from './project.controller';
import { Project, ProjectSchema } from './project.schema';
import { ProjectService } from './project.service';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: Project.name, schema: ProjectSchema },
      { name: User.name, schema: UserSchema },
      { name: School.name, schema: SchoolSchema },
      { name: Result.name, schema: ResultSchema },
      { name: ScienceFair.name, schema: ScienceFairSchema }
    ]),
  ],
  controllers: [ProjectController],
  providers: [ProjectService]
})
export class ProjectModule { }

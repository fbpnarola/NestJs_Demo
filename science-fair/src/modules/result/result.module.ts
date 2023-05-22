import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { Category, CategorySchema } from '../category/category.schema';
import { Project, ProjectSchema } from '../project/project.schema';
import { School, SchoolSchema } from '../school/school.schema';
import { ScienceFair, ScienceFairSchema } from '../science-fair/science-fair.schema';
import { Strand, StrandSchema } from '../strand/strand.schema';
import { ResultController } from './result.controller';
import { Result, ResultSchema } from './result.schema';
import { ResultService } from './result.service';

@Module({
  imports: [AuthModule, MongooseModule.forFeature([
    { name: Result.name, schema: ResultSchema },
    { name: Project.name, schema: ProjectSchema },
    { name: Strand.name, schema: StrandSchema },
    { name: Category.name, schema: CategorySchema },
    { name: ScienceFair.name, schema: ScienceFairSchema },
    { name: School.name, schema: SchoolSchema }
  ])],
  controllers: [ResultController],
  providers: [ResultService]
})
export class ResultModule { }

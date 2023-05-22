import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MulterModule } from '@nestjs/platform-express';
import { AuthModule } from '../auth/auth.module';
import { Category, CategorySchema } from '../category/category.schema';
import { Project, ProjectSchema } from '../project/project.schema';
import { Result, ResultSchema } from '../result/result.schema';
import { School, SchoolSchema } from '../school/school.schema';
import { ScienceFair, ScienceFairSchema } from '../science-fair/science-fair.schema';
import { Strand, StrandSchema } from '../strand/strand.schema';
import { UserController } from './user.controller';
import { User, UserSchema } from './user.schema';
import { UserService } from './user.service';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: School.name, schema: SchoolSchema },
      { name: Result.name, schema: ResultSchema },
      { name: Category.name, schema: CategorySchema },
      { name: Strand.name, schema: StrandSchema },
      { name: ScienceFair.name, schema: ScienceFairSchema },
      { name: Project.name, schema: ProjectSchema },
      // { name: ResultSchema.name, schema: ResultSchema }
    ]),
    MulterModule.register()
  ],
  controllers: [UserController],
  providers: [UserService]
})
export class UserModule { }

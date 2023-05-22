import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import config from './config/config';
import { UserModule } from './modules/user/user.module';
import { ScienceFairModule } from './modules/science-fair/science-fair.module';
import { SchoolModule } from './modules/school/school.module';
import { AuthModule } from './modules/auth/auth.module';
import { CategoryModule } from './modules/category/category.module';
import { StrandModule } from './modules/strand/strand.module';
import { StudentModule } from './modules/student/student.module';
import { ProjectModule } from './modules/project/project.module';
import { ResultModule } from './modules/result/result.module';
import { SeederModule } from './seeder/seeder.module';

@Module({
  imports: [
    // ConfigModule.forRoot({
    //   envFilePath: '.env',
    //   isGlobal: true,
    // }),
    MongooseModule.forRoot(config.MONGODB_URL),
    SeederModule,
    UserModule,
    ScienceFairModule,
    SchoolModule,
    AuthModule,
    CategoryModule,
    StrandModule,
    StudentModule,
    ProjectModule,
    ResultModule
  ]
})
export class AppModule { }

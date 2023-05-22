import { MongooseModule } from '@nestjs/mongoose';
import { Category, CategorySchema } from '../modules/category/category.schema';
import { Strand, StrandSchema } from '../modules/strand/strand.schema';
import { User, UserSchema } from '../modules/user/user.schema';
import { CategorySeederService } from './category.seeder.service';
import { StrandSeederService } from './strand.seeder.service';
import { UserSeederService } from './user.seeder.service';
import { seeder } from 'nestjs-seeder';
import config from '../config/config';

// @Module({
//   imports: [
//     MongooseModule.forFeature([
//       { name: User.name, schema: UserSchema },
//       { name: Category.name, schema: CategorySchema },
//       { name: Strand.name, schema: StrandSchema }
//     ])]
// })
seeder({
  imports: [
    MongooseModule.forRoot(config.MONGODB_URL),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Category.name, schema: CategorySchema },
      { name: Strand.name, schema: StrandSchema }

    ])],
  providers: [CategorySeederService, StrandSeederService, UserSeederService]
}).run([CategorySeederService, StrandSeederService, UserSeederService])

export class SeederModule { }
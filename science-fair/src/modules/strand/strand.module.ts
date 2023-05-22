import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StrandController } from './strand.controller';
import { Strand, StrandSchema } from './strand.schema';
import { StrandService } from './strand.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Strand.name, schema: StrandSchema }]),
  ],
  controllers: [StrandController],
  providers: [StrandService]
})
export class StrandModule { }

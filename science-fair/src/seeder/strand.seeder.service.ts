import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Strand, StrandDocument } from '../modules/strand/strand.schema';
import { strands } from './strand.seeder'
import { Seeder } from 'nestjs-seeder';

@Injectable()
export class StrandSeederService implements Seeder {
    constructor(@InjectModel(Strand.name) private readonly strandModel: Model<Strand>) { }

    async seed(): Promise<any> {
        let UpdatedStrand
        for (let strandIndex = 0; strandIndex < strands.length; strandIndex++) {
            const strand = strands[strandIndex];
            UpdatedStrand = await this.strandModel.findByIdAndUpdate(strand._id, strand, { upsert: true })
        }
        return UpdatedStrand;
    }
    async drop(): Promise<any> {
        // return await this.strandModel.deleteMany({});
    }
}
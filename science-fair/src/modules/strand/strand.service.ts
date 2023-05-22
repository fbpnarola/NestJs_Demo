import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { paginate } from 'src/helper/paginate';
import { CreateStrandDto } from './dto/createStrand.dto';
import { Strand, StrandDocument } from './strand.schema';

@Injectable()
export class StrandService {
    constructor(@InjectModel(Strand.name) private strandModel: Model<StrandDocument>) { }

    async create(data: CreateStrandDto) {
        try {
            const model = new this.strandModel();
            model.strandName = data.strandName
            if (data.hasOwnProperty('parentStrand')) {
                model.parentStrand = data.parentStrand
            }
            const strand = await model.save();
            if (strand) {
                return { message: "Strand added successfully!!" }
            }
            return { message: "Strand not added!!" }
        } catch (error) {
            return { message: error.message };
        }
    }

    async update(body, id) {
        try {
            const updateStrand = await this.strandModel.findOneAndUpdate({ _id: id }, body)
            if (updateStrand !== null) {
                return { message: "Strand updated successfully!!" };
            }
            return { message: "Strand not updated!!" };
        } catch (error) {
            return { message: error.message };
        }
    }

    async delete(id) {
        try {
            const deleteStrand = await this.strandModel.findOne({ $and: [{ _id: id, isDeleted: false }] })
            if (deleteStrand !== null) {
                await this.strandModel.findOneAndUpdate({ _id: id },
                    {
                        isDeleted: true,
                        isActive: false
                    })
                return { message: "Strand deleted successully!!" };
            }
            return { message: "Strand is not deleted!!" };
        } catch (error) {
            return { message: error.message };
        }
    }

    async getStrandById(id) {
        try {
            const getById = await this.strandModel.findOne({ $and: [{ _id: id, isDeleted: false }] })
                .populate('scienceFairId', 'name date location1')
                .select('-updatedAt -createdAt -__v')
            if (getById) {
                return getById;
            }
            return { message: "No data found!!" };
        } catch (error) {
            return { message: error.message };
        }
    }

    async getData(body) {
        try {
            const option = { ...body };
            if (!option.hasOwnProperty('query')) {
                option['query'] = {};
            }
            option.query['isDeleted'] = false;
            const strandData = await paginate(option, this.strandModel)
            if (!strandData) {
                return { message: "No Data!!" };
            }
            return strandData;
        } catch (error) {
            return { message: error.message };
        }
    }
}
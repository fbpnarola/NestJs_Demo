import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category, CategoryDocument } from '../modules/category/category.schema';
import { categories } from './category.seeder'
import { Seeder } from 'nestjs-seeder';

@Injectable()
export class CategorySeederService implements Seeder {
    constructor(@InjectModel(Category.name) private readonly categoryModel: Model<Category>) { }

    async seed(): Promise<any> {
        console.log('Categories ==>', categories)
        let UpdatedCategories
        for (let categoryIndex = 0; categoryIndex < categories.length; categoryIndex++) {
            const category = categories[categoryIndex];
            UpdatedCategories = await this.categoryModel.findByIdAndUpdate(category._id, category, { upsert: true });
        }
        return UpdatedCategories
    }
    async drop(): Promise<any> {
        // return await this.categoryModel.deleteMany({});
    }
}
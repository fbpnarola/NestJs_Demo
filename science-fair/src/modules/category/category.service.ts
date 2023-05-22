import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { paginate } from 'src/helper/paginate';
import { Category, CategoryDocument } from './category.schema';
import { CreateCategoryDto } from './dto/createCategory.dto';

@Injectable()
export class CategoryService {
    constructor(@InjectModel(Category.name) private categoryModel: Model<CategoryDocument>) { }

    async create(data: CreateCategoryDto) {
        try {
            const model = new this.categoryModel();
            model.name = data.name
            model.description = data.description
            const category = await model.save();
            if (category) {
                return { message: "Category added successfully!!" }
            }
            return { message: "Category not added!!" }
        } catch (error) {
            return { message: error.message }
        }
    }

    async update(body, id) {
        try {
            const updateCategory = await this.categoryModel.findOneAndUpdate({ _id: id }, body)
            if (updateCategory !== null) {
                return { message: "Category updated successfully!!" };
            }
            return { message: "Category not updated!!" };
        } catch (error) {
            return { message: error.message }
        }
    }

    async delete(id) {
        try {
            const deleteCategory = await this.categoryModel.findOne({ $and: [{ _id: id, isDeleted: false }] })
            if (deleteCategory !== null) {
                await this.categoryModel.findOneAndUpdate({ _id: id },
                    {
                        isDeleted: true,
                        isActive: false
                    })
                return { message: "Category deleted successully!!" };
            }
            return { message: "Category is not deleted!!" };
        } catch (error) {
            return { message: error.message }
        }
    }

    async getCategoryById(id) {
        try {
            const getById = await this.categoryModel.findOne({ $and: [{ _id: id, isDeleted: false }] })
                .populate('scienceFairId', 'name date location1')
                .select('-updatedAt -createdAt -__v')
            if (getById) {
                return getById;
            }
            return { message: "No data found!!" };
        } catch (error) {
            return { message: error.message }
        }
    }

    async getData(body) {
        try {
            const option = { ...body };
            if (!option.hasOwnProperty('query')) {
                option['query'] = {};
            }
            option.query['isDeleted'] = false;
            const categoryData = await paginate(option, this.categoryModel)
            if (!categoryData) {
                return { message: "No Data!!" };
            }
            return categoryData;
        } catch (error) {
            return { message: error.message }
        }
    }
}

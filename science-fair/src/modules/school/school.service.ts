import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PaginateModel } from 'mongoose';
import { paginate } from 'src/helper/paginate';
import { Project, ProjectDocument } from '../project/project.schema';
import { Student, StudentDocument } from '../student/student.schema';
import { User, UserDocument } from '../user/user.schema';
import { CreateSchoolDto } from './dto/createSchool.dto';
import { School, SchoolDocument } from './school.schema';

@Injectable()
export class SchoolService {
    constructor(@InjectModel(School.name) private schoolModel: PaginateModel<SchoolDocument>,
        @InjectModel(Student.name) private studentModel: PaginateModel<StudentDocument>,
        @InjectModel(User.name) private userModel: PaginateModel<UserDocument>,
        @InjectModel(Project.name) private projectModel: PaginateModel<ProjectDocument>
    ) {
    }

    async create(data: CreateSchoolDto) {
        try {
            const model = new this.schoolModel();
            const schools = await this.schoolModel.find({ $and: [{ scienceFairId: data.scienceFairId }, { schoolCode: data.schoolCode }] })
            if (schools.length !== 0) {
                return { message: 'This school code is already generated for other school!!!' }
            }
            model.name = data.name
            model.location1 = data.location
            model.schoolCode = data.schoolCode
            model.scienceFairId = data.scienceFairId
            const school = await model.save();
            if (school) {
                return { message: "School added successfully!!" }
            }
            return { message: "School not added!!" }
        } catch (error) {
            return { message: error.message };
        }
    }

    async update(body, id) {
        try {
            if (body.hasOwnProperty('schoolCode')) {
                const checkCode = await this.schoolModel.find({ $and: [{ _id: { $ne: id } }, { schoolCode: body.schoolCode }] })
                if (checkCode.length > 0) {
                    return { message: "This school code is already generated for other school!!!" }
                }
            }
            const updateSchool = await this.schoolModel.findOneAndUpdate({ _id: id }, body)
            if (updateSchool !== null) {
                return { message: "School updated successfully!!" };
            }
            return { message: "School not updated!!" };
        } catch (error) {
            return { message: error.message };
        }
    }

    async delete(id) {
        try {
            const status = await this.schoolModel.findOne({ id })
            if (!status) {
                return { message: "This Project is not exist!!" };
            }
            const checkStudent = await this.studentModel.find({ $and: [{ schoolId: status._id }, { isDeleted: false }] })
            const checkUser = await this.userModel.find({ $and: [{ schoolId: status._id }, { isDeleted: false }] })
            const checkProject = await this.projectModel.find({ $and: [{ schoolId: status._id }, { isDeleted: false }] })
            if (checkStudent.length !== 0 || checkUser.length !== 0 || checkProject.length !== 0) {
                return { message: "You cannot delete the school, that already has school admins or students or projects!!" };
            }
            if (status.isDeleted === true) {
                return { message: "This school is already deleted!!!" };
            }
            const check = await this.schoolModel.findOneAndUpdate({ id },
                {
                    isActive: false,
                    isDeleted: true,
                    schoolCode: ""
                })
            if (!check) {
                return { message: "School is not deleted!!" };
            }
            return { message: "School Deleted Successfully!!" };
        } catch (error) {
            return { message: error.message };
        }
    }

    async getSchoolById(id) {
        try {
            const getById = await this.schoolModel.findOne({ $and: [{ _id: id, isDeleted: false }] })
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

    async getData(body, auth) {
        try {
            const option = { ...body };
            if (!option.hasOwnProperty('query')) {
                option['query'] = {};
            }
            option.query['isDeleted'] = false;
            if (auth.userRole === 2) {
                // const school = await this.schoolModel.findOne({ _id: auth.schoolId })
                option.query['scienceFairId'] = auth.scienceFairId
            }

            const schoolData = await paginate(option, this.schoolModel)
            if (!schoolData) {
                return { message: "No Data!!" }
            }
            return schoolData;
        } catch (error) {
            return { message: error.message };
        }
    }
}

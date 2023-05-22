import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PaginateModel } from 'mongoose';
import { paginate } from 'src/helper/paginate';
import { convertIntoCSV } from 'src/middleware/csvConvert.middleware';
import { Result, ResultDocument } from '../result/result.schema';
import { School, SchoolDocument } from '../school/school.schema';
import { ScienceFair, ScienceFairDocument } from '../science-fair/science-fair.schema';
import { User, UserDocument } from '../user/user.schema';
import { CreateProjectDto } from './dto/createProject.dto';
import { Project, ProjectDocument } from './project.schema';

@Injectable()
export class ProjectService {
    constructor(
        @InjectModel(Project.name) private projectModel: PaginateModel<ProjectDocument>,
        @InjectModel(User.name) private userModel: PaginateModel<UserDocument>,
        @InjectModel(School.name) private schoolModel: PaginateModel<SchoolDocument>,
        @InjectModel(Result.name) private resultModel: PaginateModel<ResultDocument>,
        @InjectModel(ScienceFair.name) private scienceFairModel: PaginateModel<ScienceFairDocument>
    ) { }

    async create(data: CreateProjectDto, user) {
        try {
            const model = new this.projectModel();
            const pCode = await this.projectModel.find({ $and: [{ scienceFairId: data.scienceFairId }, { isDeleted: false }] }).sort({ createdAt: -1 })
            let projectCode: String
            if (pCode.length === 0) {
                projectCode = "100"
            }
            else {
                let code = pCode[0]
                const incr = +code.projectCode + 1
                projectCode = incr.toString()
                const pro = await this.projectModel.findOne({ $and: [{ scienceFairId: data.scienceFairId }, { isDeleted: false }, { projectCode: projectCode }] })
                if (pro) {
                    const pCode1 = await this.projectModel.find({ $and: [{ scienceFairId: data.scienceFairId }, { isDeleted: false }] }).sort({ updatedAt: -1 })
                    let code1 = pCode1[0]
                    const incr1 = +code1.projectCode + 1
                    projectCode = incr1.toString()
                }
            }
            model.name = data.name
            model.description = data.description
            model.addedBy = user._id
            model.scienceFairId = data.scienceFairId
            model.schoolId = data.schoolId
            model.categoryId = data.categoryId
            model.strandId = data.strandId
            model.projectCode = projectCode
            if (data.subStrandId) {
                model.subStrandId = data.subStrandId
            }
            if (data.judges) {
                model.judges = data.judges
            }
            if (data.students) {
                model.students = data.students
            }
            const project = await model.save();
            if (project) {
                return { message: "Project added successfully!!" }
            }
            return { message: "Project not added!!" }
        } catch (error) {
            return { message: error.message }
        }
    }

    async update(body, id) {
        try {
            const updateProject = await this.projectModel.findOneAndUpdate({ _id: id }, body)
            const data = await this.projectModel.findOne({ _id: id })
            if (updateProject !== null) {
                return { message: "Project updated successfully!!" };
            }
            return { message: "Project not updated!!" };
        } catch (error) {
            return { message: error.message }
        }
    }

    async delete(id) {
        try {
            const status = await this.projectModel.findOne({ id })
            if (!status) {
                return { message: "This Project is not exist!!" };
            }
            const checkResult = await this.resultModel.find({ $and: [{ projectId: status._id }, { isDeleted: false }] })
            if (checkResult.length !== 0) {
                return { message: "You cannot delete the project, which is already been evaluated!!" };
            }
            if (status.isDeleted === true) {
                return { message: "Project Already Deleted!!!" };
            }
            const check = await this.projectModel.findOneAndUpdate({ id },
                {
                    isActive: false,
                    isDeleted: true,
                    projectCode: ""
                })
            if (!check) {
                return { message: "Project is not deleted!!" }
            }
            return { message: `Project Deleted Successfully!!` };
        } catch (error) {
            return { message: error.message };
        }
    }

    async getProjectById(id) {
        try {
            const getById = await this.projectModel.findOne({ $and: [{ _id: id, isDeleted: false }] })
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

    async getData(body, auth) {
        try {
            const option = { ...body };
            if (!option.hasOwnProperty('query')) {
                option['query'] = {};
            }
            option.query['isDeleted'] = false;
            if (auth.userRole === 2) {
                const checkSchool = await this.schoolModel.findOne({ _id: auth.schoolId });
                option.query['schoolId'] = checkSchool._id;
            }
            if (auth.userRole === 3) {
                const checkJudge = await this.userModel.findOne({ _id: auth._id });
                option.query['judges'] = { $ne: checkJudge._id };
                option.query['students'] = { $not: { $size: 0 } };
                option.query['averageScore'] = { $in: [0, null] };
                option.query['finalEvalCount'] = { $lt: 3 };
            }
            const projectData = await paginate(option, this.projectModel)
            if (!projectData) {
                return { message: "No Data!!" }
            }
            return projectData;
        } catch (error) {
            return { message: error.message }
        }
    }

    async projectCSV(auth, id) {
        try {
            const scienceFair = await this.scienceFairModel.findById(id)
            let data = await this.projectModel.find()
                .select('-__v -createdAt -updatedAt -isActive -isDeleted')
                .populate('schoolId', 'name')
                .populate('strandId', 'strandName')
                .populate('categoryId', 'name')
                .populate('judges', 'firstName')
                .populate('students', 'firstName')
                .where('scienceFairId').equals(id)
                .where('isDeleted').equals(false)

            if (auth.userRole === 2) {
                data = await this.projectModel.find()
                    .select('-__v -createdAt -updatedAt -isActive -isDeleted')
                    .populate('schoolId', 'name')
                    .populate('strandId', 'strandName')
                    .populate('categoryId', 'name')
                    .populate('judges', 'firstName')
                    .populate('students', 'firstName')
                    .where('scienceFairId').equals(id)
                    .where('schoolId').equals(auth.schoolId)
                    .where('isDeleted').equals(false)
            }

            if (!data) {
                return { message: "Data not found!!" };
            }
            let csvData = [], stud = "", jud = ""

            if (data.length === 0) {
                return { message: 'Cannot download the empty file!!' };
            }
            data.forEach(element => {
                element.students.forEach(element1 => {
                    stud = stud + element1['_id'] + '-' + element1['firstName'] + ","
                });
                element.judges.forEach(element2 => {
                    jud = jud + element2['_id'] + '-' + element2['firstName'] + ","
                });
                csvData.push({
                    "Project Code": element.projectCode, "Project Name": element.name, "Description": element.description,
                    "Strand": element.strandId['strandName'], "Category": element.categoryId['name'], "School": element.schoolId['name'],
                    "Score": element.averageScore || 0, "Rank": element.rank || 0, "Judges": jud || 0, "Students": stud || 0
                })
                stud = ""
                jud = ""
            });

            const fileNM = scienceFair.name.replace(/\s/g, '_') + "_" + '_ProjectList'
            await convertIntoCSV(csvData, fileNM)
            return { fileName: `${fileNM}.csv` };

        } catch (error) {
            return { message: error.message };
        }
    }
}

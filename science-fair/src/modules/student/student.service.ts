import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PaginateModel } from 'mongoose';
import { paginate } from 'src/helper/paginate';
import { convertIntoCSV } from 'src/middleware/csvConvert.middleware';
import { Project, ProjectDocument } from '../project/project.schema';
import { ScienceFair, ScienceFairDocument } from '../science-fair/science-fair.schema';
import { CreateStudentDto } from './dto/createStudent.dto';
import { Student, StudentDocument } from './student.schema';

@Injectable()
export class StudentService {
    constructor(@InjectModel(Student.name) private readonly studentModel: PaginateModel<StudentDocument>,
        @InjectModel(Project.name) private readonly projectModel: PaginateModel<ProjectDocument>,
        @InjectModel(ScienceFair.name) private readonly scienceFairModel: PaginateModel<ScienceFairDocument>
    ) { }

    async create(data: CreateStudentDto, auth) {
        try {
            const model = new this.studentModel();
            let school = data.schoolId
            if (auth.userRole === 2) {
                school = auth.schoolId
            }
            model.firstName = data.firstName
            model.lastName = data.lastName
            model.grade = data.grade
            model.scienceFairId = data.scienceFairId
            model.schoolId = school
            const student = await model.save();
            if (student) {
                return { message: "Student added successfully!!" }
            }
            return { message: "Student not added!!" }
        } catch (error) {
            return { message: error.message }
        }
    }

    async update(body, id) {
        try {
            const updateStudent = await this.studentModel.findOneAndUpdate({ _id: id }, body)
            if (updateStudent !== null) {
                return { message: "Student updated successfully!!" };
            }
            return { message: "Student not updated!!" };
        } catch (error) {
            return { message: error.message }
        }
    }

    async delete(id) {
        try {
            const status = await this.studentModel.findOne({ _id: id });
            if (!status) {
                return { message: "This Student is not exist!!" };
            }
            const checkProjects = await this.projectModel.find({ $and: [{ students: status._id }, { isDeleted: false }] })
            if (checkProjects.length !== 0) {
                return { message: "You cannot delete the student, who is assigned to the project!!!" };
            }
            if (status.isDeleted === true) {
                return { message: "This Student is already deleted!!!" };
            }
            const check = await this.studentModel.findOneAndUpdate({ _id: id },
                {
                    isActive: false,
                    isDeleted: true
                })
            if (!check) {
                return { message: "Student is not deleted!!" };
            }
            return { message: "Student Deleted Successfully!!" };
        } catch (error) {
            return { message: error.message };
        }
    }

    async getStudentById(id) {
        try {
            const getById = await this.studentModel.findOne({ $and: [{ _id: id, isDeleted: false }] })
                .select('-__v -createdAt -updatedAt')
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
                option.query['schoolId'] = auth.schoolId;
            }
            const studentData = await paginate(option, this.studentModel)
            if (!studentData) {
                return { message: "No Data!!" };
            }
            return studentData;

        } catch (error) {
            return { message: error.message }
        }
    }

    async studentCSV(auth, id) {
        try {
            const scienceFair = await this.scienceFairModel.findById(id)
            let data = await this.studentModel.find()
                .select('-__v -createdAt -updatedAt -isActive -isDeleted')
                .populate('schoolId', 'name')
                .where('scienceFairId').equals(id)
                .where('isDeleted').equals(false)

            if (auth.userRole === 2) {
                data = await this.studentModel.find()
                    .select('-__v -createdAt -updatedAt -isActive -isDeleted')
                    .populate('schoolId', 'name')
                    .where('scienceFairId').equals(id)
                    .where('schoolId').equals(auth.schoolId)
                    .where('isDeleted').equals(false)
            }

            if (!data) {
                return { message: "Students not found!!" }
            }
            let csvData = []

            if (data.length === 0) {
                return { message: 'Cannot download the empty file!!' }
            }
            data.forEach(element => {
                csvData.push({
                    "Student Id": element._id.toString(), "Student's firstname": element.firstName, "Student's lastname": element.lastName,
                    "School Name": element.schoolId['name'] || "-", "Grade": element.grade
                })
            });

            const fileNM = scienceFair.name.replace(/\s/g, '_') + "_" + '_StudentList'
            await convertIntoCSV(csvData, fileNM)
            return { fileName: `${fileNM}.csv` }

        } catch (error) {
            return { message: error.message }
        }
    }
}
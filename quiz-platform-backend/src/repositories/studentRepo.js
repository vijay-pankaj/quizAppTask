import models from "../../models/index.js";

const createStudent = async (data) => {

  return await models.Student.create(data);

};

const findStudentByUserId = async (userId) => {

  return await models.Student.findOne({
    where: { user_id: userId }
  });

};

export default {
  createStudent,
  findStudentByUserId
};
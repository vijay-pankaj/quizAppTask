import models from "../../models/index.js";

const createStudent = async (data, transaction = null) => {

  return await models.Student.create(data, { transaction });

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
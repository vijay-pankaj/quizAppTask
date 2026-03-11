import { Op } from "sequelize";
import models from "../../models/index.js";

const createQuiz = async (data, transaction = null) => {

  return await models.Quiz.create(data, { transaction });

};

const getQuizzes = async (bundleId, page = 1, limit = 10, search = null) => {

  const offset = (page - 1) * limit;

  const where = {
    bundle_id: bundleId
  };

  if (search) {

    where.title = {
      [Op.like]: `%${search}%`
    };

  }

  const result = await models.Quiz.findAndCountAll({
    where,
    limit,
    offset,
    order: [["createdAt", "DESC"]]
  });

  return result;

};

export default {
  createQuiz,
  getQuizzes
};
import { Op } from "sequelize";
import Quiz from "../../models/quiz.js";

const createQuiz = async (data) => {
  return await Quiz.create(data);
};

const getQuizzes = async (bundleId, page, limit, search) => {

  const offset = (page - 1) * limit;

  const where = {
    bundle_id: bundleId,
  };

  if (search) {
    where.title = {
      [Op.like]: `%${search}%`,
    };
  }

  const result = await Quiz.findAndCountAll({
    where,
    limit,
    offset,
    order: [["createdAt", "DESC"]],
  });

  return result;
};

export default {
  createQuiz,
  getQuizzes,
};
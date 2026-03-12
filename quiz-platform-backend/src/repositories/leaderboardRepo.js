import models from "../../models/index.js";
import { Op } from "sequelize";

const getLeaderboard = async (quizId) => {

  const attempts = await models.QuizAttempt.findAll({

    where: {
      quiz_id: quizId,
      submitted_at: {
        [Op.ne]: null
      }
    },

    include: [
      {
        model: models.Student,
        as: "Student",
        attributes: ["id", "name"]
      }
    ],

    order: [
      ["score", "DESC"],
      ["submitted_at", "ASC"]
    ]

  });

  return attempts;

};

export default {
  getLeaderboard
};
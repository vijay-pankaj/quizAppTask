import quizRepo from "../repositories/quizRepo.js";

const createQuiz = async (data,id) => {

  const quiz = await quizRepo.createQuiz({
    bundle_id: id,
    title: data.title,
    duration: data.duration,
    total_marks: data.total_marks,
  });

  return quiz;
};

const getQuizzes = async (query, bundleId) => {

  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 10;
  const search = query.search || "";

  const result = await quizRepo.getQuizzes(bundleId, page, limit, search);

  return {
    totalRecords: result.count,
    totalPages: Math.ceil(result.count / limit),
    currentPage: page,
    quizzes: result.rows,
  };
};

export default {
  createQuiz,
  getQuizzes,
};
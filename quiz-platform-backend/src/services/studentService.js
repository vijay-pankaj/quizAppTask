import bcrypt from "bcrypt";
import models from "../../models/index.js";
import sequelize from "../config/sequelizeConfig.js";
import studentRepo from "../repositories/studentRepo.js";
import userRepo from "../repositories/userRepo.js";
const registerStudent = async (data) => {

  const transaction = await sequelize.transaction();

  try {

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await userRepo.createUser(
      {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role_id: 3 
      },
      { transaction }
    );

    const student = await studentRepo.createStudent(
      {
        user_id: user.id,
        name: data.name,
        email: data.email,
        password: hashedPassword
      },
      { transaction }
    );

    await transaction.commit();

    return student;

  } catch (error) {

    await transaction.rollback();
    throw error;

  }
};

const submitQuiz = async (attemptId, answers) => {

  const transaction = await sequelize.transaction();

  try {
    console.log(attemptId)
    const attempt = await models.QuizAttempt.findByPk(attemptId);

    if (!attempt) {
      throw new Error("Quiz attempt not found");
    }

    let score = 0;

    // 2️⃣ Get all questions in one query
    const questionIds = answers.map(a => a.question_id);

    const questions = await models.Question.findAll({
      where: { id: questionIds }
    });

    const questionMap = {};

    questions.forEach(q => {
      questionMap[q.id] = q;
    });

    // 3️⃣ Prepare answer inserts
    const answerData = [];

    for (const ans of answers) {

      const question = questionMap[ans.question_id];

      if (!question) {
        throw new Error(`Question ${ans.question_id} not found`);
      }

      if (question.correct_answer === ans.selected_option) {
        score += question.marks;
      }

      answerData.push({
        attempt_id: attemptId,
        question_id: ans.question_id,
        selected_option: ans.selected_option
      });

    }

    await models.Answer.bulkCreate(answerData, { transaction });

    await models.QuizAttempt.update(
      {
        score,
        submitted_at: new Date()
      },
      {
        where: { id: attemptId },
        transaction
      }
    );

    await transaction.commit();

    return score;

  } catch (error) {

    await transaction.rollback();
    throw error;

  }
};
const startQuiz = async (userId, quizId) => {
    console.log("first",userId)
  const student = await models.Student.findOne({
    where: { user_id: userId }
  });

  if (!student) {
    throw new Error("Student profile not found");
  }

  
  const attempt = await models.QuizAttempt.create({
    student_id: student.id,
    quiz_id: quizId
  });

  return attempt;

};
export default {
  registerStudent,
  submitQuiz,
  startQuiz
};
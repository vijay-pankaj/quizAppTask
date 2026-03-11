import bcrypt from "bcrypt";
import models from "../../models/index.js";
import sequelize from "../config/sequelizeConfig.js";
import studentRepo from "../repositories/studentRepo.js";
import userRepo from "../repositories/userRepo.js";

const normalize = (val) => {
  if (!val) return null;
  if (val.length === 1) return `option_${val.toLowerCase()}`; // "B" → "option_b"
  return val.toLowerCase();                                    // "option_b" → "option_b"
};
/* ---------------- REGISTER STUDENT ---------------- */

const registerStudent = async (data) => {

  const transaction = await sequelize.transaction();

  try {

    const existingUser = await userRepo.findUserByEmail(data.email, transaction);

    if (existingUser) {
      throw new Error("Email already registered");
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await userRepo.createUser(
      {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role_id: 3
      },
      transaction
    );

    const student = await studentRepo.createStudent(
      {
        user_id: user.id,
        name: data.name,
        email: data.email,
        password: hashedPassword
      },
      transaction
    );

    await transaction.commit();
    return student;

  } catch (error) {
    await transaction.rollback();
    throw error;
  }

};


/* ---------------- START QUIZ ---------------- */

const startQuiz = async (userId, quizId) => {

  const transaction = await sequelize.transaction();

  try {

    const student = await studentRepo.findStudentByUserId(userId);

    if (!student) throw new Error("Student not found");

    const quiz = await models.Quiz.findByPk(quizId);

    if (!quiz) throw new Error("Quiz not found");

    const attempt = await models.QuizAttempt.create(
      {
        student_id: student.id,
        quiz_id:    quizId,
        score:      0
      },
      { transaction }
    );

    await transaction.commit();
    return attempt;

  } catch (error) {
    await transaction.rollback();
    throw error;
  }

};


/* ---------------- SUBMIT QUIZ ---------------- */

const submitQuiz = async (attemptId, answers) => {

  const transaction = await sequelize.transaction();

  try {

    const attempt = await models.QuizAttempt.findByPk(attemptId, { transaction });

    if (!attempt)            throw new Error("Quiz attempt not found");
    if (attempt.submitted_at) throw new Error("Quiz already submitted");

    // Fetch ALL questions for this quiz (not just answered ones)
    // so we can count skipped ones too
    const allQuestions = await models.Question.findAll({
      where: { quiz_id: attempt.quiz_id },
      transaction
    });

    // Build lookup map: { [question_id]: question }
    const questionMap = {};
    allQuestions.forEach(q => { questionMap[q.id] = q; });

    // Build answered map: { [question_id]: selected_option }
    const answeredMap = {};
    answers.forEach(a => {
      if (a.selected_option !== null && a.selected_option !== undefined) {
        answeredMap[a.question_id] = a.selected_option;
      }
    });

    let score        = 0;
    let correct      = 0;
    let wrong        = 0;
    let skipped      = 0;
    const answerRecords = [];

    for (const question of allQuestions) {

      const selectedOption = answeredMap[question.id] ?? null;

      // ── IMPORTANT: correct_answer in DB must store "option_a" / "option_b" etc.
      // If your DB stores "A"/"B"/"C"/"D" instead, change the comparison below.
     const isCorrect = selectedOption !== null &&
                  normalize(question.correct_answer) === normalize(selectedOption);

      if (selectedOption === null) {
        skipped++;
      } else if (isCorrect) {
        correct++;
        score += question.marks ?? 1;   // fallback to 1 mark if marks column missing
      } else {
        wrong++;
      }

      answerRecords.push({
        attempt_id:      attemptId,
        question_id:     question.id,
        selected_option: selectedOption   // null for skipped
      });

    }

    // Save all answer records (upsert style — ignore if already exists)
    await models.Answer.bulkCreate(answerRecords, {
      transaction,
      ignoreDuplicates: true   // safe if re-submitted somehow
    });

    const totalQuestions = allQuestions.length;
    const totalMarks     = allQuestions.reduce((sum, q) => sum + (q.marks ?? 1), 0);
    const percentage     = totalMarks > 0 ? Math.round((score / totalMarks) * 100) : 0;

    await models.QuizAttempt.update(
      { score, submitted_at: new Date() },
      { where: { id: attemptId }, transaction }
    );

    await transaction.commit();

    return {
      score,
      correct_answers:  correct,
      wrong_answers:    wrong,
      skipped,
      total_questions:  totalQuestions,
      scored:           score,
      total_marks:      totalMarks,
      percentage,
    };

  } catch (error) {
    await transaction.rollback();
    throw error;
  }

};


/* ---------------- GET RESULT ---------------- */



const getResult = async (attemptId) => {

  const attempt = await models.QuizAttempt.findByPk(attemptId, {
    include: [
      {
        model: models.Answer,
        as: "Answers",
        include: [
          {
            model: models.Question,
            as: "Question",
            attributes: [
              "id", "question",
              "option_a", "option_b", "option_c", "option_d",
              "correct_answer", "marks"
            ]
          }
        ]
      },
      {
        model: models.Quiz,
        as: "Quiz",
        attributes: ["id", "title"]
      }
    ]
  });

  if (!attempt) throw new Error("Attempt not found");

  let correct    = 0;
  let wrong      = 0;
  let skipped    = 0;
  let totalMarks = 0;
  let scored     = 0;

  const answersReview = attempt.Answers.map(ans => {
    const q              = ans.Question;
    const selected       = normalize(ans.selected_option);   // "option_b" | null
    const correctAnswer  = normalize(q.correct_answer);      // always "option_b" shape
    const isCorrect      = selected !== null && selected === correctAnswer;

    totalMarks += q.marks ?? 1;

    if (selected === null) {
      skipped++;
    } else if (isCorrect) {
      correct++;
      scored += q.marks ?? 1;
    } else {
      wrong++;
    }

    return {
      question:        q.question,
      option_a:        q.option_a,
      option_b:        q.option_b,
      option_c:        q.option_c,
      option_d:        q.option_d,
      selected_option: selected,        // normalized "option_b" | null
      correct_option:  correctAnswer,   // normalized "option_b"
      is_correct:      isCorrect,
    };
  });

  const percentage = totalMarks > 0
    ? Math.round((scored / totalMarks) * 100)
    : 0;

  return {
    quiz_title:      attempt.Quiz?.title ?? "",
    correct_answers: correct,
    wrong_answers:   wrong,
    skipped,
    total_questions: attempt.Answers.length,
    scored,
    total_marks:     totalMarks,
    percentage,
    auto_submitted:  attempt.auto_submitted ?? false,
    answers:         answersReview,
  };

};


export default {
  registerStudent,
  startQuiz,
  submitQuiz,
  getResult
};
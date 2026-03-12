import bcrypt from "bcrypt";
import models from "../../models/index.js";
import sequelize from "../config/sequelizeConfig.js";
import attemptRepo from "../repositories/attemptRepo.js";
import studentRepo from "../repositories/studentRepo.js";
import userRepo from "../repositories/userRepo.js";
import leaderboardRepo from "../repositories/leaderboardRepo.js";

import sendEmail from "../utils/mailer.js";
const normalize = (val) => {
  if (!val) return null;
  if (val.length === 1) return `option_${val.toLowerCase()}`; // "B" → "option_b"
  return val.toLowerCase(); // "option_b" → "option_b"
};
/* ---------------- REGISTER STUDENT ---------------- */

const registerStudent = async (data) => {
  const transaction = await sequelize.transaction();

  try {
    const existingUser = await userRepo.findUserByEmail(
      data.email,
      transaction,
    );

    if (existingUser) {
      throw new Error("Email already registered");
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await userRepo.createUser(
      {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role_id: 3,
      },
      transaction,
    );

    const student = await studentRepo.createStudent(
      {
        user_id: user.id,
        name: data.name,
        email: data.email,
        password: hashedPassword,
      },
      transaction,
    );
    await sendEmail(
      student.email,
      "Welcome to Quiz Platform",
      `Hello ${student.name},

Welcome to the Quiz Platform!

You can now log in and start attempting quizzes.

Best of luck!
`,
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
        quiz_id: quizId,
        score: 0,
      },
      { transaction },
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
    const attempt = await models.QuizAttempt.findByPk(attemptId, {
      transaction,
    });

    if (!attempt) throw new Error("Quiz attempt not found");
    if (attempt.submitted_at) throw new Error("Quiz already submitted");

    const allQuestions = await models.Question.findAll({
      where: { quiz_id: attempt.quiz_id },
      transaction,
    });

    const questionMap = {};
    allQuestions.forEach((q) => {
      questionMap[q.id] = q;
    });

    const answeredMap = {};
    answers.forEach((a) => {
      if (a.selected_option !== null && a.selected_option !== undefined) {
        answeredMap[a.question_id] = a.selected_option;
      }
    });

    let score = 0;
    let correct = 0;
    let wrong = 0;
    let skipped = 0;
    const answerRecords = [];

    for (const question of allQuestions) {
      const selectedOption = answeredMap[question.id] ?? null;

     
      const isCorrect =
        selectedOption !== null &&
        normalize(question.correct_answer) === normalize(selectedOption);

      if (selectedOption === null) {
        skipped++;
      } else if (isCorrect) {
        correct++;
        score += question.marks ?? 1; 
      } else {
        wrong++;
      }

      answerRecords.push({
        attempt_id: attemptId,
        question_id: question.id,
        selected_option: selectedOption,
      });
    }

    await models.Answer.bulkCreate(answerRecords, {
      transaction,
      ignoreDuplicates: true, 
    });

    const totalQuestions = allQuestions.length;
    const totalMarks = allQuestions.reduce((sum, q) => sum + (q.marks ?? 1), 0);
    const percentage =
      totalMarks > 0 ? Math.round((score / totalMarks) * 100) : 0;

    await models.QuizAttempt.update(
      { score, submitted_at: new Date() },
      { where: { id: attemptId }, transaction },
    );
const student = await models.Student.findByPk(attempt.student_id);
const quiz = await models.Quiz.findByPk(attempt.quiz_id);

console.log(student);
console.log(quiz);

await sendEmail(
  student.email,
  "Quiz Submitted Successfully - Result",
  `
  <div style="font-family:Arial,Helvetica,sans-serif;background:#f4f6f8;padding:30px">
    <div style="max-width:600px;margin:auto;background:#ffffff;border-radius:10px;overflow:hidden">

      <div style="background:#16a34a;color:white;padding:20px;text-align:center">
        <h2>✅ Quiz Submitted Successfully</h2>
      </div>

      <div style="padding:25px;color:#333">

        <h3>Hello ${student.name},</h3>

        <p>You have successfully submitted your quiz.</p>

        <table style="width:100%;border-collapse:collapse;margin-top:20px">

          <tr>
            <td style="padding:10px;border-bottom:1px solid #ddd"><b>Quiz Title</b></td>
            <td style="padding:10px;border-bottom:1px solid #ddd">${quiz.title}</td>
          </tr>

          <tr>
            <td style="padding:10px;border-bottom:1px solid #ddd"><b>Score</b></td>
            <td style="padding:10px;border-bottom:1px solid #ddd">${score}</td>
          </tr>

          <tr>
            <td style="padding:10px;border-bottom:1px solid #ddd"><b>Total Questions</b></td>
            <td style="padding:10px;border-bottom:1px solid #ddd">${totalQuestions}</td>
          </tr>

          <tr>
            <td style="padding:10px"><b>Percentage</b></td>
            <td style="padding:10px">${percentage}%</td>
          </tr>

        </table>

        <div style="text-align:center;margin-top:25px">
          <a href="http://localhost:5173"
             style="background:#16a34a;color:white;padding:12px 20px;
             text-decoration:none;border-radius:6px;font-weight:bold">
             View Dashboard
          </a>
        </div>

      </div>

      <div style="background:#f1f1f1;padding:15px;text-align:center;font-size:12px;color:#555">
        Quiz Platform © 2026
      </div>

    </div>
  </div>
  `
);
    await transaction.commit();

    return {
      score,
      correct_answers: correct,
      wrong_answers: wrong,
      skipped,
      total_questions: totalQuestions,
      scored: score,
      total_marks: totalMarks,
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
              "id",
              "question",
              "option_a",
              "option_b",
              "option_c",
              "option_d",
              "correct_answer",
              "marks",
            ],
          },
        ],
      },
      {
        model: models.Quiz,
        as: "Quiz",
        attributes: ["id", "title"],
      },
    ],
  });

  if (!attempt) throw new Error("Attempt not found");

  let correct = 0;
  let wrong = 0;
  let skipped = 0;
  let totalMarks = 0;
  let scored = 0;

  const answersReview = attempt.Answers.map((ans) => {
    const q = ans.Question;
    const selected = normalize(ans.selected_option); // "option_b" | null
    const correctAnswer = normalize(q.correct_answer); // always "option_b" shape
    const isCorrect = selected !== null && selected === correctAnswer;

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
      question: q.question,
      option_a: q.option_a,
      option_b: q.option_b,
      option_c: q.option_c,
      option_d: q.option_d,
      selected_option: selected, 
      correct_option: correctAnswer, 
      is_correct: isCorrect,
    };
  });

  const percentage =
    totalMarks > 0 ? Math.round((scored / totalMarks) * 100) : 0;

  return {
    quiz_title: attempt.Quiz?.title ?? "",
    correct_answers: correct,
    wrong_answers: wrong,
    skipped,
    total_questions: attempt.Answers.length,
    scored,
    total_marks: totalMarks,
    percentage,
    auto_submitted: attempt.auto_submitted ?? false,
    answers: answersReview,
  };
};

const updateStudent = async (id, data) => {
  return await studentRepo.updateStudent(id, data);
};

const deleteStudent = async (id) => {
  return await studentRepo.deleteStudent(id);
};

const getAttemptHistory = async (userId) => {

  const student = await studentRepo.findStudentByUserId(userId);
  if (!student) throw new Error("Student not found");

  const attempts = await models.QuizAttempt.findAll({
    where: { student_id: student.id },
    include: [
      {
        model: models.Quiz,
        as: "Quiz",
        attributes: ["id", "title"],
        include: [
          {
            model: models.Question,
            as: "Questions",
            attributes: ["marks"],
          }
        ]
      }
    ],
    order: [["createdAt", "DESC"]],
  });

  return attempts.map(a => {
    // Sum marks from all questions in this quiz
    const totalMarks = a.Quiz?.Questions?.reduce((sum, q) => sum + (q.marks ?? 1), 0) ?? 0;
    const percentage = totalMarks > 0 ? Math.round((a.score / totalMarks) * 100) : 0;

    return {
      attempt_id:    a.id,
      quiz_title:    a.Quiz?.title ?? "",
      score:         a.score,
      total_marks:   totalMarks,
      percentage,
      submitted_at:  a.submitted_at,
    };
  });

};


const leaderboard = async (quizId) => {

  const attempts = await leaderboardRepo.getLeaderboard(quizId);

  let rank = 1;

  const leaderboardData = attempts.map((a) => {

    const row = {
      rank: rank++,
      student_name: a.Student?.name ?? "",
      score: a.score,
      submitted_at: a.submitted_at
    };

    return row;

  });

  return leaderboardData;
};
export default {
  registerStudent,
  startQuiz,
  submitQuiz,
  getResult,
  updateStudent,
  deleteStudent,
  getAttemptHistory,
  leaderboard
};

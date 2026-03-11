import axios from "axios";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTheme } from "../Hooks/useTheame";
import { API_BASE_URL } from "../config/api";

const QUIZ_URL   = `${API_BASE_URL}/api/student/bundle`;
const SUBMIT_URL = `${API_BASE_URL}/api/student/submit-quiz`;
const START_URL  = `${API_BASE_URL}/api/student/start-quiz`;

const OPTIONS = [
  { letter: "A", key: "option_a" },
  { letter: "B", key: "option_b" },
  { letter: "C", key: "option_c" },
  { letter: "D", key: "option_d" },
];

export default function StartTest() {
  const { setId }  = useParams();
  const navigate   = useNavigate();
  const { t }      = useTheme();

  const [questions, setQuestions]       = useState([]);
  const [quizTitle, setQuizTitle]       = useState("");
  const [loading, setLoading]           = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers]           = useState({});
  const [timeLeft, setTimeLeft]         = useState(30 * 60);
  const [attemptId, setAttemptId]       = useState(null);
  const [submitting, setSubmitting]     = useState(false);
  const [submitted, setSubmitted]       = useState(false);
  const [error, setError]               = useState(null);
  const timerRef                        = useRef(null);
  const submittedRef                    = useRef(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const token   = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        const qRes = await axios.get(`${QUIZ_URL}/${setId}/quizzes`, { headers });
        const qs   = qRes.data?.data ?? qRes.data ?? [];
        setQuestions(Array.isArray(qs) ? qs : []);
        if (qRes.data?.title) setQuizTitle(qRes.data.title);

        const attemptRes = await axios.post(`${START_URL}/${setId}`, {}, { headers });
        setAttemptId(attemptRes.data?.attempt_id);

      } catch (err) {
        setError(err.response?.data?.message || "Failed to load questions.");
        setQuestions([]);
      } finally {
        setLoading(false);
      }
    };
    load();
    return () => clearInterval(timerRef.current);
  }, [setId]);

  const handleSubmit = useCallback(
    async (auto = false) => {
      if (submittedRef.current || submitting) return;
      submittedRef.current = true;
      clearInterval(timerRef.current);
      setSubmitted(true);
      setSubmitting(true);
      setError(null);

      try {
        // Send all questions — null selected_option means skipped
        const answersPayload = questions.map((q) => ({
          question_id:     q.id,
          selected_option: answers[q.id] ?? null,
        }));

        const token = localStorage.getItem("token");
        await axios.post(
          `${SUBMIT_URL}/${attemptId}`,
          { answers: answersPayload, auto_submitted: auto },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // Navigate to result — Result page fetches its own data via GET /result/:id
        navigate(`/result/${attemptId}`, { replace: true });

      } catch (err) {
        setError(err.response?.data?.message || "Submission failed. Please try again.");
        submittedRef.current = false;
        setSubmitting(false);
        setSubmitted(false);
      }
    },
    [submitting, questions, answers, attemptId, navigate]
  );

  useEffect(() => {
    if (loading || submitted) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) { clearInterval(timerRef.current); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [loading, submitted]);

  useEffect(() => {
    if (timeLeft === 0 && !submitted) handleSubmit(true);
  }, [timeLeft]);

  const formatTime = (secs) => {
    const m = String(Math.floor(secs / 60)).padStart(2, "0");
    const s = String(secs % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  const selectAnswer = (qId, optionKey) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [qId]: optionKey }));
  };

  const timerColor =
    timeLeft <= 60  ? "text-rose-500"  :
    timeLeft <= 180 ? "text-amber-500" :
    t.accent ?? "text-indigo-600";

  const currentQ      = questions[currentIndex];
  const totalQ        = questions.length;
  const answeredCount = Object.keys(answers).length;

  if (loading) return (
    <div className={`min-h-screen ${t.bg} flex items-center justify-center`}>
      <div className={`w-10 h-10 border-4 ${t.accentBorder} border-t-transparent rounded-full animate-spin`} />
    </div>
  );

  if (questions.length === 0) return (
    <div className={`min-h-screen ${t.bg} flex flex-col items-center justify-center gap-4`}>
      <span className="text-5xl">📭</span>
      <p className={`text-lg font-bold ${t.text}`}>No questions found for this quiz</p>
      {error && <p className="text-rose-500 text-sm">{error}</p>}
      <button onClick={() => navigate(-1)} className={`${t.accentBg} text-white px-5 py-2 rounded-xl font-semibold text-sm`}>
        Go Back
      </button>
    </div>
  );

  if (submitting) return (
    <div className={`min-h-screen ${t.bg} flex flex-col items-center justify-center gap-4`}>
      <div className={`w-10 h-10 border-4 ${t.accentBorder} border-t-transparent rounded-full animate-spin`} />
      <p className={`text-base font-bold ${t.text}`}>Submitting your test…</p>
    </div>
  );

  return (
    <div className={`min-h-screen ${t.bg} transition-colors duration-300`}>

      {/* Sticky top bar */}
      <div className={`sticky top-0 z-40 ${t.bgCard} border-b ${t.border} px-4 py-3 shadow-sm`}>
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">

          <div className="flex items-center gap-3 min-w-0">
            <button onClick={() => navigate(-1)} className={`text-xl ${t.textMuted} shrink-0`}>←</button>
            <div className="min-w-0">
              <p className={`text-xs font-bold uppercase tracking-widest ${t.textMuted}`}>Quiz</p>
              <p className={`text-sm font-black ${t.text} truncate`}>
                {quizTitle || `Quiz · ${totalQ} Questions`}
              </p>
            </div>
          </div>

          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${t.border} ${t.bgCard} shrink-0`}>
            <span className="text-base">⏱</span>
            <span className={`text-lg font-black tabular-nums ${timerColor}`}>{formatTime(timeLeft)}</span>
          </div>

          <div className="hidden sm:flex items-center gap-2 shrink-0">
            <span className={`text-xs font-semibold ${t.textMuted}`}>{answeredCount}/{totalQ} answered</span>
            <div className={`w-20 h-2 rounded-full overflow-hidden ${t.inputBg} border ${t.border}`}>
              <div
                className={`h-full rounded-full ${t.accentBg} transition-all duration-300`}
                style={{ width: `${(answeredCount / totalQ) * 100}%` }}
              />
            </div>
          </div>

          <button
            onClick={() => handleSubmit(false)}
            disabled={submitting}
            className="bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 text-white px-4 py-2 rounded-xl font-bold text-sm shadow-md transition-all shrink-0"
          >
            Submit
          </button>
        </div>

        <div className="max-w-3xl mx-auto mt-2.5">
          <div className={`h-1 rounded-full overflow-hidden ${t.inputBg}`}>
            <div
              className={`h-full rounded-full ${t.accentBg} transition-all duration-500`}
              style={{ width: `${((currentIndex + 1) / totalQ) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-3xl mx-auto px-4 py-8">

        {error && (
          <div className="mb-5 px-4 py-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-sm font-medium flex items-center justify-between">
            <span>⚠️ {error}</span>
            <button onClick={() => setError(null)} className="text-rose-400 hover:text-rose-600 font-bold ml-4">✕</button>
          </div>
        )}

        <div className="flex items-center justify-between mb-4">
          <span className={`text-sm font-bold ${t.textMuted}`}>
            Question {currentIndex + 1} <span className={t.textMuted}>of {totalQ}</span>
          </span>
          {answers[currentQ.id] ? (
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">✓ Answered</span>
          ) : (
            <span className={`text-xs font-semibold ${t.textMuted} border ${t.border} px-2.5 py-1 rounded-full`}>Not answered</span>
          )}
        </div>

        <div className={`${t.bgCard} border ${t.border} rounded-2xl p-6 mb-5 shadow-sm`}>
          <p className={`text-base font-semibold leading-relaxed ${t.text}`}>{currentQ.question}</p>
        </div>

        <div className="flex flex-col gap-3 mb-8">
          {OPTIONS.map(({ letter, key }) => {
            const optionText = currentQ[key];
            if (!optionText) return null;
            const selected = answers[currentQ.id] === key;
            return (
              <button
                key={key}
                onClick={() => selectAnswer(currentQ.id, key)}
                className={`flex items-center gap-4 w-full px-5 py-4 rounded-2xl border-2 text-left transition-all duration-200
                  ${selected ? `${t.accentBorder} ${t.accentLight} shadow-md` : `${t.border} ${t.bgCard} ${t.bgCardHover}`}`}
              >
                <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black shrink-0 transition-all
                  ${selected ? `${t.accentBg} text-white` : `${t.accentLight} ${t.accentText}`}`}>
                  {letter}
                </span>
                <span className={`text-sm font-medium ${selected ? t.accentText : t.text}`}>{optionText}</span>
                {selected && <span className={`ml-auto text-base ${t.accentText}`}>●</span>}
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-between gap-3">
          <button
            onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
            disabled={currentIndex === 0}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border text-sm font-semibold transition-all
              ${t.bgCard} ${t.border} ${t.textSecondary} disabled:opacity-40 ${t.bgCardHover}`}
          >
            ← Prev
          </button>

          <div className="flex gap-1.5 flex-wrap justify-center">
            {questions.slice(0, 10).map((q, i) => (
              <button
                key={q.id}
                onClick={() => setCurrentIndex(i)}
                className={`w-7 h-7 rounded-lg text-xs font-bold border transition-all
                  ${i === currentIndex
                    ? `${t.accentBg} text-white border-transparent`
                    : answers[q.id]
                      ? "bg-emerald-100 border-emerald-300 text-emerald-700"
                      : `${t.bgCard} ${t.border} ${t.textMuted}`}`}
              >
                {i + 1}
              </button>
            ))}
            {totalQ > 10 && <span className={`text-xs ${t.textMuted} self-center`}>+{totalQ - 10} more</span>}
          </div>

          <button
            onClick={() => setCurrentIndex((i) => Math.min(totalQ - 1, i + 1))}
            disabled={currentIndex === totalQ - 1}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border text-sm font-semibold transition-all
              ${t.bgCard} ${t.border} ${t.textSecondary} disabled:opacity-40 ${t.bgCardHover}`}
          >
            Next →
          </button>
        </div>

        <p className={`text-center text-xs ${t.textMuted} mt-6 sm:hidden`}>
          {answeredCount} of {totalQ} questions answered
        </p>
      </div>
    </div>
  );
}
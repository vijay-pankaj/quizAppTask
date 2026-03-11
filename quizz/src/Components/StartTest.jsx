import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useTheme } from "../Hooks/useTheame";
import { API_BASE_URL } from "../config/api";

const QUIZ_URL    = `${API_BASE_URL}/quiz`;
const SETS_URL    = `${API_BASE_URL}/sets`;
const RESULTS_URL = `${API_BASE_URL}/results`;
const OPTIONS     = ["A", "B", "C", "D"];

export default function StartTest() {
  const { setId }  = useParams();
  const navigate   = useNavigate();
  const { t }      = useTheme();

  const [set, setSet]                   = useState(null);
  const [questions, setQuestions]       = useState([]);
  const [loading, setLoading]           = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers]           = useState({});
  const [timeLeft, setTimeLeft]         = useState(null);
  const [submitting, setSubmitting]     = useState(false);
  const [submitted, setSubmitted]       = useState(false);
  const timerRef                        = useRef(null);

  // ── Load set + all questions
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [setRes, qRes] = await Promise.all([
          axios.get(`${SETS_URL}/${setId}`),
          axios.get(`${QUIZ_URL}/set/${setId}/all`),
        ]);
        setSet(setRes.data);
        setQuestions(qRes.data?.data ?? qRes.data ?? []);
        setTimeLeft((setRes.data.duration ?? 30) * 60);
      } catch {
        setQuestions([]);
      } finally {
        setLoading(false);
      }
    };
    load();
    return () => clearInterval(timerRef.current);
  }, [setId]);

  // ── Submit handler — saves result then redirects 
  const handleSubmit = useCallback(async (auto = false) => {
    if (submitted || submitting) return;
    clearInterval(timerRef.current);
    setSubmitted(true);
    setSubmitting(true);

    try {
      const studentId = localStorage.getItem("userId");

      // build answers array for backend
      const answersPayload = questions.map((q) => ({
        questionId:    q._id,
        selectedAnswer: answers[q._id] ?? null,
      }));

      const res = await axios.post(RESULTS_URL, {
        setId,
        studentId,
        answers: answersPayload,
        autoSubmitted: auto,
      });

      const resultId = res.data?._id ?? res.data?.resultId ?? res.data?.id;
      navigate(`/result/${resultId}`, { replace: true });
    } catch (err) {
      console.error("Submit failed:", err);
      setSubmitting(false);
      setSubmitted(false);
    }
  }, [submitted, submitting, questions, answers, setId, navigate]);

  //Timer
  useEffect(() => {
    if (timeLeft === null || submitted) return;
    if (timeLeft <= 0) { handleSubmit(true); return; }

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [timeLeft === null, submitted]);

  // auto submit when timeLeft hits 0
  useEffect(() => {
    if (timeLeft === 0 && !submitted) handleSubmit(true);
  }, [timeLeft]);

  // ── Helpers 
  const formatTime = (secs) => {
    if (secs === null) return "--:--";
    const m = String(Math.floor(secs / 60)).padStart(2, "0");
    const s = String(secs % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  const selectAnswer = (qId, letter) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [qId]: letter }));
  };

  const timerColor = () => {
    if (timeLeft === null) return t.text;
    if (timeLeft <= 60)   return "text-rose-500";
    if (timeLeft <= 180)  return "text-amber-500";
    return t.accent;
  };

  const currentQ      = questions[currentIndex];
  const totalQ        = questions.length;
  const answeredCount = Object.keys(answers).length;

  // ── Loading
  if (loading) {
    return (
      <div className={`min-h-screen ${t.bg} flex items-center justify-center`}>
        <div className={`w-10 h-10 border-4 ${t.accentBorder} border-t-transparent rounded-full animate-spin`} />
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className={`min-h-screen ${t.bg} flex flex-col items-center justify-center gap-4`}>
        <span className="text-5xl">📭</span>
        <p className={`text-lg font-bold ${t.text}`}>No questions available for this test</p>
        <button
          onClick={() => navigate(-1)}
          className={`${t.accentBg} text-white px-5 py-2 rounded-xl font-semibold text-sm`}
        >
          Go Back
        </button>
      </div>
    );
  }

  // ── Submitting overlay
  if (submitting) {
    return (
      <div className={`min-h-screen ${t.bg} flex flex-col items-center justify-center gap-4`}>
        <div className={`w-10 h-10 border-4 ${t.accentBorder} border-t-transparent rounded-full animate-spin`} />
        <p className={`text-base font-bold ${t.text}`}>Submitting your test…</p>
      </div>
    );
  }

  // ── Test UI 
  return (
    <div className={`min-h-screen ${t.bg} transition-colors duration-300`}>

      {/* ── Sticky top bar ── */}
      <div className={`sticky top-0 z-40 ${t.bgCard} border-b ${t.border} px-4 py-3 shadow-sm`}>
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">

          {/* Back + title */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => navigate(-1)}
              className={`text-xl ${t.textMuted} hover:${t.text} transition-all shrink-0`}
            >
              ←
            </button>
            <div className="min-w-0">
              <p className={`text-xs font-bold uppercase tracking-widest ${t.textMuted}`}>Test</p>
              <p className={`text-sm font-black ${t.text} truncate`}>{set?.title}</p>
            </div>
          </div>

          {/* Timer */}
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${t.border} ${t.bgCard} shrink-0`}>
            <span className="text-base">⏱</span>
            <span className={`text-lg font-black tabular-nums ${timerColor()}`}>
              {formatTime(timeLeft)}
            </span>
          </div>

          {/* Answered count */}
          <div className="hidden sm:flex items-center gap-2 shrink-0">
            <span className={`text-xs font-semibold ${t.textMuted}`}>
              {answeredCount}/{totalQ} answered
            </span>
            <div className={`w-20 h-2 rounded-full overflow-hidden ${t.inputBg} border ${t.border}`}>
              <div
                className={`h-full rounded-full ${t.accentBg} transition-all duration-300`}
                style={{ width: `${(answeredCount / totalQ) * 100}%` }}
              />
            </div>
          </div>

          {/* Submit */}
          <button
            onClick={() => handleSubmit(false)}
            className="bg-emerald-500 hover:bg-emerald-400 text-white px-4 py-2 rounded-xl font-bold text-sm shadow-md transition-all shrink-0"
          >
            Submit
          </button>
        </div>

        {/* Question progress bar */}
        <div className="max-w-3xl mx-auto mt-2.5">
          <div className={`h-1 rounded-full overflow-hidden ${t.inputBg}`}>
            <div
              className={`h-full rounded-full ${t.accentBg} transition-all duration-500`}
              style={{ width: `${((currentIndex + 1) / totalQ) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="max-w-3xl mx-auto px-4 py-8">

        {/* Question number */}
        <div className="flex items-center justify-between mb-4">
          <span className={`text-sm font-bold ${t.textMuted}`}>
            Question {currentIndex + 1} <span className={t.textMuted}>of {totalQ}</span>
          </span>
          {answers[currentQ._id] ? (
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
              ✓ Answered
            </span>
          ) : (
            <span className={`text-xs font-semibold ${t.textMuted} border ${t.border} px-2.5 py-1 rounded-full`}>
              Not answered
            </span>
          )}
        </div>

        {/* Question box */}
        <div className={`${t.bgCard} border ${t.border} rounded-2xl p-6 mb-5 shadow-sm`}>
          <p className={`text-base font-semibold leading-relaxed ${t.text}`}>
            {currentQ.question}
          </p>
        </div>

        {/* Options */}
        <div className="flex flex-col gap-3 mb-8">
          {OPTIONS.map((letter) => {
            const selected = answers[currentQ._id] === letter;
            return (
              <button
                key={letter}
                onClick={() => selectAnswer(currentQ._id, letter)}
                className={`flex items-center gap-4 w-full px-5 py-4 rounded-2xl border-2 text-left transition-all duration-200
                  ${selected
                    ? `${t.accentBorder} ${t.accentLight} shadow-md`
                    : `${t.border} ${t.bgCard} ${t.bgCardHover}`
                  }`}
              >
                {/* Letter badge */}
                <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black shrink-0 transition-all
                  ${selected ? `${t.accentBg} text-white` : `${t.accentLight} ${t.accentText}`}`}
                >
                  {letter}
                </span>
                <span className={`text-sm font-medium ${selected ? t.accentText : t.text}`}>
                  {currentQ[`option${letter}`]}
                </span>
                {selected && (
                  <span className={`ml-auto text-base ${t.accentText}`}>●</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Prev / Next navigation */}
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
            disabled={currentIndex === 0}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border text-sm font-semibold transition-all
              ${t.bgCard} ${t.border} ${t.textSecondary} disabled:opacity-40 ${t.bgCardHover}`}
          >
            ← Prev
          </button>

          {/* Question dots — max 10 shown */}
          <div className="flex gap-1.5 flex-wrap justify-center">
            {questions.slice(0, 10).map((q, i) => (
              <button
                key={q._id}
                onClick={() => setCurrentIndex(i)}
                className={`w-7 h-7 rounded-lg text-xs font-bold border transition-all
                  ${i === currentIndex
                    ? `${t.accentBg} text-white border-transparent`
                    : answers[q._id]
                      ? `bg-emerald-100 border-emerald-300 text-emerald-700`
                      : `${t.bgCard} ${t.border} ${t.textMuted}`
                  }`}
              >
                {i + 1}
              </button>
            ))}
            {totalQ > 10 && (
              <span className={`text-xs ${t.textMuted} self-center`}>+{totalQ - 10} more</span>
            )}
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

        {/* Mobile answered count */}
        <p className={`text-center text-xs ${t.textMuted} mt-6 sm:hidden`}>
          {answeredCount} of {totalQ} questions answered
        </p>
      </div>
    </div>
  );
}
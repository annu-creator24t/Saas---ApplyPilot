"use client";

import { useEffect, useState } from "react";

import { useResume } from "@/context/ResumeContext";

import { generateInterview } from "@/services/interview";
import { evaluateAnswer } from "@/services/evaluateAnswer";

import InterviewHeader from "@/components/interview/InterviewHeader";
import ProgressBar from "@/components/interview/ProgressBar";
import QuestionCard from "@/components/interview/QuestionCard";
import AnswerBox from "@/components/interview/AnswerBox";
import EvaluationCard from "@/components/interview/EvaluationCard";
import Navigation from "@/components/interview/Navigation";
import InterviewSummary from "@/components/interview/InterviewSummary";

interface InterviewQuestion {
  question: string;
  category: string;
  difficulty: string;
}

interface Evaluation {
  score: number;
  strengths: string[];
  improvements: string[];
  ideal_answer: string;
}

export default function InterviewPage() {
  const {
    resumeText,
    jobDescription,
  } = useResume();

  const [questions, setQuestions] =
    useState<InterviewQuestion[]>([]);

  const [currentQuestion, setCurrentQuestion] =
    useState(0);

  const [answer, setAnswer] =
    useState("");

  const [evaluation, setEvaluation] =
    useState<Evaluation | null>(null);

  const [results, setResults] =
    useState<Evaluation[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [evaluating, setEvaluating] =
    useState(false);

  const [seconds, setSeconds] =
    useState(0);

  const [completed, setCompleted] =
    useState(false);

  useEffect(() => {
    if (questions.length === 0 || completed)
      return;

    const timer = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);

  }, [questions, completed]);

  async function handleGenerate() {
    if (!resumeText) {
      alert("Please analyze your resume first.");
      return;
    }

    try {

      setLoading(true);

      const data =
        await generateInterview(
          resumeText,
          jobDescription
        );

      let generatedQuestions: InterviewQuestion[] = [];

      if (Array.isArray(data.questions)) {

        generatedQuestions =
          data.questions;

      } else if (
        data.questions &&
        Array.isArray(
          data.questions.questions
        )
      ) {

        generatedQuestions =
          data.questions.questions;

      } else {

        alert(
          "Invalid interview response received."
        );

        return;

      }

      setQuestions(generatedQuestions);

      setCurrentQuestion(0);

      setAnswer("");

      setEvaluation(null);

      setResults([]);

      setCompleted(false);

      setSeconds(0);

    } catch (error) {

      console.error(error);

      alert(
        "Failed to generate interview questions."
      );

    } finally {

      setLoading(false);

    }
  }

  async function handleSubmitAnswer() {

    if (!answer.trim()) {

      alert("Please write your answer.");

      return;

    }

    try {

      setEvaluating(true);

      const response =
        await evaluateAnswer(
          questions[currentQuestion].question,
          answer
        );

      setEvaluation(response);

      setResults((prev) => {

        const updated = [...prev];

        updated[currentQuestion] = response;

        return updated;

      });

    } catch (error) {

      console.error(error);

      alert("Failed to evaluate answer.");

    } finally {

      setEvaluating(false);

    }

  }

  function nextQuestion() {

    if (
      currentQuestion <
      questions.length - 1
    ) {

      setCurrentQuestion(
        (prev) => prev + 1
      );

      setAnswer("");

      setEvaluation(
        results[currentQuestion + 1] ?? null
      );

    } else {

      setCompleted(true);

    }

  }

  function previousQuestion() {

    if (currentQuestion === 0)
      return;

    setCurrentQuestion(
      (prev) => prev - 1
    );

    setAnswer("");

    setEvaluation(
      results[currentQuestion - 1] ?? null
    );

  }

  const averageScore =
    results.length === 0
      ? 0
      : results.reduce(
          (sum, item) => sum + item.score,
          0
        ) / results.length;

  return (    <div className="space-y-8">

      <InterviewHeader
        seconds={seconds}
        loading={loading}
        onGenerate={handleGenerate}
      />

      {questions.length > 0 && !completed && (
        <ProgressBar
          current={currentQuestion + 1}
          total={questions.length}
        />
      )}

      {questions.length === 0 && (

        <div className="rounded-3xl bg-white p-12 text-center shadow-lg">

          <h2 className="text-3xl font-bold">
            Ready to Practice?
          </h2>

          <p className="mt-3 text-slate-500">
            Generate AI interview questions tailored to your resume and job description.
          </p>

        </div>

      )}

      {questions.length > 0 && !completed && (

        <>

          <QuestionCard
            question={questions[currentQuestion]}
            current={currentQuestion + 1}
            total={questions.length}
          />

          <AnswerBox
            answer={answer}
            setAnswer={setAnswer}
            onSubmit={handleSubmitAnswer}
            loading={evaluating}
          />

          <EvaluationCard
            evaluation={evaluation}
          />

          <Navigation
            current={currentQuestion}
            total={questions.length}
            canGoNext={evaluation !== null}
            onPrevious={previousQuestion}
            onNext={nextQuestion}
          />

        </>

      )}

      {completed && (

        <InterviewSummary
          totalQuestions={questions.length}
          averageScore={averageScore}
          duration={seconds}
        />

      )}

    </div>

  );

}
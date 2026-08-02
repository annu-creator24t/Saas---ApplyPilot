"use client";

import { InterviewQuestion } from "@/types/interview-questions";
import QuestionCard from "./QuestionCard";

interface Props {
  title: string;
  questions: InterviewQuestion[];
}

export default function QuestionList({
  title,
  questions,
}: Props) {
  if (!questions.length) return null;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">
        {title}
      </h2>

      <div className="space-y-4">
        {questions.map((question, index) => (
          <QuestionCard
            key={index}
            question={question}
          />
        ))}
      </div>
    </div>
  );
}
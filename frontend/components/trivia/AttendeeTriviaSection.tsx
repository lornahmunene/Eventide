"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { EventItem } from "@/types";
import {
  HelpCircle,
  Award,
  CheckCircle2,
  XCircle,
  Gift,
  Sparkles,
  Zap,
  RotateCcw,
} from "lucide-react";

interface AttendeeTriviaSectionProps {
  event: EventItem;
  className?: string;
  onOpenOrganizerStudio?: () => void;
}

export const AttendeeTriviaSection: React.FC<AttendeeTriviaSectionProps> = ({
  event,
  className = "",
  onOpenOrganizerStudio,
}) => {
  const { getTriviaForEvent, triggerToast } = useApp();
  const questions = getTriviaForEvent(event.id);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [earnedAirtime, setEarnedAirtime] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);

  if (questions.length === 0) {
    return (
      <div className={`p-6 rounded-3xl bg-ink-50 dark:bg-ink-900/60 border border-dashed border-ink-300 dark:border-ink-800 text-center space-y-3 ${className}`}>
        <HelpCircle className="h-10 w-10 text-ink-400 mx-auto" />
        <h4 className="text-sm font-bold text-ink-800 dark:text-ink-200">
          No Live Trivia formulated yet for this event
        </h4>
        <p className="text-xs text-ink-500 max-w-sm mx-auto">
          Are you the event organizer? Formulate interactive trivia questions and airtime rewards for attendees.
        </p>
        {onOpenOrganizerStudio && (
          <button
            onClick={onOpenOrganizerStudio}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-marigold-600 hover:bg-marigold-700 text-white text-xs font-black shadow-md shadow-marigold-600/20"
          >
            <Sparkles className="h-4 w-4" />
            <span>Formulate Trivia Questions Now</span>
          </button>
        )}
      </div>
    );
  }

  const currentQ = questions[currentIndex];

  const handleSelectOption = (idx: number) => {
    if (isAnswerSubmitted) return;
    setSelectedAnswer(idx);
  };

  const handleSubmit = () => {
    if (selectedAnswer === null || !currentQ) return;
    setIsAnswerSubmitted(true);
    const isCorrect = selectedAnswer === currentQ.correctOptionIndex;
    if (isCorrect) {
      setCorrectCount((c) => c + 1);
      setEarnedAirtime((a) => a + currentQ.airtimeRewardKES);
      triggerToast(`🎉 Correct! KES ${currentQ.airtimeRewardKES} Airtime won!`);
    } else {
      triggerToast("Incorrect answer. Try the next question!");
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((i) => i + 1);
      setSelectedAnswer(null);
      setIsAnswerSubmitted(false);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setIsAnswerSubmitted(false);
    setEarnedAirtime(0);
    setCorrectCount(0);
  };

  return (
    <div className={`p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-amber-500/10 via-marigold-500/5 to-hibiscus-500/10 border border-marigold-500/30 space-y-5 shadow-lg ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-marigold-500/20">
        <div>
          <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-marigold-600 dark:text-marigold-400">
            <Zap className="h-4 w-4 text-marigold-500" />
            Live Event Trivia &amp; Airtime Drops
          </span>
          <h3 className="text-xl font-black text-ink-900 dark:text-white mt-0.5">
            Test Your Knowledge &amp; Win Airtime
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-xs font-extrabold border border-emerald-500/30">
            <Gift className="h-3.5 w-3.5" />
            Won: KES {earnedAirtime} Airtime
          </span>

          {onOpenOrganizerStudio && (
            <button
              onClick={onOpenOrganizerStudio}
              className="text-xs font-bold text-marigold-600 hover:text-marigold-700 underline flex items-center gap-1"
            >
              <span>Organizer Studio</span>
            </button>
          )}
        </div>
      </div>

      {/* Progress */}
      <div className="flex items-center justify-between text-xs text-ink-500 dark:text-ink-400">
        <span>
          Question {currentIndex + 1} of {questions.length}
        </span>
        <span>
          Reward: <strong className="text-emerald-600 dark:text-emerald-400 font-extrabold">KES {currentQ.airtimeRewardKES}</strong>
        </span>
      </div>

      {/* Question Prompt */}
      <div className="p-5 rounded-2xl bg-white dark:bg-ink-900 border border-ink-200 dark:border-ink-800 shadow-sm space-y-4">
        <h4 className="text-base sm:text-lg font-black text-ink-900 dark:text-white">
          {currentQ.question}
        </h4>

        {/* Options */}
        <div className="space-y-2.5">
          {currentQ.options.map((opt, idx) => {
            const isSelected = selectedAnswer === idx;
            const isCorrect = idx === currentQ.correctOptionIndex;

            let choiceClasses =
              "border-ink-200 dark:border-ink-800 bg-ink-50 dark:bg-ink-800/40 hover:border-marigold-400";
            if (isAnswerSubmitted) {
              if (isCorrect) {
                choiceClasses = "border-emerald-500 bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 font-bold";
              } else if (isSelected) {
                choiceClasses = "border-red-500 bg-red-500/15 text-red-600 dark:text-red-400";
              }
            } else if (isSelected) {
              choiceClasses = "border-marigold-500 bg-marigold-500/15 text-marigold-900 dark:text-marigold-200 font-bold";
            }

            return (
              <button
                key={idx}
                disabled={isAnswerSubmitted}
                onClick={() => handleSelectOption(idx)}
                className={`w-full text-left flex items-center justify-between p-3 rounded-xl border text-xs transition-all ${choiceClasses}`}
              >
                <span className="flex items-center gap-2.5">
                  <span className="h-5 w-5 rounded-full bg-black/10 dark:bg-white/10 flex items-center justify-center font-bold text-[10px]">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span>{opt}</span>
                </span>

                {isAnswerSubmitted && isCorrect && (
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                )}
                {isAnswerSubmitted && isSelected && !isCorrect && (
                  <XCircle className="h-4 w-4 text-red-500 shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Explanation / Result */}
        {isAnswerSubmitted && (
          <div
            className={`p-3.5 rounded-xl text-xs font-semibold ${
              selectedAnswer === currentQ.correctOptionIndex
                ? "bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30"
                : "bg-red-500/10 text-red-800 dark:text-red-300 border border-red-500/30"
            }`}
          >
            {selectedAnswer === currentQ.correctOptionIndex ? (
              <p>🎉 Correct! Africa&apos;s Talking Airtime dispatched to your registered phone number!</p>
            ) : (
              <p>Not quite right. Correct answer: <strong>{currentQ.options[currentQ.correctOptionIndex]}</strong></p>
            )}
            {currentQ.explanation && (
              <p className="mt-1 text-[11px] opacity-80">💡 {currentQ.explanation}</p>
            )}
          </div>
        )}

        {/* Action Button */}
        <div className="pt-2">
          {!isAnswerSubmitted ? (
            <button
              disabled={selectedAnswer === null}
              onClick={handleSubmit}
              className="w-full py-2.5 rounded-xl bg-marigold-600 hover:bg-marigold-700 text-white font-bold text-xs shadow-md shadow-marigold-600/20 disabled:opacity-40 transition-all"
            >
              Submit Answer
            </button>
          ) : currentIndex + 1 < questions.length ? (
            <button
              onClick={handleNext}
              className="w-full py-2.5 rounded-xl bg-marigold-600 hover:bg-marigold-700 text-white font-bold text-xs shadow-md shadow-marigold-600/20 transition-all"
            >
              Next Trivia Question →
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleRestart}
                className="flex-1 py-2.5 rounded-xl border border-ink-300 dark:border-ink-700 text-xs font-bold text-ink-700 dark:text-ink-300 hover:bg-ink-100 dark:hover:bg-ink-800 flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Play Again</span>
              </button>
              {onOpenOrganizerStudio && (
                <button
                  onClick={onOpenOrganizerStudio}
                  className="flex-1 py-2.5 rounded-xl bg-marigold-600 text-white text-xs font-bold hover:bg-marigold-700"
                >
                  Formulate More Questions
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

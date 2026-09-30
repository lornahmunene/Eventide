"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { EventItem, TriviaQuestion } from "@/types";
import {
  Sparkles,
  HelpCircle,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  Award,
  Zap,
  Play,
  RotateCcw,
  Edit3,
  X,
  Gift,
  Check,
  Flame,
  Clock,
  Layers,
} from "lucide-react";

interface TriviaOrganizerStudioProps {
  event: EventItem;
  isOpen?: boolean;
  onClose?: () => void;
  className?: string;
}

export const TriviaOrganizerStudio: React.FC<TriviaOrganizerStudioProps> = ({
  event,
  isOpen = true,
  onClose,
  className = "",
}) => {
  const {
    getTriviaForEvent,
    addTriviaQuestion,
    deleteTriviaQuestion,
    triggerToast,
  } = useApp();

  const existingQuestions = getTriviaForEvent(event.id);

  // Studio tabs: "formulate" (Formulate & Manage) or "preview" (Live Attendee Test)
  const [activeStudioTab, setActiveStudioTab] = useState<"formulate" | "preview">("formulate");

  // Form State
  const [questionText, setQuestionText] = useState("");
  const [options, setOptions] = useState<string[]>([
    "Option A",
    "Option B",
    "Option C",
    "Option D",
  ]);
  const [correctOptionIndex, setCorrectOptionIndex] = useState<number>(0);
  const [airtimeRewardKES, setAirtimeRewardKES] = useState<number>(50);
  const [difficulty, setDifficulty] = useState<"Easy" | "Medium" | "Hard">("Medium");
  const [explanation, setExplanation] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  // Preview / Test Quiz state
  const [previewQuestionIndex, setPreviewQuestionIndex] = useState<number>(0);
  const [selectedPreviewAnswer, setSelectedPreviewAnswer] = useState<number | null>(null);
  const [previewAnswerSubmitted, setPreviewAnswerSubmitted] = useState<boolean>(false);
  const [previewScore, setPreviewScore] = useState<number>(0);
  const [previewRewardTotal, setPreviewRewardTotal] = useState<number>(0);

  if (!isOpen) return null;

  const handleOptionChange = (index: number, value: string) => {
    const updated = [...options];
    updated[index] = value;
    setOptions(updated);
  };

  const handleAddOption = () => {
    if (options.length >= 6) {
      triggerToast("Maximum of 6 choices per trivia question.");
      return;
    }
    setOptions([...options, `Option ${String.fromCharCode(65 + options.length)}`]);
  };

  const handleRemoveOption = (index: number) => {
    if (options.length <= 2) {
      triggerToast("A trivia question must have at least 2 choices.");
      return;
    }
    const updated = options.filter((_, i) => i !== index);
    setOptions(updated);
    if (correctOptionIndex >= updated.length) {
      setCorrectOptionIndex(0);
    }
  };

  const resetForm = () => {
    setQuestionText("");
    setOptions(["Option A", "Option B", "Option C", "Option D"]);
    setCorrectOptionIndex(0);
    setAirtimeRewardKES(50);
    setDifficulty("Medium");
    setExplanation("");
    setEditingId(null);
  };

  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!questionText.trim()) {
      triggerToast("Please enter the question text.");
      return;
    }

    const cleanedOptions = options.map((opt) => opt.trim());
    if (cleanedOptions.some((opt) => !opt)) {
      triggerToast("All options must have text.");
      return;
    }

    try {
      if (editingId) {
        // Remove existing question and replace
        deleteTriviaQuestion(editingId, event.id);
      }

      await addTriviaQuestion({
        eventId: event.id,
        question: questionText.trim(),
        options: cleanedOptions,
        correctOptionIndex,
        airtimeRewardKES,
        difficulty,
        explanation: explanation.trim() || undefined,
      });

      triggerToast(
        editingId
          ? "Trivia question updated!"
          : "New trivia question formulated and saved!"
      );
      resetForm();
    } catch (err) {
      triggerToast(
        err instanceof Error ? err.message : "Failed to save trivia question."
      );
    }
  };

  const handleEdit = (q: TriviaQuestion) => {
    setEditingId(q.id);
    setQuestionText(q.question);
    setOptions([...q.options]);
    setCorrectOptionIndex(q.correctOptionIndex);
    setAirtimeRewardKES(q.airtimeRewardKES);
    setDifficulty(q.difficulty || "Medium");
    setExplanation(q.explanation || "");
    setActiveStudioTab("formulate");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = (id: string) => {
    deleteTriviaQuestion(id, event.id);
    triggerToast("Trivia question removed.");
    if (editingId === id) {
      resetForm();
    }
  };

  // Pre-craft category-specific questions for instant inspiration
  const handleGenerateStarterQuestions = async () => {
    const starters: Record<string, Omit<TriviaQuestion, "id" | "createdAt" | "eventId">[]> = {
      Concerts: [
        {
          question: `Which hit song brought this musical movement to the global stage?`,
          options: ["Suzanna", "Midnight Train", "Melanin", "Short N Sweet"],
          correctOptionIndex: 0,
          airtimeRewardKES: 50,
          difficulty: "Easy",
          explanation: "Suzanna reached viral worldwide success with over 30M streams!",
        },
        {
          question: `What acoustic instrument is iconic to traditional East African live rhythm?`,
          options: ["Nyatiti", "Balafon", "Kora", "Djembe"],
          correctOptionIndex: 0,
          airtimeRewardKES: 100,
          difficulty: "Medium",
          explanation: "The Nyatiti is a traditional eight-stringed plucked bowl lute from Kenya.",
        },
      ],
      Tech: [
        {
          question: "Which messaging protocol powers offline USSD session interaction?",
          options: ["MAP / GSM signalling", "HTTPS REST API", "WebSockets", "Bluetooth Low Energy"],
          correctOptionIndex: 0,
          airtimeRewardKES: 50,
          difficulty: "Medium",
          explanation: "USSD communicates directly through GSM signaling channels without requiring mobile data.",
        },
        {
          question: "What was Nairobi's nickname in the global tech startup ecosystem?",
          options: ["Silicon Savannah", "Silicon Valley East", "Kilimani CyberHub", "Nairobi Tech Ridge"],
          correctOptionIndex: 0,
          airtimeRewardKES: 50,
          difficulty: "Easy",
          explanation: "Kenya's burgeoning tech hub earned the famous moniker 'Silicon Savannah'.",
        },
      ],
      Food: [
        {
          question: "What is the key citrus-marinated Swahili salad often paired with Nyama Choma?",
          options: ["Kachumbari", "Sukuma Wiki", "Pilau Kachumbari", "Kaimati"],
          correctOptionIndex: 0,
          airtimeRewardKES: 50,
          difficulty: "Easy",
          explanation: "Kachumbari is fresh diced tomatoes, onions, coriander, and lime juice.",
        },
      ],
      Arts: [
        {
          question: "Which Kenyan stone is world-renowned for exquisite Kisii soapstone sculptures?",
          options: ["Kisii Soapstone", "Tsavorite Garnet", "Turkana Basalt", "Malindi Marble"],
          correctOptionIndex: 0,
          airtimeRewardKES: 50,
          difficulty: "Easy",
          explanation: "Kisii soapstone has been carved by skilled Gusii artisans for generations.",
        },
      ],
      Fashion: [
        {
          question: "What is the vibrant printed East African wax cotton fabric celebrated in runway fashion?",
          options: ["Kitenge / Kanga", "Batik", "Kente", "Aso Oke"],
          correctOptionIndex: 0,
          airtimeRewardKES: 50,
          difficulty: "Easy",
          explanation: "Kitenge and Kanga are integral to East African sartorial elegance.",
        },
      ],
    };

    const templateList = starters[event.category] || starters["Tech"];
    for (const t of templateList) {
      await addTriviaQuestion({
        ...t,
        eventId: event.id,
      });
    }
    triggerToast(`Added ${templateList.length} template questions for ${event.category}!`);
  };

  // Preview Mode handlers
  const currentPreviewQ = existingQuestions[previewQuestionIndex];

  const handlePreviewAnswer = (index: number) => {
    if (previewAnswerSubmitted) return;
    setSelectedPreviewAnswer(index);
  };

  const handlePreviewSubmit = () => {
    if (selectedPreviewAnswer === null || !currentPreviewQ) return;
    setPreviewAnswerSubmitted(true);
    const isCorrect = selectedPreviewAnswer === currentPreviewQ.correctOptionIndex;
    if (isCorrect) {
      setPreviewScore((s) => s + 1);
      setPreviewRewardTotal((r) => r + currentPreviewQ.airtimeRewardKES);
    }
  };

  const handleNextPreview = () => {
    if (previewQuestionIndex + 1 < existingQuestions.length) {
      setPreviewQuestionIndex((i) => i + 1);
      setSelectedPreviewAnswer(null);
      setPreviewAnswerSubmitted(false);
    }
  };

  const handleResetPreview = () => {
    setPreviewQuestionIndex(0);
    setSelectedPreviewAnswer(null);
    setPreviewAnswerSubmitted(false);
    setPreviewScore(0);
    setPreviewRewardTotal(0);
  };

  const totalRewardPool = existingQuestions.reduce(
    (sum, q) => sum + (q.airtimeRewardKES || 0),
    0
  );

  return (
    <div className={`rounded-3xl bg-white dark:bg-ink-900 border border-ink-200 dark:border-ink-800 shadow-2xl overflow-hidden ${className}`}>
      {/* Top Studio Banner */}
      <div className="bg-gradient-to-r from-marigold-600 via-marigold-600 to-hibiscus-600 p-6 sm:p-8 text-white relative">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider">
              <Sparkles className="h-4 w-4" />
              Eventide Organizer Studio
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              Live Trivia &amp; Airtime Formulation
            </h2>
            <p className="text-xs sm:text-sm text-marigold-100 max-w-xl">
              Formulate engaging live trivia questions for <strong>{event.title}</strong>. Attendees answer over the web or dial in via USSD to win instant Africa&apos;s Talking airtime rewards.
            </p>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="self-start sm:self-center h-9 w-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Studio Metrics Pill Strip */}
        <div className="mt-6 flex flex-wrap items-center gap-3 pt-4 border-t border-white/20 text-xs">
          <div className="flex items-center gap-1.5 bg-black/20 backdrop-blur-sm px-3 py-1.5 rounded-xl font-bold">
            <HelpCircle className="h-4 w-4 text-marigold-300" />
            <span>{existingQuestions.length} Questions Formulated</span>
          </div>
          <div className="flex items-center gap-1.5 bg-black/20 backdrop-blur-sm px-3 py-1.5 rounded-xl font-bold">
            <Gift className="h-4 w-4 text-emerald-300" />
            <span>KES {totalRewardPool.toLocaleString()} Total Airtime Pool</span>
          </div>
          <div className="flex items-center gap-1.5 bg-black/20 backdrop-blur-sm px-3 py-1.5 rounded-xl font-bold">
            <Zap className="h-4 w-4 text-yellow-300" />
            <span>Instant AT SMS/Airtime Wire</span>
          </div>
        </div>
      </div>

      {/* Studio View Mode Tabs */}
      <div className="flex border-b border-ink-200 dark:border-ink-800 bg-ink-50 dark:bg-ink-950/60 p-2">
        <button
          onClick={() => setActiveStudioTab("formulate")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black transition-all ${
            activeStudioTab === "formulate"
              ? "bg-white dark:bg-ink-800 text-marigold-600 dark:text-marigold-400 shadow-sm"
              : "text-ink-500 hover:text-ink-900 dark:hover:text-white"
          }`}
        >
          <Edit3 className="h-4 w-4" />
          <span>Formulate &amp; Manage Questions ({existingQuestions.length})</span>
        </button>

        <button
          onClick={() => {
            setActiveStudioTab("preview");
            handleResetPreview();
          }}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black transition-all ${
            activeStudioTab === "preview"
              ? "bg-white dark:bg-ink-800 text-marigold-600 dark:text-marigold-400 shadow-sm"
              : "text-ink-500 hover:text-ink-900 dark:hover:text-white"
          }`}
        >
          <Play className="h-4 w-4" />
          <span>Test Attendee Experience (Live Preview)</span>
        </button>
      </div>

      {/* VIEW 1: FORMULATE & MANAGE QUESTIONS */}
      {activeStudioTab === "formulate" && (
        <div className="p-6 sm:p-8 space-y-8">
          {/* Section 1: Formulate New / Edit Question */}
          <div className="space-y-6 bg-ink-50/60 dark:bg-ink-800/40 p-6 rounded-3xl border border-ink-200 dark:border-ink-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-ink-200 dark:border-ink-700">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-marigold-600">
                  {editingId ? "Edit Formulated Question" : "Formulate Question for Attendees"}
                </span>
                <h3 className="text-lg font-black text-ink-900 dark:text-white mt-0.5">
                  {editingId ? "Update Trivia Question" : "Create New Trivia Challenge"}
                </h3>
              </div>

              {existingQuestions.length === 0 && (
                <button
                  type="button"
                  onClick={handleGenerateStarterQuestions}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-marigold-500/15 hover:bg-marigold-500/25 text-marigold-700 dark:text-marigold-300 text-xs font-bold transition-all"
                >
                  <Sparkles className="h-3.5 w-3.5 text-marigold-500" />
                  <span>Auto-Suggest {event.category} Questions</span>
                </button>
              )}
            </div>

            <form onSubmit={handleSaveQuestion} className="space-y-5">
              {/* Question Text */}
              <div>
                <label className="block text-xs font-bold text-ink-700 dark:text-ink-300 mb-1.5">
                  Question Prompt *
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="e.g. Which year was the first landmark edition of this event hosted in Nairobi?"
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  className="w-full rounded-2xl border border-ink-300 dark:border-ink-700 bg-white dark:bg-ink-900 px-4 py-3 text-sm font-semibold text-ink-900 dark:text-white focus:border-marigold-500 focus:outline-none shadow-xs"
                />
              </div>

              {/* Formulate Options */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-ink-700 dark:text-ink-300">
                    Formulate Multiple-Choice Options (Click radio button to mark correct answer) *
                  </label>
                  <button
                    type="button"
                    onClick={handleAddOption}
                    className="flex items-center gap-1 text-[11px] font-bold text-marigold-600 hover:text-marigold-700 dark:text-marigold-400"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add Choice</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {options.map((opt, idx) => {
                    const isCorrect = correctOptionIndex === idx;
                    return (
                      <div
                        key={idx}
                        className={`flex items-center gap-2 p-2.5 rounded-2xl border transition-all ${
                          isCorrect
                            ? "border-emerald-500 bg-emerald-500/10 shadow-xs"
                            : "border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-900"
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => setCorrectOptionIndex(idx)}
                          title="Set as correct answer"
                          className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                            isCorrect
                              ? "bg-emerald-600 text-white shadow-xs"
                              : "border border-ink-300 dark:border-ink-600 text-ink-400 hover:border-emerald-500"
                          }`}
                        >
                          {isCorrect ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <span className="text-[10px] font-bold">
                              {String.fromCharCode(65 + idx)}
                            </span>
                          )}
                        </button>

                        <input
                          type="text"
                          required
                          value={opt}
                          onChange={(e) => handleOptionChange(idx, e.target.value)}
                          placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                          className="flex-1 bg-transparent text-xs font-semibold text-ink-900 dark:text-white focus:outline-none"
                        />

                        {isCorrect && (
                          <span className="text-[10px] font-extrabold uppercase text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-500/10">
                            Correct
                          </span>
                        )}

                        {options.length > 2 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveOption(idx)}
                            className="text-ink-400 hover:text-red-500 p-1"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Reward, Difficulty & Explanation */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-ink-700 dark:text-ink-300 mb-1">
                    Airtime Reward (KES)
                  </label>
                  <div className="relative">
                    <Award className="absolute left-3 top-2.5 h-4 w-4 text-marigold-500" />
                    <select
                      value={airtimeRewardKES}
                      onChange={(e) => setAirtimeRewardKES(Number(e.target.value))}
                      className="w-full rounded-xl border border-ink-300 dark:border-ink-700 bg-white dark:bg-ink-900 pl-9 pr-3 py-2 text-xs font-bold text-ink-900 dark:text-white focus:border-marigold-500"
                    >
                      <option value={20}>KES 20 Airtime</option>
                      <option value={50}>KES 50 Airtime (Recommended)</option>
                      <option value={100}>KES 100 Airtime</option>
                      <option value={200}>KES 200 Airtime</option>
                      <option value={500}>KES 500 Airtime</option>
                    </select>
                  </div>
                  <span className="text-[10px] text-ink-400 mt-0.5 block">
                    Dispatched automatically via Africa&apos;s Talking Airtime API.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-ink-700 dark:text-ink-300 mb-1">
                    Difficulty Level
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as "Easy" | "Medium" | "Hard")}
                    className="w-full rounded-xl border border-ink-300 dark:border-ink-700 bg-white dark:bg-ink-900 px-3 py-2 text-xs font-bold text-ink-900 dark:text-white focus:border-marigold-500"
                  >
                    <option value="Easy">Easy (Audience warm-up)</option>
                    <option value="Medium">Medium (General trivia)</option>
                    <option value="Hard">Hard (Superfan challenge)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-ink-700 dark:text-ink-300 mb-1">
                    Explanation / Fun Fact (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Suzanna was written in 2019 and..."
                    value={explanation}
                    onChange={(e) => setExplanation(e.target.value)}
                    className="w-full rounded-xl border border-ink-300 dark:border-ink-700 bg-white dark:bg-ink-900 px-3 py-2 text-xs font-medium text-ink-900 dark:text-white focus:border-marigold-500"
                  />
                  <span className="text-[10px] text-ink-400 mt-0.5 block">
                    Displayed to attendees after they reveal their answer.
                  </span>
                </div>
              </div>

              {/* Form Action Buttons */}
              <div className="pt-3 flex gap-3 justify-end">
                {editingId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2.5 rounded-xl border border-ink-300 dark:border-ink-700 text-xs font-bold text-ink-600 dark:text-ink-300 hover:bg-ink-100 dark:hover:bg-ink-800"
                  >
                    Cancel Edit
                  </button>
                )}
                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-marigold-600 hover:bg-marigold-700 text-white text-xs font-black shadow-md shadow-marigold-600/20 transition-all hover:scale-105 active:scale-95"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>{editingId ? "Update Question" : "Save Trivia Question"}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Section 2: Formulated Questions List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-ink-900 dark:text-white flex items-center gap-2">
                  <Layers className="h-5 w-5 text-marigold-500" />
                  Formulated Trivia Questions ({existingQuestions.length})
                </h3>
                <p className="text-xs text-ink-500">
                  These questions will be published live for attendees during {event.title}.
                </p>
              </div>

              {existingQuestions.length > 0 && (
                <button
                  onClick={() => {
                    setActiveStudioTab("preview");
                    handleResetPreview();
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-ink-900 dark:bg-white text-white dark:text-ink-900 text-xs font-bold shadow-md hover:scale-105 transition-all"
                >
                  <Play className="h-3.5 w-3.5 text-marigold-400" />
                  <span>Play Test ({existingQuestions.length} Qs)</span>
                </button>
              )}
            </div>

            {existingQuestions.length === 0 ? (
              <div className="text-center py-12 rounded-3xl border border-dashed border-ink-300 dark:border-ink-800 bg-ink-50 dark:bg-ink-900/40 p-6 space-y-3">
                <HelpCircle className="h-10 w-10 text-ink-400 mx-auto" />
                <h4 className="text-sm font-bold text-ink-800 dark:text-ink-200">
                  No trivia questions formulated yet
                </h4>
                <p className="text-xs text-ink-500 max-w-sm mx-auto">
                  Use the formulation form above or click below to populate starter questions tailored to {event.category}.
                </p>
                <button
                  type="button"
                  onClick={handleGenerateStarterQuestions}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-marigold-600 hover:bg-marigold-700 text-white text-xs font-bold shadow-md shadow-marigold-600/20"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>Populate Starter Trivia</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {existingQuestions.map((q, qIdx) => (
                  <div
                    key={q.id}
                    className="p-5 rounded-2xl border border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-900/70 shadow-xs space-y-4 hover:border-marigold-400 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-full bg-marigold-500/10 text-marigold-600 dark:text-marigold-400 font-extrabold text-[10px]">
                            Question #{qIdx + 1}
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[10px]">
                            KES {q.airtimeRewardKES} Airtime
                          </span>
                          {q.difficulty && (
                            <span className="px-2 py-0.5 rounded-full bg-ink-100 dark:bg-ink-800 text-ink-600 dark:text-ink-400 font-medium text-[10px]">
                              {q.difficulty}
                            </span>
                          )}
                        </div>
                        <h4 className="text-sm font-extrabold text-ink-900 dark:text-white pt-1">
                          {q.question}
                        </h4>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleEdit(q)}
                          className="p-2 rounded-xl text-ink-500 hover:text-marigold-600 hover:bg-marigold-50 dark:hover:bg-ink-800 transition-colors"
                          title="Edit question"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(q.id)}
                          className="p-2 rounded-xl text-ink-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-ink-800 transition-colors"
                          title="Delete question"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Options Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {q.options.map((opt, optIdx) => {
                        const isCorrect = optIdx === q.correctOptionIndex;
                        return (
                          <div
                            key={optIdx}
                            className={`flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold border ${
                              isCorrect
                                ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                                : "border-ink-100 dark:border-ink-800 bg-ink-50 dark:bg-ink-800/40 text-ink-600 dark:text-ink-300"
                            }`}
                          >
                            <span className="flex items-center gap-2">
                              <span className="h-5 w-5 rounded-full bg-black/10 dark:bg-white/10 flex items-center justify-center text-[10px] font-bold">
                                {String.fromCharCode(65 + optIdx)}
                              </span>
                              <span>{opt}</span>
                            </span>
                            {isCorrect && (
                              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {q.explanation && (
                      <p className="text-[11px] text-ink-500 dark:text-ink-400 italic bg-ink-50 dark:bg-ink-800/30 p-2 rounded-xl">
                        💡 Did you know: {q.explanation}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 2: TEST ATTENDEE EXPERIENCE (LIVE PREVIEW) */}
      {activeStudioTab === "preview" && (
        <div className="p-6 sm:p-8 space-y-6">
          {existingQuestions.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <HelpCircle className="h-12 w-12 text-ink-400 mx-auto" />
              <h3 className="text-lg font-bold text-ink-800 dark:text-ink-200">
                No trivia questions available to preview
              </h3>
              <p className="text-xs text-ink-500">
                Formulate at least one question first, or auto-generate starter questions.
              </p>
              <button
                onClick={() => setActiveStudioTab("formulate")}
                className="px-5 py-2.5 rounded-xl bg-marigold-600 text-white text-xs font-bold"
              >
                Back to Formulation
              </button>
            </div>
          ) : currentPreviewQ ? (
            <div className="max-w-xl mx-auto space-y-6">
              {/* Progress & Live Airtime Score */}
              <div className="flex items-center justify-between text-xs pb-3 border-b border-ink-200 dark:border-ink-800">
                <span className="font-extrabold text-marigold-600">
                  Question {previewQuestionIndex + 1} of {existingQuestions.length}
                </span>

                <div className="flex items-center gap-3">
                  <span className="font-bold text-ink-600 dark:text-ink-300">
                    Won: <strong className="text-emerald-600 dark:text-emerald-400">KES {previewRewardTotal} Airtime</strong>
                  </span>
                  <button
                    onClick={handleResetPreview}
                    className="p-1 rounded-lg text-ink-400 hover:text-ink-700"
                    title="Restart test"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Question Card */}
              <div className="p-6 rounded-3xl border border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-900 shadow-xl space-y-5">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full bg-marigold-500/10 text-marigold-600 text-xs font-extrabold">
                    {currentPreviewQ.difficulty || "Trivia"}
                  </span>
                  <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full">
                    <Gift className="h-3.5 w-3.5" />
                    Win KES {currentPreviewQ.airtimeRewardKES}
                  </span>
                </div>

                <h3 className="text-lg font-black text-ink-900 dark:text-white leading-snug">
                  {currentPreviewQ.question}
                </h3>

                {/* Multiple Choices */}
                <div className="space-y-2.5">
                  {currentPreviewQ.options.map((opt, idx) => {
                    const isSelected = selectedPreviewAnswer === idx;
                    const isCorrect = idx === currentPreviewQ.correctOptionIndex;

                    let choiceStyles =
                      "border-ink-200 dark:border-ink-800 hover:border-marigold-400 bg-ink-50 dark:bg-ink-800/50";
                    if (previewAnswerSubmitted) {
                      if (isCorrect) {
                        choiceStyles = "border-emerald-500 bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold";
                      } else if (isSelected) {
                        choiceStyles = "border-red-500 bg-red-500/15 text-red-600 dark:text-red-400";
                      }
                    } else if (isSelected) {
                      choiceStyles = "border-marigold-500 bg-marigold-500/15 text-marigold-900 dark:text-marigold-200 font-bold";
                    }

                    return (
                      <button
                        key={idx}
                        disabled={previewAnswerSubmitted}
                        onClick={() => handlePreviewAnswer(idx)}
                        className={`w-full text-left flex items-center justify-between p-3.5 rounded-2xl border text-xs transition-all ${choiceStyles}`}
                      >
                        <span className="flex items-center gap-3">
                          <span className="h-6 w-6 rounded-full bg-black/10 dark:bg-white/10 flex items-center justify-center font-bold text-[11px]">
                            {String.fromCharCode(65 + idx)}
                          </span>
                          <span>{opt}</span>
                        </span>

                        {previewAnswerSubmitted && isCorrect && (
                          <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                        )}
                        {previewAnswerSubmitted && isSelected && !isCorrect && (
                          <XCircle className="h-5 w-5 text-red-500 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Feedback After Submit */}
                {previewAnswerSubmitted && (
                  <div
                    className={`p-4 rounded-2xl text-xs font-semibold animate-in fade-in ${
                      selectedPreviewAnswer === currentPreviewQ.correctOptionIndex
                        ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
                        : "bg-red-500/10 border border-red-500/30 text-red-700 dark:text-red-400"
                    }`}
                  >
                    {selectedPreviewAnswer === currentPreviewQ.correctOptionIndex ? (
                      <div className="space-y-1">
                        <p className="font-extrabold flex items-center gap-1.5">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          🎉 Correct Answer! KES {currentPreviewQ.airtimeRewardKES} Airtime awarded!
                        </p>
                        {currentPreviewQ.explanation && (
                          <p className="text-[11px] text-ink-600 dark:text-ink-400 mt-1">
                            💡 {currentPreviewQ.explanation}
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <p className="font-extrabold flex items-center gap-1.5">
                          <XCircle className="h-4 w-4 text-red-500" />
                          Incorrect. The right answer was:{" "}
                          <strong>{currentPreviewQ.options[currentPreviewQ.correctOptionIndex]}</strong>
                        </p>
                        {currentPreviewQ.explanation && (
                          <p className="text-[11px] text-ink-600 dark:text-ink-400 mt-1">
                            💡 {currentPreviewQ.explanation}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="pt-2 flex gap-3">
                  {!previewAnswerSubmitted ? (
                    <button
                      disabled={selectedPreviewAnswer === null}
                      onClick={handlePreviewSubmit}
                      className="w-full py-3 rounded-xl bg-marigold-600 hover:bg-marigold-700 text-white font-black text-xs shadow-md shadow-marigold-600/20 disabled:opacity-40 transition-all"
                    >
                      Submit Answer
                    </button>
                  ) : previewQuestionIndex + 1 < existingQuestions.length ? (
                    <button
                      onClick={handleNextPreview}
                      className="w-full py-3 rounded-xl bg-marigold-600 hover:bg-marigold-700 text-white font-black text-xs shadow-md shadow-marigold-600/20 transition-all"
                    >
                      Next Question →
                    </button>
                  ) : (
                    <button
                      onClick={handleResetPreview}
                      className="w-full py-3 rounded-xl bg-ink-900 dark:bg-white text-white dark:text-ink-900 font-black text-xs shadow-md transition-all"
                    >
                      Quiz Completed! Play Again ↺
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

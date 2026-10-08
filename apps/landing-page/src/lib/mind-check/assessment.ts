export type QuestionType = "yesno" | "scale";
export type DimensionId = "stress" | "sleep" | "mood" | "focus" | "energy" | "relationships";

export interface QuestionOption {
  label: string;
  points: number;
}

export interface Question {
  text: string;
  type: QuestionType;
  dimension: DimensionId;
  options: QuestionOption[];
}

export const DIMENSION_LABELS: Record<DimensionId, string> = {
  stress: "Stress",
  sleep: "Sleep",
  mood: "Mood",
  focus: "Focus",
  energy: "Energy",
  relationships: "Relationships",
};

export const QUESTIONS: Question[] = [
  { text: "Do you often feel overwhelmed by your daily responsibilities?", type: "yesno", dimension: "stress", options: [{ label: "Yes", points: 3 }, { label: "No", points: 0 }] },
  { text: "How often do you have trouble falling or staying asleep?", type: "scale", dimension: "sleep", options: [{ label: "Never", points: 0 }, { label: "Rarely", points: 1 }, { label: "Sometimes", points: 2 }, { label: "Often", points: 3 }] },
  { text: "Do you find it hard to switch off from work even when you're home?", type: "yesno", dimension: "stress", options: [{ label: "Yes", points: 3 }, { label: "No", points: 0 }] },
  { text: "How often do you feel anxious without a clear reason?", type: "scale", dimension: "mood", options: [{ label: "Never", points: 0 }, { label: "Rarely", points: 1 }, { label: "Sometimes", points: 2 }, { label: "Often", points: 3 }] },
  { text: "Do you often skip meals or eat irregularly because of stress?", type: "yesno", dimension: "stress", options: [{ label: "Yes", points: 3 }, { label: "No", points: 0 }] },
  { text: "How would you rate your energy levels through a typical day?", type: "scale", dimension: "energy", options: [{ label: "High", points: 0 }, { label: "Moderate", points: 1 }, { label: "Low", points: 2 }, { label: "Very low", points: 3 }] },
  { text: "Do you find yourself getting irritated over small things more than before?", type: "yesno", dimension: "mood", options: [{ label: "Yes", points: 3 }, { label: "No", points: 0 }] },
  { text: "How often do you take real time for yourself, just to relax?", type: "scale", dimension: "stress", options: [{ label: "Often", points: 0 }, { label: "Sometimes", points: 1 }, { label: "Rarely", points: 2 }, { label: "Never", points: 3 }] },
  { text: "Do you feel your work and personal life are in balance right now?", type: "yesno", dimension: "stress", options: [{ label: "Yes", points: 0 }, { label: "No", points: 3 }] },
  { text: "How often do racing thoughts keep you up at night?", type: "scale", dimension: "sleep", options: [{ label: "Never", points: 0 }, { label: "Rarely", points: 1 }, { label: "Sometimes", points: 2 }, { label: "Often", points: 3 }] },
  { text: "Do you often compare yourself to others and feel like you're falling behind?", type: "yesno", dimension: "mood", options: [{ label: "Yes", points: 3 }, { label: "No", points: 0 }] },
  { text: "How connected do you feel to friends and family lately?", type: "scale", dimension: "relationships", options: [{ label: "Very", points: 0 }, { label: "Somewhat", points: 1 }, { label: "A little", points: 2 }, { label: "Not at all", points: 3 }] },
  { text: "Do you avoid social situations because they feel exhausting?", type: "yesno", dimension: "relationships", options: [{ label: "Yes", points: 3 }, { label: "No", points: 0 }] },
  { text: "How often do you feel a real sense of purpose in your daily routine?", type: "scale", dimension: "mood", options: [{ label: "Often", points: 0 }, { label: "Sometimes", points: 1 }, { label: "Rarely", points: 2 }, { label: "Never", points: 3 }] },
  { text: "Have you noticed your focus or memory slipping recently?", type: "yesno", dimension: "focus", options: [{ label: "Yes", points: 3 }, { label: "No", points: 0 }] },
  { text: "How well do you usually bounce back from an unexpected setback?", type: "scale", dimension: "mood", options: [{ label: "Very well", points: 0 }, { label: "Fairly well", points: 1 }, { label: "Struggle a bit", points: 2 }, { label: "Struggle a lot", points: 3 }] },
  { text: "Do you often feel guilty for resting or taking a break?", type: "yesno", dimension: "stress", options: [{ label: "Yes", points: 3 }, { label: "No", points: 0 }] },
  { text: "How often do you notice physical tension — jaw, shoulders, stomach?", type: "scale", dimension: "stress", options: [{ label: "Never", points: 0 }, { label: "Rarely", points: 1 }, { label: "Sometimes", points: 2 }, { label: "Often", points: 3 }] },
  { text: "Do you find everyday decisions harder to make than they used to be?", type: "yesno", dimension: "focus", options: [{ label: "Yes", points: 3 }, { label: "No", points: 0 }] },
  { text: "Overall, how would you rate your mental wellbeing right now?", type: "scale", dimension: "mood", options: [{ label: "Excellent", points: 0 }, { label: "Good", points: 1 }, { label: "Fair", points: 2 }, { label: "Poor", points: 3 }] },
];

export type Level = "low" | "medium" | "high";

export const levelLabels: Record<Level, string> = {
  low: "Mild",
  medium: "Moderate",
  high: "High",
};

export type BandTone = "good" | "okay" | "strain" | "support";

export interface Band {
  band: string;
  tone: BandTone;
  meaning: string;
  suggestions: string[];
  quote: string;
}

export function getBand(overallPercent: number): Band {
  if (overallPercent >= 80) {
    return {
      band: "You're Thriving",
      tone: "good",
      meaning:
        "Your responses show strong resilience, steady energy, and good balance. The goal now isn't fixing anything — it's protecting what's working.",
      suggestions: [
        "Keep a light monthly check-in so small stress doesn't build up unnoticed",
        "Use guided meditation to maintain your current calm",
        "A psychometric assessment can sharpen your existing strengths further",
      ],
      quote: "\"You don't wait for a breakdown to take care of your mind. You already took the first step — this is the second.\"",
    };
  }
  if (overallPercent >= 60) {
    return {
      band: "Doing Well, With Room to Grow",
      tone: "okay",
      meaning:
        "You're managing, but a few areas — sleep, focus, or daily pressure — are quietly costing you energy. A little structured support goes a long way here.",
      suggestions: [
        "Short-term counselling to address the specific pressure points you flagged",
        "Guided meditation sessions to improve sleep and reduce racing thoughts",
        "A psychometric assessment to understand your stress triggers clearly",
      ],
      quote: "\"Knowing your score is step one. Acting on it is what actually changes things.\"",
    };
  }
  if (overallPercent >= 40) {
    return {
      band: "Under Strain",
      tone: "strain",
      meaning:
        "Several answers point to sustained stress — on sleep, mood, focus, and how you're relating to people around you. This is very common, and very manageable with the right support, starting now.",
      suggestions: [
        "Regular counselling sessions to work through the specific stress patterns you described",
        "A structured follow-up plan so you're not figuring it out alone",
        "Guided meditation to bring your baseline stress down within weeks",
      ],
      quote: "\"You don't wait for a breakdown to take care of your mind. You already took the first step — this is the second.\"",
    };
  }
  return {
    band: "Needs Support, Starting Today",
    tone: "support",
    meaning:
      "Your responses show real, sustained pressure across sleep, mood, energy and daily functioning. This is worth acting on now, not later — and the good news is that with the right support, this changes faster than people expect.",
    suggestions: [
      "Begin with regular counselling sessions as soon as possible",
      "A full psychometric assessment to map exactly what's driving this",
      "A structured, ongoing plan rather than a one-off session",
    ],
    quote: "\"You don't wait for a breakdown to take care of your mind. You already took the first step — this is the second.\"",
  };
}

export function computeOverallPercent(answers: number[]): number {
  const sum = answers.reduce((total, points) => total + (points || 0), 0);
  const max = QUESTIONS.length * 3;
  return Math.round(100 - (sum / max) * 100);
}

export function encodeAnswers(answers: number[]): string {
  return answers.join(",");
}

export function decodeAnswers(encoded: string): number[] {
  if (!encoded) return [];
  return encoded.split(",").map((value) => Number(value) || 0);
}

export interface DimensionScore {
  id: DimensionId;
  label: string;
  score: number;
  max: number;
  percent: number;
  level: Level;
}

export interface ScoreResult {
  overallPercent: number;
  dimensions: DimensionScore[];
  needs: string[];
}

export function scoreAnswers(answers: number[]): ScoreResult {
  const overallPercent = computeOverallPercent(answers);
  const totals = new Map<DimensionId, { sum: number; max: number }>();

  QUESTIONS.forEach((question, index) => {
    const points = answers[index] ?? 0;
    const entry = totals.get(question.dimension) ?? { sum: 0, max: 0 };
    entry.sum += points;
    entry.max += 3;
    totals.set(question.dimension, entry);
  });

  const dimensions: DimensionScore[] = Array.from(totals.entries()).map(([id, { sum, max }]) => {
    const ratio = max > 0 ? sum / max : 0;
    const level: Level = ratio >= 0.66 ? "high" : ratio >= 0.33 ? "medium" : "low";
    return { id, label: DIMENSION_LABELS[id], score: sum, max, percent: Math.round(ratio * 100), level };
  });

  const needs = getBand(overallPercent).suggestions;

  return { overallPercent, dimensions, needs };
}

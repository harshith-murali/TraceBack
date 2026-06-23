import type { Post } from "@prisma/client";

export type MatchSignals = {
  category: number;
  title: number;
  description: number;
  location: number;
  time: number;
  keywords: string[];
};

const stopWords = new Set(["the", "and", "with", "near", "from", "lost", "found", "item", "a", "an", "at", "in", "of"]);
const detailKeywords = ["black", "white", "blue", "red", "green", "brown", "silver", "gold", "hp", "dell", "apple", "samsung", "nike", "adidas"];

export function normalizeText(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

export function tokenize(value: string) {
  return normalizeText(value)
    .split(" ")
    .filter((token) => token.length > 2 && !stopWords.has(token));
}

function overlap(a: string[], b: string[]) {
  const left = new Set(a);
  const right = new Set(b);
  const matches = [...left].filter((item) => right.has(item));
  const denominator = Math.max(left.size, right.size, 1);
  return { score: matches.length / denominator, matches };
}

function timeScore(left: Date, right: Date) {
  const diffHours = Math.abs(left.getTime() - right.getTime()) / (1000 * 60 * 60);
  if (diffHours <= 24) return 1;
  if (diffHours <= 72) return 0.75;
  if (diffHours <= 24 * 7) return 0.45;
  if (diffHours <= 24 * 14) return 0.2;
  return 0;
}

export function scorePosts(lostPost: Post, foundPost: Post) {
  const titleOverlap = overlap(tokenize(lostPost.title), tokenize(foundPost.title));
  const descriptionOverlap = overlap(tokenize(lostPost.description), tokenize(foundPost.description));
  const locationOverlap = overlap(tokenize(`${lostPost.location} ${lostPost.campusArea}`), tokenize(`${foundPost.location} ${foundPost.campusArea}`));
  const keywordOverlap = overlap(
    tokenize(`${lostPost.title} ${lostPost.description}`).filter((token) => detailKeywords.includes(token)),
    tokenize(`${foundPost.title} ${foundPost.description}`).filter((token) => detailKeywords.includes(token))
  );

  const signals: MatchSignals = {
    category: lostPost.category === foundPost.category ? 1 : 0,
    title: titleOverlap.score,
    description: descriptionOverlap.score,
    location: locationOverlap.score,
    time: timeScore(lostPost.eventDate, foundPost.eventDate),
    keywords: [...new Set([...titleOverlap.matches, ...descriptionOverlap.matches, ...locationOverlap.matches, ...keywordOverlap.matches])]
  };

  const confidence = Math.round(
    signals.category * 34 +
      signals.title * 22 +
      signals.description * 12 +
      signals.location * 17 +
      signals.time * 10 +
      Math.min(keywordOverlap.matches.length, 3) * 1.7
  );

  return {
    confidence: Math.min(100, confidence),
    signals
  };
}

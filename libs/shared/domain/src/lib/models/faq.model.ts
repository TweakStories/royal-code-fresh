export interface FaqItem {
  id: string;
  questionKey: string;
  answerKey: string;
}

export interface ResolvedFaqItem {
  id: string;
  question: string;
  answer: string;
}

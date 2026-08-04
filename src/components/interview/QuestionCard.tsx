import { Sparkles } from "lucide-react";

type Props = {
  question: string;
  category: string;
  index: number;
  total: number;
};

export function QuestionCard({ question, category, index, total }: Props) {
  return (
    <div className="animate-rise text-center">
      <div className="mb-4 flex items-center justify-center gap-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
        <Sparkles className="size-3.5 text-accent" aria-hidden />
        <span>{category}</span>
        <span aria-hidden>·</span>
        <span>
          Question {index} of {total}
        </span>
      </div>
      <h2 className="mx-auto max-w-2xl text-balance text-2xl leading-snug font-semibold text-foreground sm:text-3xl">
        {question}
      </h2>
    </div>
  );
}

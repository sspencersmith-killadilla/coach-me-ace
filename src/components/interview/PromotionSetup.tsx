import { Award, Loader2, Pencil, Trash2 } from "lucide-react";
import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useJobBrief } from "@/lib/job-brief-context";
import { usePromotion } from "@/lib/promotion-context";

export function PromotionSetup() {
  const { brief } = useJobBrief();
  const { promotion, setPromotion, hydrated } = usePromotion();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(promotion);

  const save = useCallback(() => {
    setPromotion({ ...draft, isActive: true });
    setOpen(false);
  }, [draft, setPromotion]);

  const remove = useCallback(() => {
    setPromotion({
      isActive: false,
      currentRole: "",
      targetRole: "",
      companyContext: "",
      packetText: "",
    });
    setDraft({
      isActive: false,
      currentRole: "",
      targetRole: "",
      companyContext: "",
      packetText: "",
    });
  }, [setPromotion]);

  if (!hydrated) return null;

  if (promotion.isActive && !open) {
    return (
      <div className="animate-rise mt-6 rounded-3xl border border-border bg-card p-6 text-left shadow-sm">
        <div className="flex items-start gap-3">
          <Award className="mt-0.5 size-5 text-primary" aria-hidden />
          <div className="flex-1">
            <h2 className="text-base font-semibold text-foreground">Internal promotion mode</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {brief
                ? `Practicing for promotion to ${brief.title} at ${brief.company}.`
                : "Practicing for an internal promotion."}
              {promotion.currentRole ? ` Current role: ${promotion.currentRole}.` : null}
            </p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            variant="secondary"
            size="sm"
            className="rounded-full"
            onClick={() => setOpen(true)}
          >
            <Pencil className="size-4" aria-hidden />
            Edit promotion details
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="rounded-full text-muted-foreground"
            onClick={remove}
          >
            <Trash2 className="size-4" aria-hidden />
            Remove
          </Button>
        </div>
      </div>
    );
  }

  if (!open) {
    return (
      <div className="mt-6 text-center">
        <Button
          variant="outline"
          size="lg"
          className="rounded-full border-primary/30 bg-card px-6 text-foreground shadow-sm hover:bg-primary/5 hover:text-primary"
          onClick={() => setOpen(true)}
        >
          <Award className="size-5" aria-hidden />
          Preparing for an internal promotion? (optional)
        </Button>
      </div>
    );
  }

  return (
    <div className="animate-rise mt-6 space-y-5 rounded-3xl border border-border bg-card p-6 text-left shadow-sm">
      <div>
        <h2 className="text-base font-semibold text-foreground">Internal promotion setup</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Tell the coach this is a promotion panel so it judges your answers against the next level,
          not an external job search.
        </p>
      </div>

      {brief ? (
        <div className="rounded-2xl bg-muted/60 p-4 text-sm">
          <p className="font-medium text-foreground">Target role from your job brief</p>
          <p className="mt-1 text-muted-foreground">
            {brief.title} at {brief.company}
          </p>
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm font-medium text-muted-foreground">
          Your current role
          <Input
            className="mt-1"
            value={draft.currentRole}
            placeholder="e.g. Senior Analyst"
            onChange={(event) => setDraft({ ...draft, currentRole: event.target.value })}
          />
        </label>
        <label className="text-sm font-medium text-muted-foreground">
          Target role / level
          <Input
            className="mt-1"
            value={draft.targetRole || (brief ? brief.title : "")}
            placeholder={brief ? brief.title : "e.g. Manager"}
            onChange={(event) => setDraft({ ...draft, targetRole: event.target.value })}
          />
        </label>
      </div>

      <label className="block text-sm font-medium text-muted-foreground">
        Company context (optional)
        <Textarea
          className="mt-1"
          rows={3}
          value={draft.companyContext}
          placeholder="e.g. Flat org, promotion panels include peers and skip-level manager"
          onChange={(event) => setDraft({ ...draft, companyContext: event.target.value })}
        />
      </label>

      <label className="block text-sm font-medium text-muted-foreground">
        Promotion packet or business case (optional)
        <Textarea
          className="mt-1"
          rows={5}
          value={draft.packetText}
          placeholder="Paste a short summary of your promotion case, key achievements, or feedback you've received"
          onChange={(event) => setDraft({ ...draft, packetText: event.target.value })}
        />
      </label>

      <div className="flex flex-wrap gap-2">
        <Button className="rounded-full" onClick={save}>
          <Award className="size-4" aria-hidden />
          Use promotion mode
        </Button>
        <Button
          variant="ghost"
          className="rounded-full text-muted-foreground"
          onClick={() => setOpen(false)}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}

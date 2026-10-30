import { useJobBrief } from "@/lib/job-brief-context";
import { usePromotion } from "@/lib/promotion-context";
import { useResume } from "@/lib/resume-context";

/** The job, resume, and promotion details to send with any coaching request. */
export function usePrepContext() {
  const { brief } = useJobBrief();
  const { resume } = useResume();
  const { promotion } = usePromotion();
  return {
    ...(brief ? { jobBrief: brief } : {}),
    ...(resume ? { resume } : {}),
    ...(promotion.isActive ? { promotion } : {}),
  };
}

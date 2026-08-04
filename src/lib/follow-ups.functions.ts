import { createServerFn } from "@tanstack/react-start";
import { FollowUpsInput } from "./follow-ups-schema";
import { generateFollowUps } from "./follow-ups.server";
import type { FollowUps } from "./follow-ups-schema";

export type { FollowUps };

export const getFollowUps = createServerFn({ method: "POST" })
  .validator((input: unknown) => FollowUpsInput.parse(input))
  .handler(async ({ data }): Promise<FollowUps> => generateFollowUps(data));

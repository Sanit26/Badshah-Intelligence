import { createActor } from "@/backend";
import type { backendInterface } from "@/backend";
import { useActor } from "@caffeineai/core-infrastructure";

/**
 * Returns the authenticated actor via useActor hook.
 * Works for both authenticated and anonymous users.
 */
export function useBackend(): {
  actor: backendInterface | null;
  isFetching: boolean;
} {
  const { actor, isFetching } = useActor(createActor);
  return { actor, isFetching };
}

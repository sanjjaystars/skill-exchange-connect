import type { Tables } from "@/integrations/supabase/types";

type Profile = Tables<"profiles">;

export function calculateMatchPercentage(myProfile: Profile, otherProfile: Profile): number {
  const myTeaches = myProfile.teaches ?? [];
  const myWants = myProfile.wants ?? [];
  const theirTeaches = otherProfile.teaches ?? [];
  const theirWants = otherProfile.wants ?? [];

  if (myTeaches.length === 0 && myWants.length === 0) return 0;

  // How many of my "wants" can they teach?
  const theyCanTeachMe = myWants.filter((s) =>
    theirTeaches.some((t) => t.toLowerCase() === s.toLowerCase())
  ).length;

  // How many of their "wants" can I teach?
  const iCanTeachThem = theirWants.filter((s) =>
    myTeaches.some((t) => t.toLowerCase() === s.toLowerCase())
  ).length;

  const totalPossible = myWants.length + theirWants.length;
  if (totalPossible === 0) return 0;

  return Math.round(((theyCanTeachMe + iCanTeachThem) / totalPossible) * 100);
}

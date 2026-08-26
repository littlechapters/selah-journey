import { createFileRoute } from "@tanstack/react-router";
import { deferPage } from "@/lib/defer-page";

const JourneyExperience = deferPage(
  () => import("@/journey/experience").then((m) => ({ default: m.JourneyExperience })),
  <div className="h-dvh w-full bg-black" />,
);

export const Route = createFileRoute("/journey")({ component: Journey });

function Journey() {
  return <JourneyExperience />;
}

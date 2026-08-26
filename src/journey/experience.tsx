"use client";

import { useEffect, useState } from "react";
import "./journey.css";
import { Onboarding } from "./onboarding";
import { Hub, PathsRoom } from "./hub";
import { Walk } from "./walk";
import { BreathRoom, FocusRoom, JournalRoom, NotesRoom } from "./rooms";
import { useJourney } from "./store";

/** Preview only. Flip to false before launch so returning people go straight to the hub. */
const PREVIEW_THRESHOLD_EVERY_VISIT = true;

export function JourneyExperience() {
  const [ready, setReady] = useState(false);
  const [threshold, setThreshold] = useState(PREVIEW_THRESHOLD_EVERY_VISIT);
  const onboarded = useJourney((s) => s.onboarded);
  const room = useJourney((s) => s.room);
  const walking = useJourney((s) => s.walking);

  useEffect(() => setReady(true), []);
  if (!ready) return <div className="jny" />;
  if (threshold || !onboarded) {
    return <Onboarding onDone={() => setThreshold(false)} />;
  }
  if (walking) return <Walk pathId={walking} />;
  if (room === "paths") return <PathsRoom />;
  if (room === "journal") return <JournalRoom />;
  if (room === "focus") return <FocusRoom />;
  if (room === "breath") return <BreathRoom />;
  if (room === "notes") return <NotesRoom />;
  return <Hub />;
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { Play } from "lucide-react";

export const Route = createFileRoute("/bible")({ component: Bible });

function Bible() {
  return (
    <main className="flex min-h-dvh flex-col bg-[#070605] text-fg">
      <div className="px-5 pt-14">
        <h1 className="font-sans text-[2.15rem] font-semibold tracking-tight text-fg">Psalm 139</h1>
        <p className="mt-3 text-[15px] text-muted">You Have Searched Me and Known Me</p>

        <div className="mt-6 flex items-center gap-4 rounded-2xl border border-border bg-surface/80 px-4 py-3">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-full border border-border">
            <Play className="size-5 fill-fg text-fg" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-fg">Listen</p>
              <p className="text-xs text-faint">0:00 · 2:27</p>
            </div>
            <div className="mt-2 h-px w-full bg-fg/20" />
            <p className="mt-2 text-[11px] leading-relaxed text-faint">
              Read by Bob Souer · Public domain · verse timing aligned by Selah
            </p>
          </div>
        </div>
      </div>

      <p className="mt-10 px-5 text-[15px] text-muted">You Have Searched Me and Known Me</p>

      <section className="mt-6 flex flex-1 flex-col justify-end bg-[#1c1612] px-6 pb-32 pt-16">
        <p className="font-serif text-[2.35rem] leading-[1.15] text-[#efe6d6]">
          O LORD, You have searched me and known me.
        </p>
        <p className="mt-10 text-right text-[11px] tracking-[0.22em] text-faint uppercase">Psalm 139:1</p>
        <Link
          to="/immerse"
          className="mt-10 inline-flex min-h-12 w-fit items-center rounded-full border border-[#efe6d6]/25 px-5 text-[11px] tracking-[0.22em] text-[#efe6d6] uppercase"
        >
          Enter this verse ↑
        </Link>
      </section>
    </main>
  );
}

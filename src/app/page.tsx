"use client";

import { useLang } from "@/i18n";
import { Banner, Nav } from "@/components/chrome";
import Explorer from "@/components/Explorer";
import HomesShowcase from "@/components/HomesShowcase";
import PermitsShowcase from "@/components/PermitsShowcase";
import Developers from "@/components/Developers";
import Data from "@/components/Data";
import MapleLeaf from "@/components/MapleLeaf";

function Hero() {
  const { t } = useLang();
  const h = t.hero;
  return (
    <section id="top" className="bg-paper">
      <div className="mx-auto max-w-[1392px] px-6 pb-16 pt-14 md:pb-24 md:pt-20">
        <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-canada">{h.kicker}</p>
        <h1 className="display mt-4 max-w-[900px] text-[52px] md:text-[76px]">{h.title}</h1>
        <p className="mt-6 max-w-[760px] text-[19px] leading-relaxed text-ink/70">{h.sub}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a href="#explorer" className="rounded-full bg-canada px-6 py-3 text-[15px] font-semibold text-white hover:bg-canada-dark">
            {h.cta1}
          </a>
          <a href="#methodology" className="rounded-full border border-line px-6 py-3 text-[15px] font-semibold hover:border-ink">
            {h.cta2}
          </a>
        </div>
      </div>
    </section>
  );
}

function Stats() {
  const { t } = useLang();
  return (
    <section className="border-y border-line bg-paper">
      <div className="mx-auto grid max-w-[1392px] grid-cols-2 gap-px px-6 py-2 lg:grid-cols-4">
        {t.stats.map((s) => (
          <div key={s.label} className="px-2 py-8">
            <p className="display text-[44px] text-canada md:text-[52px]">{s.value}</p>
            <p className="mt-2 max-w-[280px] text-[14.5px] leading-snug text-ink/65">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Methodology() {
  const { t } = useLang();
  const m = t.methodology;
  return (
    <section id="methodology" className="bg-paper">
      <div className="mx-auto max-w-[1392px] px-6 py-20 md:py-28">
        <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-canada">{m.kicker}</p>
        <h2 className="display mt-4 max-w-[800px] text-[40px] md:text-[52px]">{m.title}</h2>
        <ol className="mt-10 max-w-[860px] space-y-5">
          {m.points.map((p, i) => (
            <li key={i} className="flex gap-4">
              <span className="display shrink-0 text-[22px] text-canada">{String(i + 1).padStart(2, "0")}</span>
              <p className="text-[16.5px] leading-relaxed text-ink/80">{p}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Footer() {
  const { t } = useLang();
  const f = t.footer;
  return (
    <footer className="bg-ink text-white">
      <div className="mx-auto max-w-[1392px] px-6 py-14">
        <div className="flex items-center gap-2.5">
          <MapleLeaf className="h-7 w-7 text-canada" />
          <span className="display text-[24px]">Development Pipeline</span>
        </div>
        <p className="mt-4 max-w-[720px] text-[14.5px] text-white/70">{f.line}</p>
        <p className="mt-2 max-w-[720px] text-[13px] text-white/50">{f.sources}</p>
      </div>
    </footer>
  );
}

export default function Page() {
  return (
    <>
      <Banner />
      <Nav />
      <main>
        <Hero />
        <Stats />
        <Explorer />
        <HomesShowcase />
        <PermitsShowcase />
        <Developers />
        <Methodology />
        <Data />
      </main>
      <Footer />
    </>
  );
}

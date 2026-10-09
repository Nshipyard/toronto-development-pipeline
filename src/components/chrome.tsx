"use client";

import { useState } from "react";
import { useLang } from "@/i18n";
import MapleLeaf from "./MapleLeaf";

export function Banner() {
  const { t } = useLang();
  return (
    <div className="bg-ink text-white">
      <div className="mx-auto flex max-w-[1392px] items-center justify-center gap-3 px-6 py-2.5 text-[13px] leading-snug">
        <span className="rounded-full border border-white/30 px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wide">
          {t.banner.badge}
        </span>
        <p className="text-white/85">{t.banner.line}</p>
      </div>
    </div>
  );
}

export function Nav() {
  const { t, lang, setLang } = useLang();
  const [open, setOpen] = useState(false);
  const links = [
    { href: "#explorer", label: t.nav.explorer },
    { href: "#homes", label: t.nav.homes },
    { href: "#permits", label: t.nav.permits },
    { href: "#developers", label: t.nav.developers },
    { href: "#data", label: t.nav.data },
  ];
  return (
    <header className="border-b border-line bg-paper/90 backdrop-blur">
      <div className="mx-auto flex max-w-[1392px] items-center justify-between px-6 py-4">
        <a href="#top" className="flex items-center gap-2.5">
          <MapleLeaf className="h-7 w-7 text-canada" />
          <span className="flex flex-col gap-[2px] leading-none"><span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/55">Open Nshipyard</span><span className="display text-[24px]">Development Pipeline</span></span>
        </a>
        <nav className="hidden items-center gap-7 md:flex">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="text-[15px] font-medium text-ink/70 hover:text-ink">
              {l.label}
            </a>
          ))}
          <a
            href="https://canada.nshipyard.com"
            className="text-[15px] font-medium text-ink/70 hover:text-ink"
          >
            ← {t.nav.back}
          </a>
          <div className="flex items-center rounded-full border border-line text-[14px] font-medium">
            {(["en", "fr"] as const).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`rounded-full px-3 py-1.5 uppercase ${
                  lang === l ? "bg-ink text-white" : "text-ink/60 hover:text-ink"
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </nav>
        <div className="flex items-center gap-3 md:hidden">
          <div className="flex items-center rounded-full border border-line text-[14px] font-medium">
            {(["en", "fr"] as const).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`rounded-full px-3 py-1.5 uppercase ${
                  lang === l ? "bg-ink text-white" : "text-ink/60 hover:text-ink"
                }`}
              >
                {l}
              </button>
            ))}
          </div>
          <button
            onClick={() => setOpen(!open)}
            className="rounded-full border border-line px-4 py-2 text-[14px] font-medium"
          >
            Menu
          </button>
        </div>
      </div>
      {open && (
        <nav className="border-t border-line px-6 py-4 md:hidden">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block py-2.5 text-[16px] font-medium text-ink/80"
            >
              {l.label}
            </a>
          ))}
          <a href="https://canada.nshipyard.com" className="block py-2.5 text-[16px] font-medium text-ink/80">
            ← {t.nav.back}
          </a>
        </nav>
      )}
    </header>
  );
}

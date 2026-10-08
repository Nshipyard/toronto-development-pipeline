"use client";

import { useEffect, useMemo, useState } from "react";
import { useLang } from "@/i18n";

type TypeRow = { permit_type: string; n: number; median_days: number };
type YearRow = { year: number; n: number; median_days: number };

export default function PermitsShowcase() {
  const { t } = useLang();
  const s = t.permits;
  const [types, setTypes] = useState<TypeRow[]>([]);
  const [years, setYears] = useState<YearRow[]>([]);

  useEffect(() => {
    fetch("/api/v1/pipeline/permit_times")
      .then((r) => r.json())
      .then((d) => {
        const rows = d.results ?? [];
        const ts: TypeRow[] = (d.by_type ?? [])
          .filter((t: TypeRow) => t.n >= 500)
          .sort((a: TypeRow, b: TypeRow) => b.median_days - a.median_days)
          .slice(0, 12);
        setTypes(ts);
        setYears(
          rows
            .filter((r: any) => r.permit_type === "New Building")
            .map((r: any) => ({ year: r.year, n: r.n, median_days: r.median_days }))
            .sort((a: YearRow, b: YearRow) => a.year - b.year)
        );
      })
      .catch(() => {});
  }, []);

  const maxDays = useMemo(() => Math.max(1, ...types.map((t) => t.median_days)), [types]);
  const maxYear = useMemo(() => Math.max(1, ...years.map((y) => y.median_days)), [years]);

  return (
    <section id="permits" className="bg-paper-warm">
      <div className="mx-auto max-w-[1392px] px-6 py-20 md:py-28">
        <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-canada">{s.kicker}</p>
        <h2 className="display mt-4 max-w-[800px] text-[40px] md:text-[52px]">{s.title}</h2>
        <p className="mt-5 max-w-[760px] text-[18px] leading-relaxed text-ink/70">{s.body}</p>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <div className="rounded-[24px] border border-line bg-white p-6 md:p-8">
            <h3 className="text-[19px] font-semibold">{s.byType}</h3>
            <div className="mt-6 space-y-4">
              {types.map((t) => (
                <div key={t.permit_type}>
                  <div className="flex items-baseline justify-between gap-3 text-[14px]">
                    <span className="font-medium">{t.permit_type}</span>
                    <span className="shrink-0 text-ink/60">
                      <strong className="text-ink">{Math.round(t.median_days)}</strong> {s.medianDays} ·{" "}
                      {t.n.toLocaleString()} {s.permits}
                    </span>
                  </div>
                  <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-ink/8">
                    <div
                      className="h-full rounded-full bg-canada"
                      style={{ width: `${Math.max(2, (t.median_days / maxDays) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[24px] border border-line bg-white p-6 md:p-8">
            <h3 className="text-[19px] font-semibold">{s.byYear}</h3>
            <div className="mt-6 flex h-[260px] items-end gap-[3px]">
              {years.map((y) => (
                <div key={y.year} className="group relative flex-1" title={`${y.year}: ${Math.round(y.median_days)} ${s.medianDays}`}>
                  <div
                    className="w-full rounded-t bg-canada/80 group-hover:bg-canada"
                    style={{ height: `${Math.max(3, (y.median_days / maxYear) * 230)}px` }}
                  />
                </div>
              ))}
            </div>
            <div className="mt-2 flex justify-between text-[12px] text-ink/50">
              <span>{years[0]?.year}</span>
              <span>{years[years.length - 1]?.year}</span>
            </div>
            <p className="mt-4 text-[13.5px] leading-relaxed text-ink/60">{s.yearNote}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

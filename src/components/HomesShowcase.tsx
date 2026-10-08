"use client";

import { useEffect, useMemo, useState } from "react";
import { useLang } from "@/i18n";
import hoods from "../../data/neighbourhoods_158.json";

type HoodStat = { units: number; projects: number; name: string };

const STEPS = 5;
const REDS = ["#fde8ea", "#f6b8bf", "#ea7a87", "#d80621", "#7d0313"];

function colorFor(units: number, breaks: number[]) {
  for (let i = 0; i < breaks.length; i++) {
    if (units <= breaks[i]) return REDS[i];
  }
  return REDS[REDS.length - 1];
}

export default function HomesShowcase() {
  const { t } = useLang();
  const s = t.homes;
  const [built, setBuilt] = useState<Record<string, HoodStat>>({});
  const [pipeline, setPipeline] = useState<Record<string, number>>({});
  const [hover, setHover] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/v1/pipeline/summary")
      .then((r) => r.json())
      .then((d) => {
        setBuilt(d.built_by_neighbourhood ?? {});
        setPipeline(d.pipeline_units_by_neighbourhood ?? {});
      })
      .catch(() => {});
  }, []);

  const { paths, breaks, top } = useMemo(() => {
    const feats = (hoods as any).features as any[];
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    const polys: { code: string; name: string; d: string }[] = [];
    for (const f of feats) {
      const geom = f.geometry;
      const rings: number[][][] =
        geom.type === "Polygon"
          ? geom.coordinates
          : geom.coordinates.flatMap((p: number[][][]) => p);
      for (const ring of rings)
        for (const [x, y] of ring) {
          if (x < x0) x0 = x;
          if (y < y0) y0 = y;
          if (x > x1) x1 = x;
          if (y > y1) y1 = y;
        }
      const d = rings
        .map((ring) => "M" + ring.map(([x, y]) => `${x.toFixed(4)},${y.toFixed(4)}`).join("L") + "Z")
        .join("");
      polys.push({ code: String(f.properties.code), name: String(f.properties.name), d });
    }
    const W = 900, H = 620;
    const sx = W / (x1 - x0), sy = H / (y1 - y0);
    const sc = Math.min(sx, sy);
    const paths = polys.map((p) => ({
      ...p,
      d: p.d.replace(/(-?\d+\.?\d*),(-?\d+\.?\d*)/g, (_, a, b) => {
        const x = (parseFloat(a) - x0) * sc;
        const y = H - (parseFloat(b) - y0) * sc;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      }),
    }));
    const vals = Object.values(built as Record<string, HoodStat>)
      .map((v) => v.units)
      .filter((v) => v > 0)
      .sort((a, b) => a - b);
    const breaks = Array.from({ length: STEPS }, (_, i) =>
      vals.length ? vals[Math.min(vals.length - 1, Math.floor(((i + 1) / STEPS) * vals.length))] : 0
    );
    const top = Object.entries(built as Record<string, HoodStat>)
      .sort((a, b) => b[1].units - a[1].units)
      .slice(0, 10);
    return { paths, breaks, top };
  }, [built]);

  const hoverStat = hover ? built[hover] : null;

  return (
    <section id="homes" className="bg-paper">
      <div className="mx-auto max-w-[1392px] px-6 py-20 md:py-28">
        <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-canada">{s.kicker}</p>
        <h2 className="display mt-4 max-w-[800px] text-[40px] md:text-[52px]">{s.title}</h2>
        <p className="mt-5 max-w-[760px] text-[18px] leading-relaxed text-ink/70">{s.body}</p>

        <div className="mt-10 grid gap-6 lg:grid-cols-5">
          <div className="overflow-hidden rounded-[24px] border border-line bg-paper-warm lg:col-span-3">
            <svg viewBox="0 0 900 620" className="block w-full" role="img" aria-label={s.title}>
              {paths.map((p) => {
                const u = built[p.code]?.units ?? 0;
                return (
                  <path
                    key={p.code}
                    d={p.d}
                    fill={u > 0 ? colorFor(u, breaks) : "#eef0f3"}
                    stroke="#ffffff"
                    strokeWidth={1.2}
                    onMouseEnter={() => setHover(p.code)}
                    onMouseLeave={() => setHover(null)}
                    style={{ cursor: "pointer" }}
                  />
                );
              })}
            </svg>
            <div className="flex items-center justify-between border-t border-line px-6 py-3">
              <p className="text-[13px] text-ink/55">{s.mapNote}</p>
              <div className="flex items-center gap-1">
                {REDS.map((c, i) => (
                  <span key={i} className="h-3 w-6 rounded-sm" style={{ background: c }} />
                ))}
              </div>
            </div>
            {hoverStat && (
              <div className="border-t border-line px-6 py-3 text-[14px]">
                <strong>{hoverStat.name}</strong>: {hoverStat.units.toLocaleString()} {s.builtUnits} ·{" "}
                {hoverStat.projects} {s.projects}
              </div>
            )}
          </div>

          <div className="overflow-hidden rounded-[24px] border border-line bg-white lg:col-span-2">
            <div className="border-b border-line px-6 py-4">
              <h3 className="text-[19px] font-semibold">{s.topTitle}</h3>
            </div>
            <ol className="divide-y divide-line">
              {top.map(([code, v], i) => (
                <li key={code} className="flex items-center gap-4 px-6 py-3.5">
                  <span className="w-6 text-[14px] font-semibold text-ink/40">{i + 1}</span>
                  <div className="flex-1">
                    <p className="font-medium">{v.name}</p>
                    <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-ink/8">
                      <div
                        className="h-full rounded-full bg-canada"
                        style={{ width: `${Math.max(4, (v.units / (top[0]?.[1].units || 1)) * 100)}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[17px] font-semibold">{v.units.toLocaleString()}</p>
                    <p className="text-[12px] text-ink/55">
                      {s.built} · {(pipeline[code] ?? 0).toLocaleString()} {s.inPipeline.toLowerCase()}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}

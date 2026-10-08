"use client";

import { useEffect, useMemo, useState } from "react";
import { useLang } from "@/i18n";
import type { PipelineRow } from "@/lib/pipeline";

const STATUS_COLORS: Record<string, string> = {
  proposed: "bg-amber-100 text-amber-900",
  active: "bg-sky-100 text-sky-900",
  built: "bg-emerald-100 text-emerald-900",
  unknown: "bg-ink/10 text-ink/60",
};

export default function Explorer() {
  const { t } = useLang();
  const e = t.explorer;
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [ward, setWard] = useState("");
  const [rows, setRows] = useState<PipelineRow[]>([]);
  const [wards, setWards] = useState<string[]>([]);
  const [sel, setSel] = useState<PipelineRow | null>(null);
  const [debounced, setDebounced] = useState("");

  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(q), 350);
    return () => window.clearTimeout(id);
  }, [q]);

  useEffect(() => {
    const p = new URLSearchParams({ limit: "40" });
    if (debounced) p.set("q", debounced);
    if (status) p.set("status", status);
    if (ward) p.set("ward", ward);
    fetch(`/api/v1/pipeline/search?${p}`)
      .then((r) => r.json())
      .then((d) => {
        setRows(d.results ?? []);
        if (!sel && d.results?.length) setSel(d.results[0]);
      })
      .catch(() => {});
  }, [debounced, status, ward]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetch("/api/v1/pipeline/summary")
      .then((r) => r.json())
      .then((d) => {
        setWards(d.wards ?? []);
      })
      .catch(() => {});
  }, []);

  const statusLabel = useMemo(
    () => ({ proposed: e.proposed, active: e.active, built: e.built, unknown: "?" }),
    [e]
  );

  return (
    <section id="explorer" className="bg-paper-warm">
      <div className="mx-auto max-w-[1392px] px-6 py-20 md:py-28">
        <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-canada">{e.kicker}</p>
        <h2 className="display mt-4 max-w-[720px] text-[40px] md:text-[52px]">{e.title}</h2>

        <div className="mt-8 flex flex-col gap-3 md:flex-row">
          <input
            value={q}
            onChange={(ev) => setQ(ev.target.value)}
            placeholder={e.search}
            className="w-full rounded-full border border-line bg-white px-5 py-3 text-[15px] outline-none focus:border-canada md:max-w-[480px]"
          />
          <select
            value={status}
            onChange={(ev) => setStatus(ev.target.value)}
            className="rounded-full border border-line bg-white px-5 py-3 text-[15px]"
          >
            <option value="">{e.allStatuses}</option>
            <option value="proposed">{e.proposed}</option>
            <option value="active">{e.active}</option>
            <option value="built">{e.built}</option>
          </select>
          <select
            value={ward}
            onChange={(ev) => setWard(ev.target.value)}
            className="rounded-full border border-line bg-white px-5 py-3 text-[15px]"
          >
            <option value="">{e.allWards}</option>
            {wards.map((w) => (
              <option key={w} value={w}>
                {e.ward} {w}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="overflow-hidden rounded-[24px] border border-line bg-white">
            <div className="border-b border-line px-6 py-3 text-[13px] font-medium text-ink/60">
              {rows.length} {e.results}
            </div>
            <ul className="max-h-[560px] divide-y divide-line overflow-y-auto">
              {rows.length === 0 && <li className="px-6 py-8 text-[15px] text-ink/60">{e.noResult}</li>}
              {rows.map((r) => (
                <li key={r.id}>
                  <button
                    onClick={() => setSel(r)}
                    className={`block w-full px-6 py-4 text-left hover:bg-paper-warm ${
                      sel?.id === r.id ? "bg-paper-warm" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium">{r.address || r.id}</p>
                        <p className="mt-0.5 font-mono text-[12.5px] text-ink/55">{r.id}</p>
                      </div>
                      <span
                        className={`shrink-0 rounded-full px-2.5 py-1 text-[12px] font-semibold ${STATUS_COLORS[r.status]}`}
                      >
                        {statusLabel[r.status]}
                      </span>
                    </div>
                    <p className="mt-1 text-[13.5px] text-ink/60">
                      {r.units.toLocaleString()} {e.detail.units.toLowerCase()}
                      {r.hoodName ? ` · ${r.hoodName}` : ""}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-[24px] border border-line bg-white p-6 md:p-8">
            {!sel ? (
              <p className="text-[15px] text-ink/60">{e.empty}</p>
            ) : (
              <div>
                <span
                  className={`rounded-full px-2.5 py-1 text-[12px] font-semibold ${STATUS_COLORS[sel.status]}`}
                >
                  {statusLabel[sel.status]}
                </span>
                <h3 className="display mt-3 text-[28px]">{sel.address || sel.id}</h3>
                <p className="mt-1 font-mono text-[13px] text-ink/55">{sel.id}</p>
                <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-4 text-[15px]">
                  <div>
                    <dt className="text-[13px] text-ink/55">{e.detail.units}</dt>
                    <dd className="mt-0.5 text-[22px] font-semibold">{sel.units.toLocaleString()}</dd>
                  </div>
                  <div>
                    <dt className="text-[13px] text-ink/55">{e.detail.ward}</dt>
                    <dd className="mt-0.5 text-[22px] font-semibold">{sel.ward || "–"}</dd>
                  </div>
                  <div className="col-span-2">
                    <dt className="text-[13px] text-ink/55">{e.detail.neighbourhood}</dt>
                    <dd className="mt-0.5 font-medium">
                      {sel.hoodName ? `${sel.hoodName} (${sel.hoodCode})` : "–"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[13px] text-ink/55">{e.detail.received}</dt>
                    <dd className="mt-0.5 font-medium">{sel.dateReceived || "–"}</dd>
                  </div>
                  <div>
                    <dt className="text-[13px] text-ink/55">{e.detail.resGfa}</dt>
                    <dd className="mt-0.5 font-medium">
                      {sel.resGfa ? Number(sel.resGfa).toLocaleString() : "–"}
                    </dd>
                  </div>
                </dl>
                <div className="mt-6">
                  <p className="text-[13px] text-ink/55">{e.detail.timeline}</p>
                  <div className="mt-2 flex items-center gap-0">
                    {(["proposed", "active", "built"] as const).map((s, i) => {
                      const order = { proposed: 0, active: 1, built: 2 } as const;
                      const reached = order[sel.status as keyof typeof order] >= i;
                      return (
                        <div key={s} className="flex flex-1 items-center last:flex-none">
                          <div className="flex flex-col items-center">
                            <span
                              className={`flex h-8 w-8 items-center justify-center rounded-full text-[13px] font-bold ${
                                reached ? "bg-canada text-white" : "bg-ink/10 text-ink/40"
                              }`}
                            >
                              {i + 1}
                            </span>
                            <span className="mt-1 text-[12px] text-ink/60">{statusLabel[s]}</span>
                          </div>
                          {i < 2 && <div className={`mx-1 h-0.5 flex-1 ${reached ? "bg-canada" : "bg-ink/10"}`} />}
                        </div>
                      );
                    })}
                  </div>
                </div>
                {sel.aicLink && (
                  <a
                    href={sel.aicLink}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-6 inline-block rounded-full bg-ink px-5 py-2.5 text-[14px] font-medium text-white hover:bg-canada"
                  >
                    {e.detail.aic} →
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

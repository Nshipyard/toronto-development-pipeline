"use client";

import { useLang } from "@/i18n";
import McpConnect from "./McpConnect";

const endpoints = [
  {
    method: "GET",
    path: "/api/v1/pipeline/search?q=yonge&status=built",
    desc: "Search applications by address, id, or neighbourhood",
    response: `{
  "count": 40,
  "results": [
    { "id": "17 122573 STE 20 OZ",
      "address": "…",
      "status": "built",
      "units": 7190 }
  ]
}`,
  },
  {
    method: "GET",
    path: "/api/v1/pipeline/permit_times?type=New%20Building",
    desc: "Median issuance days by permit type and year",
    response: `{
  "count": 23,
  "results": [
    { "permit_type": "New Building",
      "year": 2024, "n": 149,
      "median_days": 184.0 }
  ]
}`,
  },
  {
    method: "GET",
    path: "/api/v1/pipeline/summary",
    desc: "Totals, units by status, built units by neighbourhood",
    response: `{
  "records": 2391,
  "built_units": 124326,
  "units_by_status": {
    "proposed": 367469,
    "active": 435737,
    "built": 124326 }
}`,
  },
];

export default function Developers() {
  const { t } = useLang();
  return (
    <section id="developers" className="bg-ink text-white">
      <div className="mx-auto max-w-[1392px] px-6 py-20 md:py-28">
        <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-white/60">{t.developers.kicker}</p>
        <h2 className="display mt-4 max-w-[720px] text-[40px] md:text-[52px]">{t.developers.title}</h2>
        <p className="mt-5 max-w-[720px] text-[18px] leading-relaxed text-white/70">{t.developers.body}</p>

        <h3 className="mt-14 text-[13px] font-semibold uppercase tracking-[0.12em] text-white/60">{t.developers.endpoints}</h3>
        <div className="mt-5 grid gap-5 lg:grid-cols-3">
          {endpoints.map((e) => (
            <article key={e.path} className="overflow-hidden rounded-[24px] bg-white/[0.06]">
              <div className="border-b border-white/10 px-6 py-4">
                <span className="mr-3 rounded-full bg-canada px-2.5 py-1 font-mono text-[12px] font-semibold">{e.method}</span>
                <code className="font-mono text-[13px] text-white/85 break-all">{e.path}</code>
                <p className="mt-2 text-[14px] text-white/60">{e.desc}</p>
              </div>
              <pre className="overflow-x-auto px-6 py-4 font-mono text-[12.5px] leading-relaxed text-white/75">{e.response}</pre>
            </article>
          ))}
        </div>

        <div className="mt-8">
          <a href="/api/openapi.json" className="block rounded-[24px] bg-white/[0.06] p-6 hover:bg-white/[0.09]">
            <h4 className="text-[19px] font-semibold">{t.developers.openapi}</h4>
            <code className="mt-2 block font-mono text-[13px] text-white/60">GET /api/openapi.json</code>
          </a>
        </div>

        <McpConnect
          config={{
            slug: "toronto-pipeline",
            displayName: "Toronto Development Pipeline",
            exampleEn: "Look up the development application with the most built homes and tell me its address and unit count",
            exampleFr: "Cherche la demande de développement avec le plus de logements construits et donne-moi son adresse et son nombre de logements",
          }}
        />
      </div>
    </section>
  );
}

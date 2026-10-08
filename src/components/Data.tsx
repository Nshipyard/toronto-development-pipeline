"use client";

import { useLang } from "@/i18n";

export default function Data() {
  const { t } = useLang();
  const d = t.data;
  return (
    <section id="data" className="bg-paper">
      <div className="mx-auto max-w-[1392px] px-6 py-20 md:py-28">
        <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-canada">{d.kicker}</p>
        <h2 className="display mt-4 text-[40px] md:text-[52px]">{d.title}</h2>
        <p className="mt-5 max-w-[720px] text-[18px] leading-relaxed text-ink/70">{d.body}</p>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {d.files.map((f) => (
            <div key={f.name} className="rounded-[24px] border border-line bg-paper-warm p-6">
              <code className="font-mono text-[14px] font-semibold break-all">{f.name}</code>
              <p className="mt-2 text-[14.5px] text-ink/65">{f.desc}</p>
              <a
                href={`/data/${f.name}`}
                download
                className="mt-4 inline-block rounded-full bg-ink px-5 py-2.5 text-[14px] font-medium text-white hover:bg-canada"
              >
                {d.download}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

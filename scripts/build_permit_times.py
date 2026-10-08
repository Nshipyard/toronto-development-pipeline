#!/usr/bin/env python3
"""Permit-time analysis: days from APPLICATION_DATE to ISSUED_DATE by
PERMIT_TYPE and application year, from Building Permits - Active Permits.

Caveat: this dataset is a snapshot of permits active as of retrieval
(2026-10-08). Older years only include permits still open, so year trends
carry survivorship bias; the per-type medians describe this active set.
"""
import csv
import json
from collections import defaultdict
from datetime import date
from statistics import median, quantiles


def parse(d):
    if not d:
        return None
    try:
        y, m, day = d.split("-")
        return date(int(y), int(m), int(day))
    except (ValueError, AttributeError):
        return None


def pct(rows, q):
    if len(rows) < 4:
        return None
    try:
        qs = quantiles(sorted(rows), n=100)
        return round(qs[q - 1], 1)
    except Exception:
        return None


def main():
    rows = json.load(open("data/raw/permits.json"))
    print(f"permit rows: {len(rows)}")
    by_type_year = defaultdict(list)
    by_type = defaultdict(list)
    neg = 0
    nodates = 0
    for r in rows:
        a, b = parse(r.get("APPLICATION_DATE")), parse(r.get("ISSUED_DATE"))
        if not a or not b:
            nodates += 1
            continue
        days = (b - a).days
        if days < 0:
            neg += 1
            continue
        if days > 3650:  # 10y cap, data-entry outliers
            continue
        pt = (r.get("PERMIT_TYPE") or "Unknown").strip()
        by_type[pt].append(days)
        by_type_year[(pt, a.year)].append(days)

    out = []
    for (pt, yr), ds in sorted(by_type_year.items()):
        if len(ds) < 10:
            continue
        out.append({
            "permit_type": pt,
            "year": yr,
            "n": len(ds),
            "median_days": round(median(ds), 1),
            "p25_days": pct(ds, 25),
            "p75_days": pct(ds, 75),
        })
    with open("data/permit_times.csv", "w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=list(out[0].keys()))
        w.writeheader()
        w.writerows(out)

    type_summary = []
    for pt, ds in sorted(by_type.items(), key=lambda kv: -len(kv[1])):
        type_summary.append({
            "permit_type": pt, "n": len(ds),
            "median_days": round(median(ds), 1),
            "p25_days": pct(ds, 25), "p75_days": pct(ds, 75),
        })

    json.dump({
        "source": "City of Toronto Open Data: Building Permits - Active Permits, retrieved 2026-10-08",
        "records_total": len(rows),
        "records_with_both_dates": sum(len(v) for v in by_type.values()),
        "records_missing_dates": nodates,
        "records_negative_days_excluded": neg,
        "by_type": type_summary[:25],
        "caveats": [
            "Snapshot of permits active as of 2026-10-08; older application years only include permits still open (survivorship bias).",
            "Days are calendar days from application to issuance; review rounds and applicant response time are not separated.",
            "Negative day values and values over 10 years were excluded as data-entry errors.",
        ],
    }, open("data/permit_times_summary.json", "w"), indent=1)
    print(f"wrote data/permit_times.csv ({len(out)} type-year rows)")
    print("top types by median:")
    for t in type_summary[:10]:
        print(f"  {t['permit_type']}: n={t['n']} median={t['median_days']}d")


if __name__ == "__main__":
    main()

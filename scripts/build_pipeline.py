#!/usr/bin/env python3
"""Normalize the Toronto Development Pipeline into pipeline.csv + summary.json.

Inputs (data/raw/, not committed):
  pipeline.json  - official Development Pipeline datastore dump (2,391 rows)
  devapps.json   - Development Applications datastore dump (for X/Y coords)
  (neighbourhoods_158_simple.geojson copied from the sibling geo project)

Join: pipeline.Application Number -> devapps.APPLICATION# -> X/Y (MTM EPSG:2952)
  -> WGS84 -> point-in-polygon over the 158 neighbourhood model.
"""
import csv
import json
import re
from collections import Counter, defaultdict

from pyproj import Transformer

RAW = "data/raw"
GEO = "/home/hatch/workspace/toronto-geo-concordances/data/neighbourhoods_158_simple.geojson"

STATUS_MAP = {
    "Under Review": "proposed",
    "Active": "active",
    "Built": "built",
}

transformer = Transformer.from_crs("EPSG:2952", "EPSG:4326", always_xy=True)


def point_in_ring(lon, lat, ring):
    inside = False
    n = len(ring)
    j = n - 1
    for i in range(n):
        xi, yi = ring[i][0], ring[i][1]
        xj, yj = ring[j][0], ring[j][1]
        if (yi > lat) != (yj > lat) and lon < (xj - xi) * (lat - yi) / (yj - yi) + xi:
            inside = not inside
        j = i
    return inside


def main():
    pipe = json.load(open(f"{RAW}/pipeline.json"))
    devapps = json.load(open(f"{RAW}/devapps.json"))
    print(f"pipeline rows: {len(pipe)}, devapps rows: {len(devapps)}")

    # app# -> (x, y); keep first occurrence
    xy = {}
    for r in devapps:
        k = (r.get("APPLICATION#") or "").strip()
        if k and k not in xy and r.get("X") and r.get("Y"):
            try:
                xy[k] = (float(r["X"]), float(r["Y"]))
            except (TypeError, ValueError):
                pass
    print(f"devapps with coords: {len(xy)}")

    # neighbourhood polygons with bboxes
    gj = json.load(open(GEO))
    polys = []
    for f in gj["features"]:
        code = f["properties"].get("code") or f["properties"].get("AREA_CODE") or ""
        name = f["properties"].get("name") or f["properties"].get("AREA_NAME") or ""
        geom = f["geometry"]
        rings = []
        if geom["type"] == "Polygon":
            rings = geom["coordinates"]
        elif geom["type"] == "MultiPolygon":
            rings = [r for poly in geom["coordinates"] for r in poly]
        lons = [p[0] for ring in rings for p in ring]
        lats = [p[1] for ring in rings for p in ring]
        polys.append((str(code), str(name), rings,
                      (min(lons), min(lats), max(lons), max(lats))))
    print(f"neighbourhood polygons: {len(polys)}")
    print("sample props:", gj["features"][0]["properties"])

    def locate(lon, lat):
        for code, name, rings, (x0, y0, x1, y1) in polys:
            if not (x0 <= lon <= x1 and y0 <= lat <= y1):
                continue
            if point_in_ring(lon, lat, rings[0]):
                return code, name
        return "", ""

    rows = []
    matched_xy = 0
    matched_hood = 0
    for r in pipe:
        appnum = (r.get("Application Number") or "").strip()
        status_raw = (r.get("Pipeline Status") or "").strip()
        units = r.get("Proposed Residential Units")
        try:
            units_i = int(float(units)) if units not in (None, "") else 0
        except (TypeError, ValueError):
            units_i = 0
        lon = lat = ""
        hood_code, hood_name = "", ""
        if appnum in xy:
            matched_xy += 1
            lon, lat = transformer.transform(*xy[appnum])
            lon, lat = round(lon, 6), round(lat, 6)
            hood_code, hood_name = locate(lon, lat)
            if hood_code:
                matched_hood += 1
        rows.append({
            "id": re.sub(r"\s+", " ", appnum),
            "address": (r.get("Address") or "").strip(),
            "ward": str(r.get("Ward") or "").strip(),
            "neighbourhood_158_code": hood_code,
            "neighbourhood_158_name": hood_name,
            "status_raw": status_raw,
            "status": STATUS_MAP.get(status_raw, "unknown"),
            "proposed_units": units_i,
            "proposed_res_gfa": r.get("Proposed Residential Gross Floor Area") or "",
            "proposed_nonres_gfa": r.get("Proposed Non-Residential Gross Floor Area") or "",
            "date_received": (r.get("Date Received") or "").strip(),
            "aic_link": (r.get("Application Information Centre Link") or "").strip(),
            "lon": lon,
            "lat": lat,
        })

    with open("data/pipeline.csv", "w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
        w.writeheader()
        w.writerows(rows)

    by_status = Counter(r["status"] for r in rows)
    units_by_status = defaultdict(int)
    for r in rows:
        units_by_status[r["status"]] += r["proposed_units"]
    built_by_hood = defaultdict(lambda: {"units": 0, "projects": 0, "name": ""})
    active_by_hood = defaultdict(int)
    for r in rows:
        if r["neighbourhood_158_code"]:
            if r["status"] == "built":
                b = built_by_hood[r["neighbourhood_158_code"]]
                b["units"] += r["proposed_units"]
                b["projects"] += 1
                b["name"] = r["neighbourhood_158_name"]
            elif r["status"] in ("active", "proposed"):
                active_by_hood[r["neighbourhood_158_code"]] += r["proposed_units"]

    summary = {
        "source": "City of Toronto Open Data: Development Pipeline (official analytical dataset), retrieved 2026-10-08",
        "records": len(rows),
        "xy_match_rate": round(matched_xy / len(rows), 4),
        "hood_match_rate": round(matched_hood / len(rows), 4),
        "status_counts": dict(by_status),
        "units_by_status": dict(units_by_status),
        "total_proposed_units": sum(r["proposed_units"] for r in rows),
        "built_units": units_by_status.get("built", 0),
        "built_by_neighbourhood": {
            k: v for k, v in sorted(built_by_hood.items(), key=lambda kv: -kv[1]["units"])
        },
        "pipeline_units_by_neighbourhood": dict(sorted(active_by_hood.items(), key=lambda kv: -kv[1])),
        "status_taxonomy": {
            "proposed": "Under Review in the source: application submitted, decision pending.",
            "active": "Active in the source: approved or under construction, not yet recorded complete.",
            "built": "Built in the source: completed. These units count as homes gained.",
        },
        "caveats": [
            "Unit counts are proposed units from planning applications, not final occupancy counts.",
            "The pipeline covers larger developments requiring Planning Act approvals; as-of-right development below the Site Plan Control threshold is excluded.",
            f"{len(rows) - matched_xy} of {len(rows)} records had no coordinate match in Development Applications; {matched_xy - matched_hood} matched coordinates fell outside the 158 model.",
        ],
    }
    json.dump(summary, open("data/summary.json", "w"), indent=1)
    print(f"wrote data/pipeline.csv ({len(rows)} rows), xy match {matched_xy}, hood match {matched_hood}")
    print("units by status:", dict(units_by_status))
    top = list(summary["built_by_neighbourhood"].items())[:5]
    print("top built neighbourhoods:", [(k, v["name"], v["units"]) for k, v in top])


if __name__ == "__main__":
    main()

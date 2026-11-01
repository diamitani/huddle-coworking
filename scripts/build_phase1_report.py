#!/usr/bin/env python3
"""Assemble audit/PHASE1-REPORT.json from the pipeline outputs.

Reads: scripts/rebuild_served.py (curated corrections + BRAND_PRICING),
       public/data/directory.json, public/data/stats.json,
       audit/recheck_report.json (if present), audit/operator_contacts.json.
Deterministic; safe to re-run.
"""
import importlib.util
import json
import os

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
AUDIT = os.path.join(BASE, "audit")
DATA = os.path.join(BASE, "public", "data")


def load(path, default=None):
    return json.load(open(path, encoding="utf-8")) if os.path.exists(path) else default


def main():
    spec = importlib.util.spec_from_file_location("rs",
        os.path.join(BASE, "scripts", "rebuild_served.py"))
    rs = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(rs)

    records = load(os.path.join(DATA, "directory.json"), [])
    stats = load(os.path.join(DATA, "stats.json"), {})
    # final website counts (slow-pass verified); fall back to the fast pass
    final = load(os.path.join(AUDIT, "websites_final.json"), {}) or {}
    recheck = final or load(os.path.join(AUDIT, "recheck_report.json"), {}) or {}
    contacts = load(os.path.join(AUDIT, "operator_contacts.json"), {}) or {}
    drive_frag = load(os.path.join(AUDIT, "drive_enrich_fragment.json"), {}) or {}

    # --- junk decisions from the curated deletion list ---
    junk_decisions = []
    for rid, reason in sorted(rs.DELETED_IDS.items(), key=lambda x: x[0]):
        if reason == "closed":
            verdict, name = "closed", None
            evidence = "Name contained '- Closed'"
        elif reason.startswith("OSM re-add"):
            verdict = "junk"
            name = reason.split(":")[0].replace("OSM re-add of deleted ", "").strip()
            evidence = "OSM duplicate of a record already deleted as junk/closed"
        elif "permanently closed" in reason.lower():
            verdict = "closed"
            name = reason.split(":")[0].strip()
            evidence = reason
        else:
            verdict = "junk"
            name = reason.split(":")[0].strip()
            evidence = reason
        junk_decisions.append({"id": rid, "name": name, "verdict": verdict,
                               "evidence": evidence})
    junk_names = sorted(d["name"] for d in junk_decisions
                        if d["verdict"] == "junk" and d["name"])
    closed_names = ["- Closed listings (name contained '- Closed')"] * sum(
        1 for d in junk_decisions if d["verdict"] == "closed")

    # --- brand research summary ---
    brands_researched = []
    for b in rs.BRAND_PRICING:
        brands_researched.append({
            "brand": b["brand"],
            "pricing_found": b["pricing"] is not None,
            "pricing": b["pricing"],
            "source_url": b.get("source_url"),
            "retrieved": b.get("retrieved"),
            "notes": b.get("notes"),
        })
    brand_pricing = {b["brand"]: {"source_url": b.get("source_url"),
                                  "retrieved": b.get("retrieved"),
                                  "notes": b.get("notes"),
                                  "pricing": b["pricing"]}
                     for b in rs.BRAND_PRICING}
    brand_locations_priced = sum(
        1 for r in records
        if isinstance(r.get("pricing"), dict) and r["pricing"].get("source") in ("brand", "operator"))

    # --- brand program research summary (2026-11-01) ---
    programs_researched = []
    for b in rs.BRAND_PROGRAMS:
        programs_researched.append({
            "brand": b["brand"],
            "program": b["program"],
            "source_url": b.get("source_url"),
            "retrieved": b.get("retrieved"),
            "notes": b.get("notes"),
        })
    brand_locations_programmed = sum(
        1 for r in records if r.get("programs"))

    # OSM additions: 9 were admitted by the merge; 5 of them were later removed
    # as verified junk (counted under junk_removed). Net surviving computed here.
    deleted_osm = {d["id"] for d in junk_decisions
                   if d["id"] >= 7760}
    osm_net = sum(1 for r in records if r["id"] >= 7760)
    assert osm_net == 9 - len(deleted_osm), (osm_net, deleted_osm)
    osm_slugs = {r["slug"] for r in records if r["id"] >= 7760}
    osm_dead = sum(1 for s in (recheck.get("blanked_slugs") or [])
                   if s in osm_slugs)

    report = {
        "phase": "Phase 1 data surgery (2026-10-31)",
        "listings_before": 1073,
        "listings_after": len(records),
        "closed_removed": sum(1 for d in junk_decisions if d["verdict"] == "closed"),
        "junk_removed": sum(1 for d in junk_decisions if d["verdict"] == "junk"),
        "junk_names": junk_names,
        "closed_names": closed_names,
        "city_state_fixed": 21,
        "city_fixed": 1,
        "empty_dropped": 40,
        "empty_inferred": 50,
        "fallback_coords_nulled": 33,
        "crosscity_coords_nulled": 68,
        "descriptions_blanked": 740,
        "amenities_stripped": 997,
        "phones_restored": 727,
        "websites_checked": recheck.get("websites_checked", "pending"),
        "websites_alive": recheck.get("websites_alive", "pending"),
        "websites_fixed": recheck.get("websites_fixed", "pending"),
        "websites_blanked": recheck.get("websites_blanked", "pending"),
        "websites_unverifiable": recheck.get("websites_unverifiable", 0),
        "websites_method_note": recheck.get("method_note", ""),
        "websites_empty": recheck.get("websites_empty", "pending"),
        "osm_validated": 429,
        "osm_added": 9,
        "osm_net_surviving": osm_net,
        "osm_dupes": 261,
        "osm_dead": osm_dead,
        "junk_decisions": junk_decisions,
        "schema_fields_added": list(rs.SCHEMA_FIELDS),
        "schema_note": ("2026-11-01: minified keys retired per the master "
                        "directory backend mapping. Served records now use full "
                        "names EXACTLY: id, name, city, state, website, phone, "
                        "email (always null publicly), description, amenities, "
                        "latitude, longitude, slug, featured_tier "
                        "('featured'|'none'), address (or null), pricing "
                        "{day_pass, hot_desk_monthly, dedicated_desk_monthly, "
                        "private_office_monthly, meeting_room_hourly, source} "
                        "(or null), hours, membership_tiers, event_space, "
                        "events, programs, services. Dropped: ct, claimed, "
                        "street (folded into address), currency/updated_at "
                        "(provenance stays in brand_pricing). The pipeline "
                        "maps via to_internal/to_public; to_internal accepts "
                        "both shapes for idempotent re-runs."),
        "service_vocabulary": list(rs.SERVICE_VOCAB),
        "program_types": list(rs.PROGRAM_TYPES),
        "brands_researched": brands_researched,
        "brand_pricing": brand_pricing,
        "brand_locations_priced": brand_locations_priced,
        "programs_researched": programs_researched,
        "brand_locations_programmed": brand_locations_programmed,
        "operator_merge_supported": True,
        "operator_pricing_merged": 0,
        "operator_contacts": len(contacts),
        "drive_files_pulled": drive_frag.get("drive_files_pulled", []),
        "drive_rows_total": drive_frag.get("drive_rows_total", 0),
        "phones_enriched_from_drive": drive_frag.get("phones_enriched_from_drive", 0),
        "outreach_contacts": drive_frag.get("outreach_contacts", len(contacts)),
        "outreach_rows_processed": drive_frag.get("outreach_rows_processed", 0),
        "unmatched_contacts": drive_frag.get("unmatched_contacts", 0),
        "stats": stats,
    }
    with open(os.path.join(AUDIT, "PHASE1-REPORT.json"), "w",
              encoding="utf-8") as f:
        json.dump(report, f, indent=1, ensure_ascii=False)
        f.write("\n")
    print("wrote audit/PHASE1-REPORT.json")


if __name__ == "__main__":
    main()

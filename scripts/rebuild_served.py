#!/usr/bin/env python3
"""Rebuild the served Huddle directory from curated, verified inputs.

One reproducible, idempotent pipeline (stdlib + requests only).

Inputs:
    public/data/directory.json      current served records (array)
    public/data/osm_coworking.json   OSM venues (best source: real coords)
    public/data/featured.json        optional: {slug: "featured"|"premium"}
    public/data/operator_pricing.json
                                     optional: {slug: partial pricing/hours/
                                     services/event_space} (source="operator")
    audit/phone_restore_map.json     one-time phone/email restore (CSV was quarantined)

Outputs:
    public/data/directory.json      cleaned, validated records
    public/data/stats.json          real counts only

Modes:
    default        full validate+emit (deterministic, no network), sorted by id
    --recheck      re-validate website URLs in the current served JSON,
                   apply URL_FIXES to dead ones, blank the rest; update w fields
    --recheck --report-only
                   validate websites and write audit/recheck_report.json without modifying

Curated corrections (below) are idempotent: re-running on the output is a no-op.
id/slug are preserved for unchanged records across runs (slugs are deterministic
from name+city; matching on normalized name+city+state reuses them).

Data contract (public/data/directory.json): array of records using the
master-backend full names EXACTLY (no minified keys):
id, name, city, state, website, phone, email (always null publicly), description,
amenities, latitude, longitude, slug, featured_tier ("featured"|"none"),
address (or null), pricing {day_pass, hot_desk_monthly, dedicated_desk_monthly,
private_office_monthly, meeting_room_hourly, source} (or null), hours,
membership_tiers, event_space, events, programs, services.
Internally the pipeline works on the legacy-minified shape; to_internal /
to_public map between them (to_internal accepts both shapes).
+ expanded optional keys: address, pricing, hours, membership_tiers,
event_space, events, programs, services (null/empty defaults; never fabricated).
PII RULE: no email addresses in the public served set, ever — operator
emails live in audit/operator_contacts.json (internal) only.
Zero fabricated content: blank fields are fine, invented ones are not.
"""

import json
import os
import re
import sys
import unicodedata
from concurrent.futures import ThreadPoolExecutor

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(BASE, "public", "data")
AUDIT = os.path.join(BASE, "audit")

US_STATES = {
    "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "DC", "FL", "GA", "HI", "ID",
    "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS",
    "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK",
    "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV",
    "WI", "WY",
}

# ---------------------------------------------------------------------------
# Curated one-time corrections (Phase 1, 2026-10-31). All verified; see
# audit/PHASE1-REPORT.json "junk_decisions" for per-row evidence.
# ---------------------------------------------------------------------------

# id -> reason. 11 "- Closed" listings + 25 verified-junk rows.
DELETED_IDS = {
    # --- closed (name literally contains "- Closed") ---
    44: "closed", 5957: "closed", 6227: "closed", 6232: "closed",
    6269: "closed", 6357: "closed", 6758: "closed", 6983: "closed",
    7250: "closed", 7524: "closed", 7697: "closed",
    # --- verified junk (web-verified 2026-10-31, not coworking spaces) ---
    2680: "AfterSchool HQ: edtech startup (afterschoolhq.com), not coworking",
    6153: "Schoolhouse Business Center: yoga studio (schoolhouseyoga.com), not coworking",
    7748: "University Business Center (Flagstaff): business service/real estate co, not coworking",
    737: "Axios HQ: internal-comms SaaS company, not coworking",
    1466: "Crosschq: HR reference-check SaaS, not coworking",
    4365: "DentalHQ: dental membership-plan SaaS, not coworking",
    2753: "SalonHQ: salon ecommerce SaaS, not coworking",
    867: "CommonGround-AI: AI avatar software (acquired by Apple), not coworking",
    2674: "IntegrateHQ: CRM data-integration SaaS (merged into SyncMatters), not coworking",
    3194: "GrowthQ: AI career-navigation platform, not coworking",
    92: "My Office Suite: roberthalf.com staffing link; no such coworking business",
    3130: "Roam: no physical coworking venue at roam.app (physical Roam brand = meetatroam.com)",
    6005: "Us Global: scrape artifact, no business presence",
    6157: "Regus Data: scrape artifact, no business presence",
    6218: "Data Regus: scrape artifact, no business presence",
    1104: "Salon Suites: beauty salon suites, not coworking",
    1192: "Wright Note Cafe: cafe inside The Wright Village, not a coworking space",
    6966: "Opo Cafe: cafe at OPO Startups, not a coworking space",
    994: "The Gray Lab: permanently closed",
    843: "Centre Region Senior Citizens' Center: senior center, not coworking",
    935: "Roami: vacation-rental hospitality brand, not coworking",
    942: "The Workshop (Nashville): permanently closed music business, not coworking",
    81: "19Eighty Co-Working Space: permanently closed (Highland IN)",
    87: "Lifeworking Coworking: permanently closed (Lake Forest IL)",
    5437: "BlockSpaces: blockchain SaaS company, not a coworking space",
    # --- OSM-added junk caught on merge review (2026-10-31) ---
    7749: "Azofficespace: OSM junk (website is a glossary page, no venue)",
    7759: "Centre Region Senior Citizens' Center: senior center (OSM re-add of deleted 843)",
    7761: "Creative Coworking Chicago: permanently closed location (1407 W Chicago Ave)",
    7764: "Salon Suites: beauty salon (OSM re-add of deleted 1104)",
    7765: "The Gray Lab: permanently closed (OSM re-add of deleted 994)",
    7766: "WeWork Seattle: non-specific record (no website/phone/address)",
    7767: "Wright Note Cafe: cafe (OSM re-add of deleted 1192)",
}

# id -> corrected state (verified city/state mismatches; evidence in phase-1 report)
STATE_FIXES = {
    5990: "MO", 5996: "MO", 5997: "MO", 5999: "MO", 6011: "MO", 6013: "MO",  # Saint Louis
    6131: "CA",   # 1001Wilshire, Los Angeles (wilshire1001.com)
    6793: "NY",   # WeWork 135 W 41st St, New York
    5974: "NY",   # Workspace By Rockefeller Group, New York
    7129: "TX",   # Executiveworkspace Dallas (executiveworkspace.com/tx/dallas)
    7103: "IL",   # WeWork 515 N State, Chicago
    7101: "NC",   # Hygge Coworking, Charlotte NC (wearehygge.com)
    6538: "OH",   # Southwyck Business Center, Toledo OH
    6699: "FL", 6700: "FL",  # Jacksonville FL (coords + market)
    7568: "WA",   # Fernwell Executive Suites, Spokane WA
    7376: "VA",   # Hana Coworking at National Landing, Arlington VA
    7125: "MO",   # Cowork Waldo (Waldo = Kansas City MO neighborhood)
    6603: "GA",   # Cowork Columbus, Columbus GA (cowork-columbus.com)
    6710: "NY",   # Carlson Cowork, Rochester NY (carlsoncowork.com)
    6036: "MD",   # Cowork Frederick, Frederick MD (coworkfrederick.com)
}

# id -> corrected city
CITY_FIXES = {
    33: "Philadelphia",  # "The Yard - Philadelphia" (yard.com philadelphia location page)
}

# id -> (city, state): confident inference for empty-city rows; the rest are dropped.
CITY_INFER = {
    54: ("Cedar Rapids", "IA"),   # newbo.co = NewBoCo, Cedar Rapids
    76: ("Evanston", "IL"),       # Creative Coworking (Evanston/Edgewater)
    80: ("Chicago", "IL"),        # wework.com/.../515-n-state--chicago--il
    86: ("Chicago", "IL"),        # carrworkplaces.com/locations/chicago/aon-center
    88: ("Chicago", "IL"),        # Wicker Park = Chicago
    91: ("Geneva", "IL"),         # name
    96: ("Rockford", "IL"),       # eigerlab.org, Rockford
    110: ("Clayton", "MO"),       # serendipitylabs.com/us/mo/st-louis-clayton
    114: ("Metairie", "LA"),      # Ridgelake = Metairie LA
    116: ("New York", "NY"),      # the yard.com/new-york-city.../flatiron-south
    6028: ("Erie", "PA"),         # radiusco.work, Erie PA
    6032: ("Los Angeles", "CA"),  # unioncowork.com/locations/arts-district-los-angeles-ca
    6033: ("Mt Pleasant", "PA"),  # officespace.com/pa/mt-pleasant
    6036: ("Frederick", "MD"),    # coworkfrederick.com
    5987: ("Oak Brook", "IL"),    # corpoffices.com, Oak Brook
    6458: ("Denver", "CO"),       # Green Spaces, Denver
    6616: ("Atlanta", "GA"),      # peachtreeoffices.com/locations/3355-lenox
    6620: ("Gainesville", "GA"),  # name + state
    6842: ("Blue Ash", "OH"),     # name
    6847: ("Fairlawn", "OH"),     # officespace.com/oh/fairlawn
    7050: ("Portland", "OR"),     # name + centrloffice.com/.../oregon-portland-downtown
    7192: ("Las Vegas", "NV"),    # name
    7195: ("Las Vegas", "NV"),    # wework.com/.../two-summerlin--las-vegas
    7240: ("Miami", "FL"),        # pipelineworkspaces.com/locations/brickell
    7246: ("Miami", "FL"),        # coworker.com/.../florida/miami/360spaces-lr
    7253: ("Tampa", "FL"),        # name
    7265: ("Brandon", "FL"),      # name
    7283: ("Boca Raton", "FL"),   # name
    7287: ("Weston", "FL"),       # name
    7291: ("Miami", "FL"),        # converge-miami
    7295: ("Ocala", "FL"),        # ocalacep.com (Ocala CEP)
    7300: ("Winter Park", "FL"),  # name
    7301: ("Orlando", "FL"),      # espaces.com/locations/orlando-office-space
}

# id -> state: confident inference for empty-state rows
STATE_INFER = {
    818: "WA", 821: "NY", 824: "WA", 830: "GA", 831: "MI", 832: "CA",
    840: "CA", 844: "MO", 846: "WI", 855: "CA", 905: "WI", 954: "CA",
    1136: "OK", 1151: "CA", 1153: "CA", 1156: "GA", 1160: "CA",
}

# city -> state for OSM records that have a city but no state (same confident map)
OSM_STATE_INFER = {
    "Seattle": "WA", "Brooklyn": "NY", "Atlanta": "GA", "Detroit": "MI",
    "San Francisco": "CA", "Oakland": "CA", "Kansas City": "MO",
    "Milwaukee": "WI", "Nashville": "TN", "Culver City": "CA",
    "Broken Arrow": "OK", "Fort Collins": "CO",
}

# normalized "name|city" keys of deleted junk/closed rows: never re-admit via OSM merge
DELETED_OSM_KEYS = {
    "afterschool hq|fishers",
    "schoolhouse business center|houston",
    "university business center|flagstaff",
    "axios hq|new york",
    "crosschq|santa monica",
    "dentalhq|kansas city",
    "salonhq|san francisco",
    "commonground ai|los altos",
    "integratehq|austin",
    "growthq|oakland",
    "my office suite|",
    "roam|los angeles",
    "us global|northbrook",
    "regus data|pikesville",
    "data regus|windsor",
    "salon suites|burton",
    "wright note cafe|raleigh",
    "opo cafe|saint charles",
    "the gray lab|salem",
    "centre region senior citizens center|state college",
    "roami|miami",
    "the workshop|nashville",
    "19eighty co working space|",
    "lifeworking coworking|",
    "blockspaces|",
    "azofficespace|phoenix",
    "creative coworking|chicago",
    "wework|seattle",
}

# slug -> corrected URL for dead websites of recognizable brands (verified 2026-10-31)
URL_FIXES = {
    # The Yard restructured location URLs (old /locations/... 404s)
    "the-yard-brooklyn": "https://theyard.com/greenpoint-coworking/",
    # Quest Workspaces renamed the 777 Brickell page (old .../miami-777-brickell2 404s)
    "quest-workspaces-777-brickell-ave-doral": "https://questworkspaces.com/miami-777-brickell",
    # Roam restructured to /locations-overview/ (old /locations/buckhead 404s);
    # record phone 404-465-3485 = Buckhead-Piedmont (3365 Piedmont Rd NE)
    "roam-buckhead-atlanta": "https://meetatroam.com/locations-overview/atlanta/buckhead-piedmont/",
    # Shift Workspaces: old findworkspaces.com marketplace link 404s -> brand site
    "shift-workspaces-bannock-denver": "https://shiftworkspaces.com/locations/bannock/",
}

# ---------------------------------------------------------------------------
# Brand pricing (researched 2026-10-31; numbers in USD; source="brand").
# Applied to served records whose name starts with the brand prefix
# (case-insensitive, word-boundary). These are brand-level STARTING/base rates;
# the site UI labels them "Starting at" with a "confirm with location" note.
# Where a brand publishes no usable pricing, the pricing object is left null
# (site shows an honest "pricing not listed" state).
# ---------------------------------------------------------------------------
BRAND_PRICING = [
    {
        "brand": "WeWork",
        "prefixes": ["wework"],
        "pricing": {"day_pass": 39, "hot_desk_monthly": 350,
                    "dedicated_desk_monthly": None,
                    "private_office_monthly": 1000, "meeting_room_hourly": None},
        "source_url": "https://www.nucamp.co/blog/top-10-tech-coworking-spaces-and-incubators-in-bellevue-wa-in-2026",
        "retrieved": "2026-10-31",
        "notes": "Day pass $39 and hot desk ~$350/mo (Bellevue, nucamp 2026); "
                 "private office past $1,000/person/mo in major markets "
                 "(alliancevirtualoffices 2026). Location-specific rates vary; "
                 "dedicated-desk pricing not published online.",
    },
    {
        "brand": "Regus",
        "prefixes": ["regus"],
        "pricing": {"day_pass": 49, "hot_desk_monthly": 330,
                    "dedicated_desk_monthly": None,
                    "private_office_monthly": 600, "meeting_room_hourly": None},
        "source_url": "https://2727coworking.com/articles/regus-alternatives-montreal-coworking-virtual-office",
        "retrieved": "2026-10-31",
        "notes": "Day pass ~$49, 30-day access plan ~$330/mo (Montreal, 2727 Coworking "
                 "2026); desk memberships $300-400/mo and small private offices from "
                 "~$600/mo (Bellevue, nucamp 2026). Flat monthly hot-desk rate not published.",
    },
    {
        "brand": "Spaces",
        "prefixes": ["spaces"],
        "pricing": None,
        "source_url": "https://2727coworking.com/articles/pdfs/hot-desk-cost-per-month-montreal-ae713b02025e5ca8.pdf",
        "retrieved": "2026-10-31",
        "notes": "Spaces (IWG) prices per-day, not monthly: dedicated desks from "
                 "~$8/person/day, individual offices ~$11/person/day (Montreal, "
                 "spacesworks.com 2026). No flat monthly rate published; pricing null.",
    },
    {
        "brand": "HQ",
        "prefixes": ["hq"],
        "pricing": {"day_pass": 45, "hot_desk_monthly": 309,
                    "dedicated_desk_monthly": None,
                    "private_office_monthly": 650, "meeting_room_hourly": None},
        "source_url": "https://workin.space/en/coworking/united-states/west-virginia/triadelphia-wv",
        "retrieved": "2026-10-31",
        "notes": "Thin US published data; figures from workin.space aggregator for "
                 "HQ Triadelphia WV: day pass $45, coworking from $309/mo, private "
                 "office from $650/mo.",
    },
    {
        "brand": "Industrious",
        "prefixes": ["industrious"],
        "pricing": {"day_pass": 60, "hot_desk_monthly": 399,
                    "dedicated_desk_monthly": None,
                    "private_office_monthly": 1100, "meeting_room_hourly": None},
        "source_url": "https://www.nucamp.co/blog/top-10-tech-coworking-spaces-and-incubators-in-washington-dc-in-2026",
        "retrieved": "2026-10-31",
        "notes": "Coworking from $399/mo, day passes $60-68, private offices from "
                 "~$1,100/mo (DC/Durham/Charlotte, nucamp 2026); community memberships "
                 "$419-918/mo by market (alliancevirtualoffices 2026).",
    },
    {
        "brand": "Office Evolution",
        "prefixes": ["office evolution"],
        "pricing": {"day_pass": 30, "hot_desk_monthly": 99,
                    "dedicated_desk_monthly": 400,
                    "private_office_monthly": 500, "meeting_room_hourly": 30},
        "source_url": "https://www.officeevolution.com/locations/usa/colorado/broomfield/?agency=215_marketing",
        "retrieved": "2026-10-31",
        "notes": "Brand site (officeevolution.com): Day Pass from $30/day, Coworking "
                 "Plan from $99/mo, Dedicated Desks from $400/mo, Dedicated Offices "
                 "from $500/mo, Meeting Rooms from $30/hr. Rates vary by franchise location.",
    },
    {
        "brand": "Venture X",
        "prefixes": ["venture x"],
        "pricing": {"day_pass": 25, "hot_desk_monthly": 99,
                    "dedicated_desk_monthly": 349,
                    "private_office_monthly": 865, "meeting_room_hourly": None},
        "source_url": "https://venturex.com/blog/education/how-to-calculate-your-true-office-space-costs-a-business-owners-guide/",
        "retrieved": "2026-10-31",
        "notes": "Venture X blog: memberships from $99/mo, day passes from $25/day. "
                 "Location pages: dedicated desks from $349 (Orlando), private offices "
                 "from $865 (Atlanta Cumberland). Varies by franchise.",
    },
    {
        "brand": "Serendipity Labs",
        "prefixes": ["serendipity labs"],
        "pricing": {"day_pass": None, "hot_desk_monthly": 179,
                    "dedicated_desk_monthly": 249,
                    "private_office_monthly": 529, "meeting_room_hourly": None},
        "source_url": "https://liquidspace.com/us/ga/atlanta/serendipity-labs-atlanta-buckhead",
        "retrieved": "2026-10-31",
        "notes": "Unlimited coworking monthly pass from $179 (Atlanta Buckhead, "
                 "liquidspace); dedicated desks from $249/desk/mo, private offices "
                 "from $529/office/mo (serendipitylabs.com Alpharetta). Day offices "
                 "$59/day (Buckhead) - not a coworking day pass.",
    },
    {
        "brand": "Expansive",
        "prefixes": ["expansive"],
        "pricing": {"day_pass": 33, "hot_desk_monthly": 149,
                    "dedicated_desk_monthly": 250,
                    "private_office_monthly": 527, "meeting_room_hourly": 40},
        "source_url": "https://expansive.com/what-is-coworking/",
        "retrieved": "2026-10-31",
        "notes": "expansive.com: coworking from $149/mo (up to $199 some locations). "
                 "Listings: day pass from $33, dedicated desks from $250 "
                 "(Wauwatosa), private offices from $527 (Wauwatosa), meeting rooms "
                 "from $40/hr (Charlotte). Wide market variance.",
    },
    {
        "brand": "Carr Workplaces",
        "prefixes": ["carr workplaces"],
        "pricing": {"day_pass": None, "hot_desk_monthly": 249,
                    "dedicated_desk_monthly": 550,
                    "private_office_monthly": 1800, "meeting_room_hourly": None},
        "source_url": "https://liquidspace.com/us/dc/washington/carr-workplaces-georgetown/office-216-copy",
        "retrieved": "2026-10-31",
        "notes": "LiquidSpace listings: Coworking Home Base from $249/mo, Dedicated "
                 "desk $550/mo, 1-person executive office from $1,800/mo (Chevy "
                 "Chase). Private offices vary widely by market.",
    },
    {
        "brand": "The Yard",
        "prefixes": ["the yard"],
        "pricing": {"day_pass": 30, "hot_desk_monthly": 425,
                    "dedicated_desk_monthly": 420,
                    "private_office_monthly": 650, "meeting_room_hourly": 48},
        "source_url": "https://www.commercialsearch.com/coworking-property/us/ny/new-york/the-yard-columbus-circle/",
        "retrieved": "2026-10-31",
        "notes": "Columbus Circle listing: day pass from $30, coworking membership "
                 "from $425/mo, meeting room from $48/hr. Gowanus (liquidspace): "
                 "dedicated desk $420/mo, 1-person private office from $650/mo.",
    },
    {
        "brand": "Kiln",
        "prefixes": ["kiln"],
        "pricing": {"day_pass": None, "hot_desk_monthly": 275,
                    "dedicated_desk_monthly": 525,
                    "private_office_monthly": 1200, "meeting_room_hourly": None},
        "source_url": "https://kiln.com/communities/holladay/",
        "retrieved": "2026-10-31",
        "notes": "kiln.com: Club (shared desk) from $275/mo (Daybreak standard rate; "
                 "founding $99/mo is promotional), Resident dedicated desk from "
                 "$525/mo (Holladay), private offices from $1,200/mo (Holladay). "
                 "Rates vary widely by location; day passes sold per location.",
    },
    {
        "brand": "Convene",
        "prefixes": ["convene"],
        "pricing": None,
        "source_url": None,
        "retrieved": "2026-10-31",
        "notes": "Convene publishes no public membership pricing; meeting/event "
                 "rates quoted on request. Pricing null.",
    },
    {
        "brand": "Bond Collective",
        "prefixes": ["bond collective"],
        "pricing": {"day_pass": 35, "hot_desk_monthly": 300,
                    "dedicated_desk_monthly": 500,
                    "private_office_monthly": 700, "meeting_room_hourly": 50},
        "source_url": "https://bondcollective.com/locations/market-street",
        "retrieved": "2026-10-31",
        "notes": "bondcollective.com Market Street: day passes from $35/day, "
                 "coworking from $300/mo, dedicated desks from $500/mo, private "
                 "offices from $700/mo, conference rooms from $50-55/hr.",
    },
    {
        "brand": "Workbar",
        "prefixes": ["workbar"],
        "pricing": {"day_pass": None, "hot_desk_monthly": 349,
                    "dedicated_desk_monthly": 499,
                    "private_office_monthly": 399, "meeting_room_hourly": None},
        "source_url": "https://www.workbar.com/coworking",
        "retrieved": "2026-10-31",
        "notes": "workbar.com: Unlimited $349-499/mo, Dedicated Desk $499-699/mo, "
                 "Private Office starting $399/desk/mo; Hybrid part-time plan "
                 "$199-279/mo. Boston-area network; day passes not published.",
    },
    {
        "brand": "Pipeline Workspaces",
        "prefixes": ["pipeline"],
        "pricing": {"day_pass": 50, "hot_desk_monthly": 199,
                    "dedicated_desk_monthly": None,
                    "private_office_monthly": None, "meeting_room_hourly": 75},
        "source_url": "https://www.nucamp.co/blog/top-10-tech-coworking-spaces-and-incubators-in-fort-lauderdale-fl-in-2026",
        "retrieved": "2026-10-31",
        "notes": "Day passes from $50, monthly coworking from ~$199 (Fort "
                 "Lauderdale, nucamp 2026); meeting rooms from $75/hr (Doral, "
                 "commercialsearch). Florida-focused network.",
    },
    {
        "brand": "Novel Coworking",
        "prefixes": ["novel coworking"],
        "pricing": {"day_pass": None, "hot_desk_monthly": 179,
                    "dedicated_desk_monthly": 299,
                    "private_office_monthly": 629, "meeting_room_hourly": None},
        "source_url": "https://workmobile.today/properties/novel-coworking-golden-triangle-pittsburgh/",
        "retrieved": "2026-10-31",
        "notes": "Pittsburgh rate card: coworking from $179/mo, dedicated desks "
                 "from $299/mo, private offices (1-2 person) from $629/mo. "
                 "Advertises under WeWork/Regus pricing.",
    },
    {
        "brand": "CommonGrounds",
        "prefixes": ["commongrounds"],
        "pricing": {"day_pass": None, "hot_desk_monthly": 250,
                    "dedicated_desk_monthly": 475,
                    "private_office_monthly": 800, "meeting_room_hourly": None},
        "source_url": "https://liquidspace.com/us/ca/carlsbad/commongrounds-workplace-carlsbad/event-space-1",
        "retrieved": "2026-10-31",
        "notes": "Carlsbad HQ (liquidspace): Communal $250/mo, Dedicated desk "
                 "$475/mo; private offices from $800/mo (commercialsearch). "
                 "Enterprise-focused network.",
    },
    {
        "brand": "Hera Hub",
        "prefixes": ["hera hub"],
        "pricing": {"day_pass": None, "hot_desk_monthly": 199,
                    "dedicated_desk_monthly": None,
                    "private_office_monthly": None, "meeting_room_hourly": 35},
        "source_url": "https://herahub.com/chicago/membership/",
        "retrieved": "2026-10-31",
        "notes": "Women-focused licensing network; pricing varies by location. "
                 "Chicago: coworking membership $199/mo. DC (Oct 2026 pricing PDF): "
                 "membership $99-149/mo + workspace add-ons; non-member meeting "
                 "room $35/hr. Membership + add-on model.",
    },
    {
        "brand": "Mindspace",
        "prefixes": ["mindspace"],
        "pricing": {"day_pass": 42, "hot_desk_monthly": 229,
                    "dedicated_desk_monthly": 450,
                    "private_office_monthly": 770, "meeting_room_hourly": 60},
        "source_url": "https://www.mindspace.me/blog/the-best-areas-in-miami-for-your-next-flex-office-location/",
        "retrieved": "2026-10-31",
        "notes": "mindspace.me: day pass from $42 (SF) / $60 (Miami/NYC), coworking "
                 "from $229/mo (Miami), meeting rooms from $60/hr (Miami). "
                 "Dedicated desk $450 (DC K St, liquidspace); private office from "
                 "$770 (DC, devx). Wide market variance.",
    },
]

# Expanded-schema defaults (never fabricate: null/empty unless sourced)
SCHEMA_FIELDS = ["address", "pricing", "hours", "membership_tiers",
                 "event_space", "events", "programs", "services"]
SERVICE_VOCAB = ["mail_handling", "virtual_office", "event_hosting",
                 "meeting_rooms", "phone_booth", "wellness", "childcare",
                 "podcast_studio"]
PROGRAM_TYPES = ["workshop", "course", "accelerator", "open_studio", "class"]

# Brand-level PROGRAMS, researched 2026-11-01. Only entries grounded in a
# verifiable public source are listed here; everything else stays [].
# Each entry: prefixes (name-match, same rule as BRAND_PRICING), program dict,
# and evidence (source_url + notes) recorded for the report.
BRAND_PROGRAMS = [
    {
        "brand": "Kiln",
        "prefixes": ["kiln"],
        "program": {
            "title": "Member Events & Community Programming",
            "type": "workshop",
            "schedule": "Weekly",
            "price": "Members only",
            "url": "https://kiln.com/member-events/",
            "source": "brand",
        },
        "source_url": "https://kiln.com/member-events/",
        "retrieved": "2026-11-01",
        "notes": ("Kiln's 'Member Events and Community Programming' page; "
                  "each Kiln location plans weekly events (yoga, presentations, "
                  "screenings, 3D-printing workshops, Waffle Wednesday); "
                  "events are exclusive to current Kiln members."),
    },
]
# Brands researched for programs with no verifiable named program found
# (kept [] rather than fabricated): Workbar (generic 'Events and Workshops'
# mention only, no named program page), Industrious, Convene, Serendipity Labs,
# The Yard, Expansive, Hera Hub (accelerator positioning verified but zero
# Hera Hub locations in the served set).


def blank_expanded_schema(r):
    """Attach the expanded optional schema with honest empty defaults.
    Idempotent: never overwrites values already present (re-runs preserve
    operator-merged data and previously derived addresses)."""
    if "address" not in r:
        street = (r.get("street") or "").strip()
        if street:
            r["address"] = "%s, %s, %s" % (street, r.get("c", ""), r.get("st", ""))
        else:
            r["address"] = ""
    r.setdefault("pricing", None)
    r.setdefault("hours", {"access": None, "staffed": None})
    r.setdefault("membership_tiers", [])
    r.setdefault("event_space", {"available": False, "capacity": None,
                                 "description": ""})
    r.setdefault("events", [])
    r.setdefault("programs", [])
    r.setdefault("services", [])
    return r


def brand_for_name(name):
    """Return the BRAND_PRICING entry whose prefix starts the listing name
    (case-insensitive, word-boundary), or None."""
    low = (name or "").lower()
    for b in BRAND_PRICING:
        for p in b["prefixes"]:
            if low == p or low.startswith(p + " ") or low.startswith(p + "-"):
                return b
    return None


def apply_brand_pricing(records):
    """Attach brand-level pricing to records whose name matches a researched
    brand. Idempotent: recomputed from scratch every run. Internal pricing
    shape is exactly the 6 public keys (provenance lives in BRAND_PRICING)."""
    priced = 0
    for r in records:
        b = brand_for_name(r.get("n"))
        if b and b.get("pricing"):
            r["pricing"] = {
                "day_pass": b["pricing"].get("day_pass"),
                "hot_desk_monthly": b["pricing"].get("hot_desk_monthly"),
                "dedicated_desk_monthly": b["pricing"].get("dedicated_desk_monthly"),
                "private_office_monthly": b["pricing"].get("private_office_monthly"),
                "meeting_room_hourly": b["pricing"].get("meeting_room_hourly"),
                "source": "brand",
            }
            priced += 1
    return priced


def apply_brand_programs(records):
    """Attach brand-level programs (BRAND_PROGRAMS, each grounded in a
    verifiable public source) to records whose name matches. Idempotent:
    recomputed from scratch every run. Everything else stays []."""
    applied = 0
    for r in records:
        low = (r.get("n") or "").lower()
        for b in BRAND_PROGRAMS:
            if any(low == p or low.startswith(p + " ") or low.startswith(p + "-")
                   for p in b["prefixes"]):
                r["programs"] = [dict(b["program"])]
                applied += 1
                break
    return applied


def merge_operator_pricing(records):
    """Merge public/data/operator_pricing.json if present: object keyed by slug;
    each value is a partial pricing/hours/services/event_space object with the
    source forced to 'operator'. Written by the claim-your-listing flow."""
    path = os.path.join(DATA, "operator_pricing.json")
    op = load_json(path, {}) or {}
    if not op:
        return 0, False
    by_slug = {r.get("slug"): r for r in records}
    merged = 0
    for slug, val in op.items():
        r = by_slug.get(slug)
        if not r or not isinstance(val, dict):
            continue
        changed = False
        if isinstance(val.get("pricing"), dict):
            if not isinstance(r.get("pricing"), dict):
                r["pricing"] = {"day_pass": None, "hot_desk_monthly": None,
                                "dedicated_desk_monthly": None,
                                "private_office_monthly": None,
                                "meeting_room_hourly": None}
            for k, v in val["pricing"].items():
                if k in ("day_pass", "hot_desk_monthly", "dedicated_desk_monthly",
                         "private_office_monthly", "meeting_room_hourly") \
                        and v is not None:
                    r["pricing"][k] = v
            r["pricing"]["source"] = "operator"
            changed = True
        if isinstance(val.get("hours"), dict):
            r["hours"].update({k: val["hours"][k] for k in
                               ("access", "staffed") if k in val["hours"]})
            changed = True
        if isinstance(val.get("membership_tiers"), list):
            r["membership_tiers"] = [t for t in val["membership_tiers"]
                                     if isinstance(t, str)]
            changed = True
        if isinstance(val.get("event_space"), dict):
            es = r["event_space"]
            if "available" in val["event_space"]:
                es["available"] = bool(val["event_space"]["available"])
            if val["event_space"].get("capacity") is not None:
                es["capacity"] = val["event_space"]["capacity"]
            if val["event_space"].get("description"):
                es["description"] = val["event_space"]["description"]
            changed = True
        if isinstance(val.get("services"), list):
            r["services"] = [s for s in val["services"] if s in SERVICE_VOCAB]
            changed = True
        if isinstance(val.get("events"), list):
            evs = []
            for e in val["events"]:
                if isinstance(e, dict) and e.get("title"):
                    evs.append({"title": e.get("title", ""),
                                "date": e.get("date"),
                                "url": e.get("url"),
                                "source": e.get("source", "operator")})
            r["events"] = evs
            changed = True
        if isinstance(val.get("programs"), list):
            progs = []
            for p in val["programs"]:
                if (isinstance(p, dict) and p.get("title")
                        and p.get("type") in PROGRAM_TYPES):
                    progs.append({"title": p.get("title", ""),
                                  "type": p.get("type"),
                                  "schedule": p.get("schedule"),
                                  "price": p.get("price"),
                                  "url": p.get("url"),
                                  "source": p.get("source", "operator")})
            r["programs"] = progs
            changed = True
        if changed:
            merged += 1
    return merged, True

# US geographic-center fallback stamp used by the old build (rural Kansas) — never real.
FALLBACK_COORD = (39.8283, -98.5795)


# ---------------------------------------------------------------------------
# helpers
# ---------------------------------------------------------------------------

def load_json(path, default=None):
    if not os.path.exists(path):
        return default
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def save_json(path, obj):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(obj, f, indent=1, ensure_ascii=False)
        f.write("\n")


def slugify(s):
    s = unicodedata.normalize("NFKD", s or "").encode("ascii", "ignore").decode()
    s = re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")
    return s or "space"


def norm_name(s):
    """Normalization for dedupe/matching: lowercase, strip punctuation and
    corporate suffixes / suite noise."""
    s = (s or "").lower()
    s = re.sub(r"\b(llc|inc|co|corp|ltd|pllc|pa|lp|llp)\b\.?", " ", s)
    s = re.sub(r"[^a-z0-9 ]", " ", s)
    return re.sub(r"\s+", " ", s).strip()


def valid_phone(p):
    """US phone: strip non-digits; accept 10 digits or 11 starting with 1.
    Returns E.164-ish '+1XXXXXXXXXX' or ''."""
    d = re.sub(r"\D", "", p or "")
    if len(d) == 11 and d.startswith("1"):
        return "+1" + d[1:]
    if len(d) == 10:
        return "+1" + d
    return ""


def make_slug(name, city, taken):
    base = slugify(name) + "-" + slugify(city)
    slug = base
    i = 2
    while slug in taken:
        slug = "%s-%d" % (base, i)
        i += 1
    taken.add(slug)
    return slug


# ---------------------------------------------------------------------------
# shape mapping: the pipeline works on the internal (legacy-minified) record
# shape; the public served JSON uses the master-backend full names EXACTLY.
# to_internal accepts BOTH shapes (old minified and new full) so re-runs are
# idempotent no matter which shape directory.json currently has.
# ---------------------------------------------------------------------------

def to_internal(rec):
    """Map a served record (either shape) to the internal pipeline shape."""
    r = dict(rec)
    out = {}
    out["id"] = r.get("id")
    out["n"] = r.get("n") or r.get("name") or ""
    out["c"] = r.get("c") or r.get("city") or ""
    out["st"] = r.get("st") or r.get("state") or ""
    out["w"] = r.get("w") or r.get("website") or ""
    out["d"] = r.get("d") if r.get("d") is not None else (r.get("description") or "")
    out["a"] = r.get("a") if r.get("a") is not None else (r.get("amenities") or [])
    out["lat"] = r.get("lat") if r.get("lat") is not None else r.get("latitude")
    out["lng"] = r.get("lng") if r.get("lng") is not None else r.get("longitude")
    out["slug"] = r.get("slug") or ""
    out["phone"] = r.get("phone") or ""
    out["street"] = r.get("street") or ""
    # featured: bool internally; featured.json merge sets it (step 10)
    if isinstance(r.get("featured"), bool):
        out["featured"] = r["featured"]
    else:
        out["featured"] = (r.get("featured_tier") == "featured")
    out["address"] = r.get("address") or ""
    out["pricing"] = r.get("pricing") if isinstance(r.get("pricing"), dict) else None
    out["hours"] = r.get("hours") if isinstance(r.get("hours"), dict) else None
    out["membership_tiers"] = r.get("membership_tiers") or []
    out["event_space"] = r.get("event_space") if isinstance(r.get("event_space"), dict) else None
    out["events"] = r.get("events") or []
    out["programs"] = r.get("programs") or []
    out["services"] = r.get("services") or []
    return out


def to_public(r):
    """Emit the exact master-backend served shape (full names; no minified
    keys). PII RULE: email is ALWAYS null in the public set."""
    pricing = r.get("pricing")
    if isinstance(pricing, dict):
        pricing = {
            "day_pass": pricing.get("day_pass"),
            "hot_desk_monthly": pricing.get("hot_desk_monthly"),
            "dedicated_desk_monthly": pricing.get("dedicated_desk_monthly"),
            "private_office_monthly": pricing.get("private_office_monthly"),
            "meeting_room_hourly": pricing.get("meeting_room_hourly"),
            "source": pricing.get("source"),
        }
    else:
        pricing = None
    return {
        "id": r.get("id"),
        "name": r.get("n") or "",
        "city": r.get("c") or "",
        "state": r.get("st") or "",
        "website": r.get("w") or "",
        "description": r.get("d") or "",
        "amenities": r.get("a") or [],
        "latitude": r.get("lat"),
        "longitude": r.get("lng"),
        "slug": r.get("slug") or "",
        "phone": r.get("phone") or "",
        "email": None,
        "featured_tier": "featured" if r.get("featured") else "none",
        "address": r.get("address") or None,
        "pricing": pricing,
        "hours": r.get("hours") if isinstance(r.get("hours"), dict) else {"access": None, "staffed": None},
        "membership_tiers": r.get("membership_tiers") or [],
        "event_space": r.get("event_space") if isinstance(r.get("event_space"), dict)
        else {"available": False, "capacity": None, "description": ""},
        "events": r.get("events") or [],
        "programs": r.get("programs") or [],
        "services": r.get("services") or [],
    }


# ---------------------------------------------------------------------------
# default pipeline: full validate + emit
# ---------------------------------------------------------------------------

def run_default():
    counts = {}
    records = [to_internal(r) for r in
               load_json(os.path.join(DATA, "directory.json"), [])]
    counts["listings_before"] = len(records)

    # 1. curated deletes (closed + verified junk)
    records = [r for r in records if r.get("id") not in DELETED_IDS]
    counts["closed_removed"] = sum(1 for k, v in DELETED_IDS.items() if v == "closed")
    counts["junk_removed"] = len(DELETED_IDS) - counts["closed_removed"]

    # 2. curated city/state corrections
    fixed_state = fixed_city = 0
    for r in records:
        rid = r.get("id")
        if rid in STATE_FIXES and r.get("st") != STATE_FIXES[rid]:
            r["st"] = STATE_FIXES[rid]
            fixed_state += 1
        if rid in CITY_FIXES and r.get("c") != CITY_FIXES[rid]:
            r["c"] = CITY_FIXES[rid]
            fixed_city += 1
    counts["city_state_fixed"] = fixed_state
    counts["city_fixed"] = fixed_city

    # 3. empty city/state: confident inference, else drop
    inferred = dropped = 0
    kept = []
    for r in records:
        rid = r.get("id")
        c = (r.get("c") or "").strip()
        st = (r.get("st") or "").strip()
        if not c and rid in CITY_INFER:
            r["c"], r["st"] = CITY_INFER[rid]
            inferred += 1
        elif not st and rid in STATE_INFER:
            r["st"] = STATE_INFER[rid]
            inferred += 1
        if not (r.get("c") or "").strip() or not (r.get("st") or "").strip():
            dropped += 1
            continue
        kept.append(r)
    records = kept
    counts["empty_inferred"] = inferred
    counts["empty_dropped"] = dropped

    # 4. gate: valid US state code
    before = len(records)
    records = [r for r in records if (r.get("st") or "").strip().upper() in US_STATES]
    for r in records:
        r["st"] = r["st"].strip().upper()
    counts["invalid_state_dropped"] = before - len(records)

    # 5. dedupe on normalized (name + city); keep lowest id
    seen = {}
    dupes = 0
    for r in sorted(records, key=lambda x: x.get("id", 0)):
        k = norm_name(r.get("n")) + "|" + norm_name(r.get("c"))
        if k in seen:
            dupes += 1
            continue
        seen[k] = r
    records = list(seen.values())
    counts["dupes_dropped"] = dupes

    # 6. descriptions: blank fabricated templates and cross-wired / scrape garbage.
    #    Keep only descriptions that are honest and city-correct: the listing's own
    #    city name must appear in the description text. When in doubt, blank.
    blanked = 0
    for r in records:
        d = (r.get("d") or "").strip()
        city = (r.get("c") or "").strip()
        if not d:
            continue
        if ("designed to elevate your productivity" in d
                or "foster meaningful connections" in d
                or city.lower() not in d.lower()):
            r["d"] = ""
            blanked += 1
    counts["descriptions_blanked"] = blanked

    # 7. amenities: the old build injected universal Wi-Fi/Coffee & Tea/Meeting Rooms
    #    (+Printing) defaults for every listing — fabricated. Strip to sparse truth.
    stripped = sum(1 for r in records if r.get("a"))
    for r in records:
        r["a"] = []
    counts["amenities_stripped"] = stripped

    # 8. coords: null the US-center fallback stamp and coords shared across cities
    nulled_fb = 0
    for r in records:
        lat, lng = r.get("lat"), r.get("lng")
        if (lat is not None and abs(lat - FALLBACK_COORD[0]) < 1e-6
                and abs(lng - FALLBACK_COORD[1]) < 1e-6):
            r["lat"] = r["lng"] = None
            nulled_fb += 1
    counts["fallback_coords_nulled"] = nulled_fb

    by_coord = {}
    for r in records:
        if r.get("lat") is not None:
            by_coord.setdefault((round(r["lat"], 4), round(r["lng"], 4)), set()).add(r["c"])
    bad_coords = {k for k, v in by_coord.items() if len(v) > 1}
    nulled_cc = 0
    for r in records:
        if r.get("lat") is not None and (round(r["lat"], 4), round(r["lng"], 4)) in bad_coords:
            r["lat"] = r["lng"] = None
            nulled_cc += 1
    counts["crosscity_coords_nulled"] = nulled_cc

    # 8b. PII rule: strip any email addresses from served records (public set).
    # Operator emails live in audit/operator_contacts.json only.
    for r in records:
        r.pop("email", None)

    # 9. phone: validate; restore from the quarantined-CSV sidecar map
    phone_map = load_json(os.path.join(AUDIT, "phone_restore_map.json"), {}) or {}
    restored = 0
    for r in records:
        ph = valid_phone(r.get("phone", ""))
        if not ph:
            ph = phone_map.get("phones", {}).get(str(r.get("id")), "")
            if ph:
                restored += 1
        r["phone"] = ph
    counts["phones_restored"] = restored

    # 10. featured merge
    featured = load_json(os.path.join(DATA, "featured.json"), {}) or {}
    for r in records:
        r["featured"] = bool(featured.get(r.get("slug", "")) in ("featured", "premium"))

    # 11. slug: deterministic from name+city; stable across re-runs
    taken = set()
    for r in sorted(records, key=lambda x: x.get("id", 0)):
        want = slugify(r.get("n")) + "-" + slugify(r.get("c"))
        if r.get("slug") and r["slug"] in taken:
            r["slug"] = None  # collision with an earlier record; regenerate
        if not r.get("slug") or not r["slug"].startswith(want):
            r["slug"] = make_slug(r.get("n"), r.get("c"), taken)
        else:
            taken.add(r["slug"])

    # 12. merge OSM venues (real coords; best source). Idempotent via dedupe.
    osm = load_json(os.path.join(DATA, "osm_coworking.json"), []) or []
    served_keys = {norm_name(r.get("n")) + "|" + norm_name(r.get("c")) for r in records}
    next_id = max([r.get("id", 0) for r in records] or [0]) + 1
    added = dupes_o = invalid_o = 0
    new_records = []
    for v in sorted(osm, key=lambda x: (x.get("name") or "", x.get("city") or "")):
        name = (v.get("name") or "").strip()
        city = (v.get("city") or "").strip()
        st = (v.get("state") or "").strip().upper()
        if not st and city in OSM_STATE_INFER:
            st = OSM_STATE_INFER[city]
            counts["osm_state_inferred"] = counts.get("osm_state_inferred", 0) + 1
        if not name or not city or st not in US_STATES:
            invalid_o += 1
            continue
        if norm_name(name) + "|" + norm_name(city) in DELETED_OSM_KEYS:
            invalid_o += 1  # verified junk/closed: never re-admit
            continue
        k = norm_name(name) + "|" + norm_name(city)
        if k in served_keys:
            dupes_o += 1
            continue
        served_keys.add(k)
        rec = {
            "id": next_id,
            "n": name,
            "c": city,
            "st": st,
            "w": (v.get("website") or "").strip(),
            "d": "",  # never fabricate
            "a": [],
            "ct": 0,
            "lat": v.get("lat"),
            "lng": v.get("lon"),
            "phone": valid_phone(v.get("phone", "")),
            "featured": False,
        }
        if v.get("street"):
            rec["street"] = v["street"]
        # NOTE: OSM email is NEVER written to the public served set (PII rule);
        # operator emails live in audit/operator_contacts.json only.
        rec["slug"] = make_slug(name, city, taken)
        next_id += 1
        added += 1
        new_records.append(rec)
    records.extend(new_records)
    counts["osm_validated"] = len(osm)
    counts["osm_added"] = added
    counts["osm_dupes"] = dupes_o
    counts["osm_invalid"] = invalid_o

    # 13. featured merge for OSM-added records too
    for r in new_records:
        r["featured"] = bool(featured.get(r.get("slug", "")) in ("featured", "premium"))

    # 13b. expanded schema: address, pricing, hours, membership_tiers,
    #      event_space, events, services (honest empty defaults; never fabricated)
    for r in records:
        blank_expanded_schema(r)

    # 13c. brand pricing (researched 2026-10-31; source="brand")
    counts["brand_locations_priced"] = apply_brand_pricing(records)

    # 13c2. brand programs (researched 2026-11-01; source="brand"; [] default)
    counts["brand_locations_programmed"] = apply_brand_programs(records)

    # 13d. operator pricing merge (claim-your-listing flow; source="operator")
    merged, present = merge_operator_pricing(records)
    counts["operator_pricing_merged"] = merged
    counts["operator_merge_supported"] = True
    counts["operator_pricing_file_present"] = present

    # 14. emit (sorted by id) + stats. Public shape uses master-backend names.
    records.sort(key=lambda x: x.get("id", 0))
    stats = build_stats(records)
    save_json(os.path.join(DATA, "directory.json"),
              [to_public(r) for r in records])
    save_json(os.path.join(DATA, "stats.json"), stats)
    counts["listings_after"] = len(records)
    return counts


def build_stats(records):
    from collections import Counter
    states = Counter(r["st"] for r in records if r.get("st"))
    cities = Counter(r["c"] for r in records if r.get("c"))
    return {
        "totalSpaces": len(records),
        "totalCities": len(cities),
        "topStates": dict(states.most_common()),
        "topCities": [{"city": c, "count": n} for c, n in cities.most_common(20)],
    }


# ---------------------------------------------------------------------------
# --recheck: website validation
# ---------------------------------------------------------------------------

def check_url(url, timeout=10):
    """GET with redirect-following; 1 retry. Returns (alive, final_url, status)."""
    try:
        import requests
    except ImportError:
        import urllib.request
        return _check_url_urllib(url, timeout)
    headers = {"User-Agent": "Mozilla/5.0 (huddleco data-QA; contact: ops@huddleco.work)"}
    last = None
    for _ in range(2):
        try:
            resp = requests.get(url, headers=headers, timeout=timeout, allow_redirects=True)
            if resp.status_code < 400:
                return True, resp.url, resp.status_code
            last = ("dead", resp.url, resp.status_code)
            break  # 4xx/5xx: no point retrying
        except Exception as e:  # DNS, connect timeout, TLS, etc.
            last = ("dead", url, type(e).__name__)
    return False, last[1], last[2]


def _check_url_urllib(url, timeout):
    import urllib.request
    import urllib.error
    headers = {"User-Agent": "Mozilla/5.0 (huddleco data-QA)"}
    for _ in range(2):
        try:
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req, timeout=timeout) as resp:
                code = resp.getcode()
                if code < 400:
                    return True, resp.geturl(), code
                return False, resp.geturl(), code
        except urllib.error.HTTPError as e:
            return False, url, e.code
        except Exception as e:
            last = (False, url, type(e).__name__)
    return last


def run_recheck(report_only=False):
    records = [to_internal(r) for r in
               load_json(os.path.join(DATA, "directory.json"), [])]
    with_site = [r for r in records if (r.get("w") or "").strip()]
    results = {}
    alive = fixed = blanked = 0
    dead_list = []

    def work(r):
        ok, final, status = check_url(r["w"].strip())
        return r["id"], ok, final, status

    with ThreadPoolExecutor(max_workers=20) as ex:
        for rid, ok, final, status in ex.map(work, with_site):
            results[rid] = (ok, final, status)

    by_id = {r["id"]: r for r in records}
    for r in with_site:
        rid = r["id"]
        ok, final, status = results[rid]
        if ok:
            alive += 1
            # normalize to final URL after redirects (only if same registrable domain)
            continue
        slug = r.get("slug", "")
        if slug in URL_FIXES:
            r["w"] = URL_FIXES[slug]
            fixed += 1
        elif report_only:
            dead_list.append({"id": rid, "slug": slug, "name": r["n"],
                              "city": r["c"], "state": r["st"],
                              "url": r["w"], "status": str(status)})
        else:
            dead_list.append({"id": rid, "slug": slug, "name": r["n"],
                              "city": r["c"], "state": r["st"],
                              "url": r["w"], "status": str(status)})
            r["w"] = ""
            blanked += 1

    counts = {
        "websites_checked": len(with_site),
        "websites_alive": alive,
        "websites_fixed": fixed,
        "websites_blanked": blanked,
        "websites_empty": len(records) - len(with_site),
        "dead": dead_list,
    }
    save_json(os.path.join(AUDIT, "recheck_report.json"), counts)
    if not report_only:
        save_json(os.path.join(DATA, "directory.json"),
                  [to_public(r) for r in records])
        save_json(os.path.join(DATA, "stats.json"), build_stats(records))
    return counts


def run_apply_dead():
    """Apply URL_FIXES to slow-confirmed dead URLs, blank only definitive
    server-verdict deaths (404/410/403/401/5xx/MissingSchema). Timeouts and
    proxy errors are UNVERIFIABLE from this sandbox: wework.com and workbar.com
    homepages returned ReadTimeout in the slow pass yet are live via
    browser.open. Those are kept as-is, never blanked."""
    records = [to_internal(r) for r in
               load_json(os.path.join(DATA, "directory.json"), [])]
    slow = load_json(os.path.join(AUDIT, "recheck_slow.json"), {}) or {}
    confirmed = slow.get("confirmed_dead", [])
    fast = load_json(os.path.join(AUDIT, "recheck_report.json"), {}) or {}
    DEAD_STATUSES = {"404", "410", "403", "401", "500", "502", "503",
                     "525", "MissingSchema"}
    by_slug = {r.get("slug"): r for r in records}
    fixed = blanked = unverifiable = 0
    fixed_slugs, blanked_slugs = [], []
    for d in confirmed:
        slug = d.get("slug")
        r = by_slug.get(slug)
        if not r:
            continue
        if slug in URL_FIXES:
            r["w"] = URL_FIXES[slug]
            fixed += 1
            fixed_slugs.append(slug)
        elif str(d.get("slow_status")) in DEAD_STATUSES:
            r["w"] = ""
            blanked += 1
            blanked_slugs.append(slug)
        else:
            unverifiable += 1
    save_json(os.path.join(DATA, "directory.json"),
              [to_public(r) for r in records])
    save_json(os.path.join(DATA, "stats.json"), build_stats(records))
    final = {
        "websites_checked": fast.get("websites_checked", 0),
        "websites_alive": fast.get("websites_alive", 0) + slow.get("slow_revived", 0),
        "websites_fixed": fixed,
        "websites_blanked": blanked,
        "websites_empty": fast.get("websites_empty", 0),
        "websites_unverifiable": unverifiable,
        "method_note": ("Blanked only definitive server verdicts. "
                        "ReadTimeout/ProxyError verdicts are unverifiable from "
                        "the sandbox network and were kept as-is."),
        "fixed_slugs": fixed_slugs,
        "blanked_slugs": blanked_slugs,
    }
    save_json(os.path.join(AUDIT, "websites_final.json"), final)
    return final


def main():
    if "--apply-dead" in sys.argv:
        counts = run_apply_dead()
        print(json.dumps(counts, indent=1))
    elif "--recheck" in sys.argv:
        counts = run_recheck(report_only="--report-only" in sys.argv)
        print(json.dumps({k: v for k, v in counts.items() if k != "dead"}, indent=1))
        print("dead list -> audit/recheck_report.json (%d)" % len(counts["dead"]))
    else:
        counts = run_default()
        print(json.dumps(counts, indent=1))


if __name__ == "__main__":
    main()

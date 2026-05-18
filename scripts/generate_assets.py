#!/usr/bin/env python3
"""Generate city coordinates, images, and enhanced data for Huddle."""
import json, os, math, csv, re

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUTPUT = os.path.join(BASE, "public", "data")

# Approximate lat/lng for major US cities
CITY_COORDS = {
    "new york": (40.7128, -74.0060),
    "san francisco": (37.7749, -122.4194),
    "los angeles": (34.0522, -118.2437),
    "chicago": (41.8781, -87.6298),
    "austin": (30.2672, -97.7431),
    "denver": (39.7392, -104.9903),
    "seattle": (47.6062, -122.3321),
    "miami": (25.7617, -80.1918),
    "boston": (42.3601, -71.0589),
    "portland": (45.5152, -122.6784),
    "atlanta": (33.7490, -84.3880),
    "phoenix": (33.4484, -112.0740),
    "dallas": (32.7767, -96.7970),
    "houston": (29.7604, -95.3698),
    "philadelphia": (39.9526, -75.1652),
    "san diego": (32.7157, -117.1611),
    "nashville": (36.1627, -86.7816),
    "detroit": (42.3314, -83.0458),
    "minneapolis": (44.9778, -93.2650),
    "charlotte": (35.2271, -80.8431),
    "las vegas": (36.1699, -115.1398),
    "orlando": (28.5383, -81.3792),
    "san antonio": (29.4241, -98.4936),
    "sacramento": (38.5816, -121.4944),
    "kansas city": (39.0997, -94.5786),
    "columbus": (39.9612, -82.9988),
    "indianapolis": (39.7684, -86.1581),
    "raleigh": (35.7796, -78.6382),
    "milwaukee": (43.0389, -87.9065),
    "baltimore": (39.2904, -76.6122),
    "albuquerque": (35.0853, -106.6056),
    "tucson": (32.2226, -110.9747),
    "fresno": (36.7378, -119.7871),
    "memphis": (35.1495, -90.0490),
    "omaha": (41.2565, -95.9345),
    "pittsburgh": (40.4406, -79.9959),
    "cincinnati": (39.1031, -84.5120),
    "cleveland": (41.4993, -81.6944),
    "tampa": (27.9506, -82.4572),
    "honolulu": (21.3069, -157.8583),
    "brooklyn": (40.6782, -73.9442),
    "queens": (40.7282, -73.7949),
    "bronx": (40.8448, -73.8648),
    "staten island": (40.5795, -74.1502),
    "jersey city": (40.7282, -74.0776),
    "newark": (40.7357, -74.1724),
    "richmond": (37.5407, -77.4360),
    "virginia beach": (36.8529, -75.9780),
    "birmingham": (33.5186, -86.8104),
    "charleston": (32.7765, -79.9311),
    "providence": (41.8240, -71.4128),
    "hartford": (41.7658, -72.6734),
    "new haven": (41.3082, -72.9279),
    "buffalo": (42.8864, -78.8784),
    "rochester": (43.1610, -77.6109),
    "albany": (42.6526, -73.7562),
    "syracuse": (43.0481, -76.1474),
    "ann arbor": (42.2808, -83.7430),
    "madison": (43.0731, -89.4012),
    "palo alto": (37.4419, -122.1430),
    "mountain view": (37.3861, -122.0839),
    "sunnyvale": (37.3688, -122.0363),
    "oakland": (37.8044, -122.2712),
    "berkeley": (37.8716, -122.2727),
    "santa monica": (34.0195, -118.4912),
    "pasadena": (34.1478, -118.1445),
    "long beach": (33.7701, -118.1937),
    "irvine": (33.6846, -117.8265),
    "san jose": (37.3382, -121.8863),
    "santa clara": (37.3541, -121.9552),
    "palo alto": (37.4419, -122.1430),
    "walnut creek": (37.9101, -122.0652),
    "bellevue": (47.6104, -122.2007),
    "redmond": (47.6733, -122.1215),
    "arlington": (38.8798, -77.1068),
    "alexandria": (38.8048, -77.0469),
    "st louis": (38.6270, -90.1994),
    "springfield": (37.2089, -93.2923),
    "new orleans": (29.9511, -90.0715),
    "boise": (43.6150, -116.2023),
    "colorado springs": (38.8339, -104.8214),
    "salt lake city": (40.7608, -111.8910),
    "tulsa": (36.1540, -95.9928),
    "oklahoma city": (35.4676, -97.5164),
    "des moines": (41.5868, -93.6250),
    "lincoln": (40.8136, -96.7026),
    "wichita": (37.6872, -97.3301),
    "scottsdale": (33.4942, -111.9261),
    "tempe": (33.4255, -111.9400),
    "fort lauderdale": (26.1224, -80.1373),
    "west palm beach": (26.7153, -80.0534),
    "jacksonville": (30.3322, -81.6557),
    "orlando": (28.5383, -81.3792),
    "durham": (35.9940, -78.8986),
    "chapel hill": (35.9132, -79.0558),
    "greensboro": (36.0726, -79.7920),
    "baton rouge": (30.4515, -91.1871),
    "lexington": (38.0406, -84.5037),
    "louisville": (38.2527, -85.7585),
}

# City images
CITY_IMAGES = {
    "new york": "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800",
    "san francisco": "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800",
    "los angeles": "https://images.unsplash.com/photo-1580655653885-65763b2597d0?w=800",
    "chicago": "https://images.unsplash.com/photo-1494522855154-9297ac14b55f?w=800",
    "austin": "https://images.unsplash.com/photo-1531218150217-54595bc2b934?w=800",
    "denver": "https://images.unsplash.com/photo-1546156929-a4c0ac411f47?w=800",
    "seattle": "https://images.unsplash.com/photo-1502175353174-a7a70e73b362?w=800",
    "miami": "https://images.unsplash.com/photo-1533106497176-45ae19e68ba2?w=800",
    "boston": "https://images.unsplash.com/photo-1559496417-e7f25cb247f3?w=800",
    "portland": "https://images.unsplash.com/photo-1559598467-f8b76c8155d0?w=800",
    "atlanta": "https://images.unsplash.com/photo-1570032257806-7f4c8d07f156?w=800",
    "phoenix": "https://images.unsplash.com/photo-1570168009587-5e9b7b70e2ce?w=800",
    "dallas": "https://images.unsplash.com/photo-1509023464722-18d996393ca8?w=800",
    "houston": "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800",
    "philadelphia": "https://images.unsplash.com/photo-1559578327-714b8f510eee?w=800",
    "san diego": "https://images.unsplash.com/photo-1538683270504-5d09b7e7c67d?w=800",
    "nashville": "https://images.unsplash.com/photo-1534030347209-467a5b0ad3e6?w=800",
    "detroit": "https://images.unsplash.com/photo-1495020689067-958852a7765e?w=800",
    "minneapolis": "https://images.unsplash.com/photo-1581590022766-b89622c8933a?w=800",
    "las vegas": "https://images.unsplash.com/photo-1605833556294-ea5c7a74f57d?w=800",
    "orlando": "https://images.unsplash.com/photo-1592505303497-9e12e397c0ef?w=800",
    "san antonio": "https://images.unsplash.com/photo-1586179945342-a0ae7f32b54e?w=800",
    "baltimore": "https://images.unsplash.com/photo-1558907707-f7631e7a2e77?w=800",
    "milwaukee": "https://images.unsplash.com/photo-1575445260698-aa55b4dba59f?w=800",
    "pittsburgh": "https://images.unsplash.com/photo-1558963675-94dc9c4a66a9?w=800",
    "new orleans": "https://images.unsplash.com/photo-1532619187608-e5375cab36aa?w=800",
}

DEFAULT_IMAGE = "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800"


def haversine(lat1, lon1, lat2, lon2):
    """Calculate distance between two points in miles."""
    R = 3959
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat/2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon/2)**2
    return R * 2 * math.asin(math.sqrt(a))


def find_closest_city(city_name):
    """Find closest known city by name similarity."""
    query = city_name.lower().strip()
    # Direct match
    if query in CITY_COORDS:
        return CITY_COORDS[query], CITY_IMAGES.get(query, DEFAULT_IMAGE)
    # Partial match
    for name, coords in CITY_COORDS.items():
        if name in query or query in name:
            return coords, CITY_IMAGES.get(name, DEFAULT_IMAGE)
    return None, DEFAULT_IMAGE


def main():
    os.makedirs(OUTPUT, exist_ok=True)

    print("=" * 60)
    print("GENERATING HUDDLE ASSETS")
    print("=" * 60)

    # 1. Build city coordinates lookup
    csv_path = os.path.join(BASE, "huddle_us_directory.csv")
    spaces = []
    with open(csv_path, newline='', encoding='utf-8') as f:
        for row in csv.DictReader(f):
            spaces.append(row)

    # Get unique city/state combos
    city_state_set = {}
    for s in spaces:
        key = (s["city"], s["state"])
        if key not in city_state_set:
            city_state_set[key] = 0
        city_state_set[key] += 1

    print(f"\nCities/states in directory: {len(city_state_set)}")

    # Build coords for each city
    city_coords = {}
    city_image_map = {}
    matched = 0
    for (city, state) in city_state_set:
        if not city:
            continue
        coords, img = find_closest_city(city)
        if coords:
            city_coords[f"{city},{state}"] = {"lat": coords[0], "lng": coords[1], "count": city_state_set[(city, state)]}
            city_image_map[f"{city},{state}"] = img
            matched += 1
        else:
            # Estimate from known nearby city
            # Default to center of state
            state_centers = {
                "CA": (36.7783, -119.4179), "NY": (43.2994, -74.2179),
                "TX": (31.9686, -99.9018), "FL": (27.6648, -81.5158),
                "IL": (40.6331, -89.3985), "PA": (41.2033, -77.1945),
                "OH": (40.4173, -82.9071), "GA": (32.1656, -82.9001),
                "NC": (35.7596, -79.0193), "MI": (44.3148, -85.6024),
                "NJ": (40.0583, -74.4057), "VA": (37.4316, -78.6569),
                "WA": (47.7511, -120.7401), "AZ": (34.0489, -111.0937),
                "MA": (42.4072, -71.3824), "TN": (35.5175, -86.5804),
                "IN": (40.2672, -86.1349), "MO": (37.9643, -91.8318),
                "MD": (39.0458, -76.6413), "WI": (43.7844, -88.7879),
                "CO": (39.5501, -105.7821), "MN": (46.7296, -94.6859),
                "SC": (33.8361, -81.1637), "AL": (32.3182, -86.9023),
                "LA": (30.9843, -91.9623), "KY": (37.8393, -84.2700),
                "OR": (43.8041, -120.5542), "OK": (35.0078, -97.0929),
                "CT": (41.6032, -73.0877), "IA": (41.8780, -93.0977),
                "MS": (32.3547, -89.3985), "AR": (35.2011, -91.8318),
                "KS": (39.0119, -98.4842), "UT": (39.3210, -111.0937),
                "NV": (38.8026, -116.4194), "NM": (34.5199, -105.8701),
                "NE": (41.4925, -99.9018), "WV": (38.5976, -80.4549),
                "ID": (44.0682, -114.7420), "HI": (19.8968, -155.5828),
                "ME": (45.2538, -69.4455), "NH": (43.1939, -71.5724),
                "RI": (41.5801, -71.4774), "MT": (46.8797, -110.3626),
                "DE": (38.9108, -75.5277), "SD": (43.9695, -99.9018),
                "ND": (47.5515, -101.0020), "AK": (64.2008, -149.4937),
                "VT": (44.5588, -72.5778), "WY": (43.0750, -107.2903),
                "DC": (38.9072, -77.0369),
            }
            center = state_centers.get(state, (39.8283, -98.5795))
            # Slight random offset
            import random
            random.seed(hash(city + state))
            offset_lat = (random.random() - 0.5) * 2
            offset_lng = (random.random() - 0.5) * 2
            city_coords[f"{city},{state}"] = {
                "lat": center[0] + offset_lat,
                "lng": center[1] + offset_lng,
                "count": city_state_set[(city, state)],
            }
            city_image_map[f"{city},{state}"] = DEFAULT_IMAGE

    # Write city coordinates
    with open(os.path.join(OUTPUT, "city_coords.json"), "w") as f:
        json.dump(city_coords, f)
    print(f"City coordinates: {len(city_coords)} entries → public/data/city_coords.json")

    # Write city images
    with open(os.path.join(OUTPUT, "city_images.json"), "w") as f:
        json.dump(city_image_map, f)
    print(f"City images: {len(city_image_map)} entries → public/data/city_images.json")

    # 2. Update directory JSON with lat/lng per space
    print(f"\nUpdating directory.json with coordinates...")
    dir_path = os.path.join(OUTPUT, "directory.json")
    with open(dir_path) as f:
        directory = json.load(f)

    for space in directory:
        key = f"{space['c']},{space['st']}"
        if key in city_coords:
            space["lat"] = city_coords[key]["lat"]
            space["lng"] = city_coords[key]["lng"]
        else:
            space["lat"] = 39.8283
            space["lng"] = -98.5795

    with open(dir_path, "w") as f:
        json.dump(directory, f)

    data_size = len(json.dumps(directory))
    print(f"Updated directory.json: {len(directory)} spaces, {data_size/1024:.1f} KB")
    print(f"  Now includes: lat, lng for map rendering")

    # 3. Write stats JSON
    stats = {
        "totalSpaces": len(directory),
        "totalCities": len(city_coords),
        "topStates": {},
        "topCities": [],
    }
    state_counts = {}
    for s in directory:
        st = s["st"]
        state_counts[st] = state_counts.get(st, 0) + 1
    stats["topStates"] = dict(sorted(state_counts.items(), key=lambda x: -x[1])[:10])
    
    city_list = []
    for key, val in city_coords.items():
        city_list.append({"city": key.split(",")[0], "state": key.split(",")[1], "count": val["count"]})
    city_list.sort(key=lambda x: -x["count"])
    stats["topCities"] = city_list[:20]

    with open(os.path.join(OUTPUT, "stats.json"), "w") as f:
        json.dump(stats, f)
    print(f"Stats written: public/data/stats.json")

    print(f"\n{'='*60}")
    print("ASSET GENERATION COMPLETE")
    print(f"{'='*60}")
    print(f"Cities with coordinates: {len(city_coords)}")
    print(f"Spaces with lat/lng: {len(directory)}")
    print(f"City images mapped: {len(city_image_map)}")


if __name__ == "__main__":
    main()

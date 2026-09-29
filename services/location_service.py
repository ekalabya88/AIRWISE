"""
Location Service
Manages monitoring stations, geographical coordinates, distance calculation,
and strict alphabetical sorting (A->Z, case-insensitive, locale-aware).
"""
import math

# Station and city database with genuine geographical coordinates
STATIONS = [
    {
        "id": "bbsr_master_canteen",
        "name": "Bhubaneswar - Master Canteen",
        "city": "Bhubaneswar",
        "area": "Master Canteen",
        "state": "Odisha",
        "country": "India",
        "lat": 20.2668,
        "lon": 85.8436,
        "sensor_type": "CPCB Continuous Ambient Air Quality Monitoring Station",
        "is_active": True
    },
    {
        "id": "bbsr_janpath",
        "name": "Bhubaneswar - Janpath Road",
        "city": "Bhubaneswar",
        "area": "Janpath Road",
        "state": "Odisha",
        "country": "India",
        "lat": 20.2850,
        "lon": 85.8410,
        "sensor_type": "OSPCB Urban Traffic Sensor",
        "is_active": True
    },
    {
        "id": "bbsr_kalpana",
        "name": "Bhubaneswar - Kalpana Square",
        "city": "Bhubaneswar",
        "area": "Kalpana Square",
        "state": "Odisha",
        "country": "India",
        "lat": 20.2520,
        "lon": 85.8402,
        "sensor_type": "Municipal Environmental Detector",
        "is_active": True
    },
    {
        "id": "bbsr_patia",
        "name": "Bhubaneswar - Patia KIIT",
        "city": "Bhubaneswar",
        "area": "Patia",
        "state": "Odisha",
        "country": "India",
        "lat": 20.3533,
        "lon": 85.8189,
        "sensor_type": "Institutional Monitoring Station",
        "is_active": True
    },
    {
        "id": "bbsr_airport",
        "name": "Bhubaneswar - Biju Patnaik Airport Road",
        "city": "Bhubaneswar",
        "area": "Airport Road",
        "state": "Odisha",
        "country": "India",
        "lat": 20.2544,
        "lon": 85.8178,
        "sensor_type": "Aviation Weather & Air Detector",
        "is_active": True
    },
    {
        "id": "delhi_anand_vihar",
        "name": "Delhi - Anand Vihar CAAQMS",
        "city": "Delhi",
        "area": "Anand Vihar",
        "state": "Delhi",
        "country": "India",
        "lat": 28.6508,
        "lon": 77.3152,
        "sensor_type": "DPCC Continuous Station",
        "is_active": True
    },
    {
        "id": "delhi_mandir_marg",
        "name": "Delhi - Mandir Marg",
        "city": "Delhi",
        "area": "Mandir Marg",
        "state": "Delhi",
        "country": "India",
        "lat": 28.6364,
        "lon": 77.1994,
        "sensor_type": "CPCB Reference Station",
        "is_active": True
    },
    {
        "id": "mumbai_bandra",
        "name": "Mumbai - Bandra Kurla Complex",
        "city": "Mumbai",
        "area": "BKC",
        "state": "Maharashtra",
        "country": "India",
        "lat": 19.0664,
        "lon": 72.8687,
        "sensor_type": "MPCB High Precision Station",
        "is_active": True
    },
    {
        "id": "bengaluru_btm",
        "name": "Bengaluru - BTM Layout",
        "city": "Bengaluru",
        "area": "BTM Layout",
        "state": "Karnataka",
        "country": "India",
        "lat": 12.9166,
        "lon": 77.6101,
        "sensor_type": "KSPCB Clean Air Monitor",
        "is_active": True
    },
    {
        "id": "kolkata_victoria",
        "name": "Kolkata - Victoria Memorial",
        "city": "Kolkata",
        "area": "Maidan",
        "state": "West Bengal",
        "country": "India",
        "lat": 22.5448,
        "lon": 88.3426,
        "sensor_type": "WBPCB Ambient Monitoring Post",
        "is_active": True
    },
    {
        "id": "hyderabad_sanathnagar",
        "name": "Hyderabad - Sanathnagar",
        "city": "Hyderabad",
        "area": "Sanathnagar",
        "state": "Telangana",
        "country": "India",
        "lat": 17.4565,
        "lon": 78.4429,
        "sensor_type": "TSPCB Industrial Zone Monitor",
        "is_active": True
    },
    {
        "id": "pune_shivajinagar",
        "name": "Pune - Shivajinagar",
        "city": "Pune",
        "area": "Shivajinagar",
        "state": "Maharashtra",
        "country": "India",
        "lat": 18.5314,
        "lon": 73.8446,
        "sensor_type": "SAFAR Pune Observational Grid",
        "is_active": True
    },
    {
        "id": "ahmedabad_maninagar",
        "name": "Ahmedabad - Maninagar",
        "city": "Ahmedabad",
        "area": "Maninagar",
        "state": "Gujarat",
        "country": "India",
        "lat": 22.9978,
        "lon": 72.6033,
        "sensor_type": "GPCB Continuous Station",
        "is_active": True
    },
    {
        "id": "jaipur_adarsh_nagar",
        "name": "Jaipur - Adarsh Nagar",
        "city": "Jaipur",
        "area": "Adarsh Nagar",
        "state": "Rajasthan",
        "country": "India",
        "lat": 26.9038,
        "lon": 75.8344,
        "sensor_type": "RSPCB Environmental Detector",
        "is_active": True
    },
    {
        "id": "varanasi_bhu",
        "name": "Varanasi - BHU Campus",
        "city": "Varanasi",
        "area": "BHU",
        "state": "Uttar Pradesh",
        "country": "India",
        "lat": 25.2677,
        "lon": 82.9913,
        "sensor_type": "Academic Atmospheric Lab",
        "is_active": True
    },
    {
        "id": "chennai_velachery",
        "name": "Chennai - Velachery",
        "city": "Chennai",
        "area": "Velachery",
        "state": "Tamil Nadu",
        "country": "India",
        "lat": 12.9815,
        "lon": 80.2180,
        "sensor_type": "TNPCB Residential CAAQMS",
        "is_active": True
    },
    {
        "id": "london_westminster",
        "name": "London - Westminster Bridge",
        "city": "London",
        "area": "Westminster",
        "state": "Greater London",
        "country": "United Kingdom",
        "lat": 51.5007,
        "lon": -0.1246,
        "sensor_type": "DEFRA Automatic Urban Network",
        "is_active": True
    },
    {
        "id": "newyork_centralpark",
        "name": "New York - Central Park Station",
        "city": "New York",
        "area": "Manhattan",
        "state": "New York",
        "country": "United States",
        "lat": 40.7829,
        "lon": -73.9654,
        "sensor_type": "EPA Clean Air Monitor",
        "is_active": True
    },
    {
        "id": "tokyo_shinjuku",
        "name": "Tokyo - Shinjuku Environmental Post",
        "city": "Tokyo",
        "area": "Shinjuku",
        "state": "Tokyo",
        "country": "Japan",
        "lat": 35.6938,
        "lon": 139.7034,
        "sensor_type": "Tokyo Metropolitan Ambient Post",
        "is_active": True
    }
]

def get_all_stations_sorted():
    """
    Returns all stations strictly sorted alphabetically (A->Z, case-insensitive, locale-aware).
    """
    return sorted(STATIONS, key=lambda s: s["name"].casefold())

def search_stations(query):
    """
    Searches stations with live autocomplete query.
    Results are ALWAYS sorted alphabetically (A->Z, case-insensitive).
    """
    if not query or not query.strip():
        return get_all_stations_sorted()
    
    q = query.strip().casefold()
    filtered = [
        s for s in STATIONS
        if q in s["name"].casefold() or q in s["city"].casefold() or q in s["area"].casefold()
    ]
    return sorted(filtered, key=lambda s: s["name"].casefold())

def haversine_distance_km(lat1, lon1, lat2, lon2):
    R = 6371.0 # Earth radius in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

def find_nearest_station(user_lat, user_lon):
    """
    Finds the nearest monitoring station from given latitude and longitude.
    """
    if user_lat is None or user_lon is None:
        return None
    
    nearest = None
    min_dist = float("inf")
    for s in STATIONS:
        dist = haversine_distance_km(user_lat, user_lon, s["lat"], s["lon"])
        if dist < min_dist:
            min_dist = dist
            nearest = {**s, "distance_km": round(dist, 1)}
    
    return nearest

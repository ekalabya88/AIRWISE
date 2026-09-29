"""
AQI Service
Handles AQI calculations, CPCB & EPA scale classifications, sub-indices,
and sensor/detector data processing.
"""

# CPCB (Central Pollution Control Board, India) AQI Categories
CPCB_CATEGORIES = [
    {"name": "Good", "min": 0, "max": 50, "color": "#10b981", "badge": "LOW", "description": "Minimal health impact. Air quality is clean and satisfactory."},
    {"name": "Satisfactory", "min": 51, "max": 100, "color": "#84cc16", "badge": "LOW", "description": "Minor breathing discomfort to sensitive people."},
    {"name": "Moderate", "min": 101, "max": 200, "color": "#eab308", "badge": "MEDIUM", "description": "Breathing discomfort to the people with lung, asthma and heart diseases."},
    {"name": "Poor", "min": 201, "max": 300, "color": "#f97316", "badge": "HIGH", "description": "Breathing discomfort to most people on prolonged exposure."},
    {"name": "Very Poor", "min": 301, "max": 400, "color": "#ef4444", "badge": "HIGH", "description": "Respiratory illness on prolonged exposure."},
    {"name": "Severe", "min": 401, "max": 500, "color": "#991b1b", "badge": "HIGH", "description": "Affects healthy people and seriously impacts those with existing diseases."}
]

def classify_aqi(aqi_value):
    """
    Classifies AQI into official CPCB category and 3-level simple tier (LOW, MEDIUM, HIGH).
    """
    if aqi_value is None or not isinstance(aqi_value, (int, float)):
        return {
            "category": "Unknown",
            "tier": "UNKNOWN",
            "color": "#94a3b8",
            "description": "Data unavailable. Sensor telemetry currently offline."
        }

    aqi_int = int(round(aqi_value))
    for cat in CPCB_CATEGORIES:
        if aqi_int <= cat["max"]:
            return {
                "aqi": aqi_int,
                "category": cat["name"],
                "tier": cat["badge"],
                "color": cat["color"],
                "description": cat["description"]
            }
    
    # Severe+
    return {
        "aqi": aqi_int,
        "category": "Severe+",
        "tier": "HIGH",
        "color": "#7f1d1d",
        "description": "Critical emergency air quality hazard."
    }

def get_simple_meaning(aqi_value):
    """
    Returns 1 or 2 simple sentences explaining what the AQI means for normal users.
    """
    if aqi_value is None:
        return "Air quality data is currently unavailable for this station."
    
    if aqi_value <= 50:
        return "Air quality is good and poses little or no health risk. It's a great day for outdoor activities."
    elif aqi_value <= 100:
        return "Air quality is acceptable. A few individuals hypersensitive to air pollutants may feel slight discomfort."
    elif aqi_value <= 200:
        return "Air quality is moderate today. If you have respiratory sensitivities, consider limiting prolonged outdoor workouts."
    elif aqi_value <= 300:
        return "Pollution is elevated. Children, elderly, and those with heart or lung conditions should avoid prolonged outdoor exertion."
    else:
        return "Air quality is dangerously polluted. Everyone should limit outdoor exposure, wear N95 filtration, and run air purifiers."

def compute_aqi_from_pollutants(pm25, pm10):
    """
    Computes standard sub-index approximation for PM2.5 and PM10 according to CPCB formulas.
    """
    if pm25 is None and pm10 is None:
        return None
    
    # Standard CPCB PM2.5 breakpoints
    pm25_aqi = 0
    if pm25 is not None:
        if pm25 <= 30:
            pm25_aqi = (pm25 / 30) * 50
        elif pm25 <= 60:
            pm25_aqi = 50 + ((pm25 - 30) / 30) * 50
        elif pm25 <= 90:
            pm25_aqi = 100 + ((pm25 - 60) / 30) * 100
        elif pm25 <= 120:
            pm25_aqi = 200 + ((pm25 - 90) / 30) * 100
        elif pm25 <= 250:
            pm25_aqi = 300 + ((pm25 - 120) / 130) * 100
        else:
            pm25_aqi = 400 + ((pm25 - 250) / 150) * 100

    pm10_aqi = 0
    if pm10 is not None:
        if pm10 <= 50:
            pm10_aqi = pm10
        elif pm10 <= 100:
            pm10_aqi = pm10
        elif pm10 <= 250:
            pm10_aqi = 100 + ((pm10 - 100) / 150) * 100
        elif pm10 <= 350:
            pm10_aqi = 200 + ((pm10 - 250) / 100) * 100
        elif pm10 <= 430:
            pm10_aqi = 300 + ((pm10 - 350) / 80) * 100
        else:
            pm10_aqi = 400 + ((pm10 - 430) / 70) * 100

    return int(round(max(pm25_aqi, pm10_aqi)))

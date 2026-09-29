"""
Weather Service
Processes meteorological conditions, converts WMO codes to human readable text,
and computes atmospheric comfort parameters.
"""

WMO_WEATHER_CODES = {
    0: "Clear Sky",
    1: "Mainly Clear",
    2: "Partly Cloudy",
    3: "Overcast",
    45: "Foggy",
    48: "Depositing Rime Fog",
    51: "Light Drizzle",
    53: "Moderate Drizzle",
    55: "Dense Drizzle",
    61: "Slight Rain",
    63: "Moderate Rain",
    65: "Heavy Rain",
    71: "Slight Snow Fall",
    73: "Moderate Snow Fall",
    75: "Heavy Snow Fall",
    80: "Slight Rain Showers",
    81: "Moderate Rain Showers",
    82: "Violent Rain Showers",
    95: "Thunderstorm",
    96: "Thunderstorm with Slight Hail",
    99: "Thunderstorm with Heavy Hail",
}

def parse_weather_condition(code):
    return WMO_WEATHER_CODES.get(code, "Partly Cloudy")

def format_weather(temp_c, humidity, wind_kmh, code=2):
    condition = parse_weather_condition(code)
    return {
        "temperature": round(temp_c, 1) if temp_c is not None else None,
        "temperature_formatted": f"{round(temp_c)}°C" if temp_c is not None else "N/A",
        "humidity": humidity if humidity is not None else None,
        "humidity_formatted": f"{humidity}%" if humidity is not None else "N/A",
        "wind_speed": round(wind_kmh, 1) if wind_kmh is not None else None,
        "wind_formatted": f"{round(wind_kmh)} km/h" if wind_kmh is not None else "N/A",
        "condition": condition,
        "summary": f"{round(temp_c)}°C • {condition}" if temp_c is not None else condition
    }

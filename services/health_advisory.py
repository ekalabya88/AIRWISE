"""
Health Advisory Service
Provides medically conservative, rules-based health advisories, tailored
by AQI level and sensitivity group, with WHAT TO DO and WHAT NOT TO DO guidance.
"""

SENSITIVITY_GROUPS = {
    "general": {
        "id": "general",
        "label": "General Public",
        "icon": "👤",
        "description": "Healthy adults with no diagnosed chronic pulmonary or cardiac conditions."
    },
    "children": {
        "id": "children",
        "label": "Children",
        "icon": "👶",
        "description": "Lungs still developing; higher inhalation volume per kilogram of body weight."
    },
    "elderly": {
        "id": "elderly",
        "label": "Elderly",
        "icon": "👵",
        "description": "Higher susceptibility to particulate aggravation of cardiovascular and respiratory systems."
    },
    "respiratory": {
        "id": "respiratory",
        "label": "Respiratory-sensitive",
        "icon": "🫁",
        "description": "Diagnosed with asthma, COPD, chronic bronchitis, or allergy rhinitis."
    },
    "outdoor_sports": {
        "id": "outdoor_sports",
        "label": "Outdoor / Sports",
        "icon": "🏃",
        "description": "Deep breathing and high oxygen consumption during exercise increases particulate deposition."
    },
    "outdoor_worker": {
        "id": "outdoor_worker",
        "label": "Outdoor Worker",
        "icon": "👷",
        "description": "Prolonged multi-hour continuous ambient exposure near traffic or urban work sites."
    }
}

def get_health_advisory(aqi, sensitivity="general", pm25=None, weather=None, location_name="your location"):
    """
    Generates rule-based health guidance adhering to CPCB and WHO medical safety standards.
    """
    if aqi is None:
        return {
            "tier": "UNKNOWN",
            "title": "Air Quality Data Unavailable",
            "summary": f"Live air quality data for {location_name} is currently offline. Exercise normal seasonal health habits.",
            "what_to_do": [
                "Check back once station telemetry reconnects",
                "Maintain baseline indoor ventilation",
                "Stay hydrated throughout the day"
            ],
            "what_not_to_do": [
                "Do not assume high air purity if visual haze is present"
            ],
            "disclaimer": "This advisory provides general environmental health guidance and is not a substitute for professional medical advice, diagnosis, or treatment."
        }

    # Normalize group
    group = sensitivity if sensitivity in SENSITIVITY_GROUPS else "general"

    # Tier: LOW (0-100), MEDIUM (101-200), HIGH (201+)
    if aqi <= 50:
        tier = "LOW"
        tier_label = "Good"
        color = "#10b981"
        summary = f"Air quality in {location_name} is good and clean today. Ideal conditions for outdoor activities for all sensitivity groups."
        precautions = [
            "Enjoy outdoor walks, exercise, and open-air activities",
            "Ventilate your home or workspace with fresh air",
            "Maintain regular hydration"
        ]
        what_to_do = [
            "💧 Stay well hydrated throughout the day",
            "🌬️ Open windows for natural fresh air circulation",
            "🏃 Ideal for vigorous outdoor sports and running",
            "🌿 Enjoy outdoor recreation with family and children"
        ]
        what_not_to_do = [
            "No significant air pollution restrictions needed today",
            "Avoid indoor smoking or chemical aerosol build-up"
        ]

    elif aqi <= 100:
        tier = "LOW"
        tier_label = "Satisfactory"
        color = "#84cc16"
        if group in ["respiratory", "elderly"]:
            summary = f"Air quality in {location_name} is satisfactory. Unusually sensitive individuals may experience minor throat irritation during extended outdoor exertion."
        else:
            summary = f"Air quality in {location_name} is satisfactory. Air pollution poses little to no risk for the majority of the population."

        precautions = [
            "Sensitive individuals should monitor for minor coughing or discomfort",
            "Keep baseline hydration",
            "Ventilate indoors during low-traffic afternoon hours"
        ]
        what_to_do = [
            "💧 Stay hydrated to keep respiratory mucous membranes moist",
            "🌬️ Check AQI before long outdoor training sessions",
            "🏠 Normal indoor ventilation is safe",
            "🏃 Healthy individuals can exercise normally outdoors"
        ]
        what_not_to_do = [
            "Sensitive people should avoid intense exercise directly alongside congested intersections",
            "Do not ignore recurring wheezing or throat scratchiness"
        ]

    elif aqi <= 200:
        tier = "MEDIUM"
        tier_label = "Moderate"
        color = "#eab308"
        if group == "respiratory":
            summary = f"Air quality is moderate in {location_name}. Individuals with asthma or COPD should carry rescue inhalers and reduce prolonged high-exertion outdoor workouts."
        elif group == "children":
            summary = f"Air quality is moderate in {location_name}. Limit prolonged energetic outdoor school sports during peak afternoon rush hour."
        elif group == "elderly":
            summary = f"Air quality is moderate in {location_name}. Elderly individuals with cardiovascular concerns should opt for indoor physical movement."
        elif group in ["outdoor_sports", "outdoor_worker"]:
            summary = f"Air quality is moderate in {location_name}. Consider scheduling intense endurance training early morning or indoors away from vehicle exhaust."
        else:
            summary = f"Air quality is moderate today in {location_name}. If you are sensitive to air pollution, consider reducing prolonged outdoor activity, especially near heavy traffic."

        precautions = [
            "Sensitive groups should reduce prolonged outdoor exertion",
            "Avoid peak-hour rush traffic corridors",
            "Keep quick-relief inhalers and medications handy if diagnosed"
        ]
        what_to_do = [
            "💧 Drink plenty of fluids to assist natural pollutant clearance",
            "😷 Consider wearing a well-fitted mask if you feel breathing irritation",
            "🏠 Keep windows closed during heavy traffic peak hours",
            "🌬️ Monitor local AQI updates before stepping outside for prolonged periods",
            "🏃 Shift high-intensity cardio exercises indoors"
        ]
        what_not_to_do = [
            "Avoid strenuous outdoor exercise when AQI is high or moderate with heavy haze",
            "Avoid spending unnecessary time directly along heavy traffic corridors",
            "Do not ignore breathing tightness or persistent eye irritation"
        ]

    elif aqi <= 300:
        tier = "HIGH"
        tier_label = "Poor"
        color = "#f97316"
        if group == "respiratory":
            summary = f"Air pollution is high (Poor AQI: {aqi}) in {location_name}. High risk of asthma attacks and airway inflammation. Strictly stay indoors with filtration."
        elif group == "children":
            summary = f"Air pollution is high in {location_name}. Children should avoid outdoor recess, playground sports, and prolonged outdoor play."
        elif group == "elderly":
            summary = f"Air pollution is high in {location_name}. Elderly persons should remain indoors to prevent cardiovascular strain and breathing difficulties."
        elif group == "outdoor_worker":
            summary = f"Air pollution is high in {location_name}. Outdoor workers should wear certified N95 particulate respirators and take frequent clean indoor breaks."
        else:
            summary = f"Air pollution is high in {location_name}. Consider limiting prolonged outdoor activity and monitor local health guidance, especially if you are sensitive to pollution."

        precautions = [
            "Wear a certified N95 or FFP2 respirator mask when outdoors",
            "Avoid all intense outdoor cardio or running",
            "Keep windows shut and operate HEPA air purifiers indoors",
            "Carry prescribed inhalers and emergency medications"
        ]
        what_to_do = [
            "💧 Stay consistently hydrated with water and warm fluids",
            "😷 Wear an N95/KN95 respirator mask whenever stepping outdoors",
            "🏠 Run indoor HEPA air purifiers and seal gaps in windows",
            "🌬️ Check real-time AQI before any necessary commute",
            "🏃 Move all fitness routines, yoga, and workouts indoors"
        ]
        what_not_to_do = [
            "Avoid unnecessary prolonged outdoor exposure during high pollution",
            "Avoid strenuous outdoor exercise when AQI is high",
            "Avoid spending unnecessary time near heavy traffic and industrial zones",
            "Do not ignore severe pollution alerts"
        ]

    else:
        tier = "HIGH"
        tier_label = "Very Poor / Severe"
        color = "#ef4444"
        summary = f"⚠️ Critical Health Warning: Severe pollution levels in {location_name} (AQI: {aqi}). Serious risk of respiratory and cardiovascular harm for everyone. Stay indoors."
        precautions = [
            "Avoid all unnecessary outdoor exposure",
            "Mandatory N95/N99 respirator mask if going outdoors is unavoidable",
            "Seal doors and windows; use continuous indoor HEPA air purification",
            "Seek prompt medical attention if experiencing chest tightness or severe wheezing"
        ]
        what_to_do = [
            "💧 Maintain constant hydration and rinse nasal passages if irritated",
            "😷 Use certified N95/FFP2 masks with a tight face seal if stepping outside",
            "🏠 Keep doors and windows tightly closed with indoor air purifier running",
            "🌬️ Continuously track hourly AQI warnings",
            "🫁 Patients with asthma or cardiac conditions must follow medical emergency plans"
        ]
        what_not_to_do = [
            "Strictly avoid outdoor jogging, running, and heavy labor",
            "Never burn biomass, garbage, or incense indoors",
            "Do not commute through heavy diesel traffic corridors without window filtration",
            "Do not neglect acute respiratory symptoms — consult a physician promptly"
        ]

    return {
        "aqi": aqi,
        "tier": tier,
        "tier_label": tier_label,
        "color": color,
        "sensitivity_group": group,
        "sensitivity_label": SENSITIVITY_GROUPS[group]["label"],
        "title": f"{tier} AQI Health Advisory",
        "summary": summary,
        "precautions": precautions,
        "what_to_do": what_to_do,
        "what_not_to_do": what_not_to_do,
        "forecast_worsening": aqi > 120,
        "disclaimer": "The system provides general environmental health information and is not a substitute for professional medical advice, diagnosis, or clinical care."
    }

"""
Environmental Impact Calculator for ATIS
Calculates CO2 emissions and environmental metrics for different transport modes
"""

from typing import Dict, List, Any

# CO2 emissions in kg per passenger-km (New Zealand averages)
EMISSIONS_PER_KM = {
    'car': 0.171,      # Average petrol car
    'bus': 0.089,      # Public bus (Auckland)
    'train': 0.041,    # Electric train
    'ferry': 0.095,    # Ferry (diesel)
    'bike': 0.0,       # Zero emissions
    'walk': 0.0,       # Zero emissions
    'e-scooter': 0.0,  # Negligible
}

# Trees needed to offset 1 ton of CO2 per year
TREES_PER_TON_CO2 = 45.9  # Average tree absorption

def calculate_distance_from_duration(duration_minutes: int, mode: str) -> float:
    """Estimate distance from duration based on average speeds"""
    speeds_kmh = {
        'walk': 5,
        'bike': 15,
        'bus': 25,
        'train': 50,
        'ferry': 30,
        'car': 40
    }
    speed = speeds_kmh.get(mode, 25)
    return (duration_minutes / 60) * speed


def calculate_leg_emissions(leg: Dict[str, Any]) -> Dict[str, float]:
    """Calculate emissions for a single trip leg"""
    mode = leg.get('mode', 'bus')
    
    # Get distance (if provided) or estimate from duration
    distance_km = leg.get('distance_km')
    if not distance_km:
        duration_min = leg.get('duration', 10)
        distance_km = calculate_distance_from_duration(duration_min, mode)
    
    emission_rate = EMISSIONS_PER_KM.get(mode, EMISSIONS_PER_KM['bus'])
    co2_kg = distance_km * emission_rate
    
    return {
        'mode': mode,
        'distance_km': round(distance_km, 2),
        'co2_kg': round(co2_kg, 3),
        'emission_rate': emission_rate
    }


def calculate_itinerary_emissions(itinerary: Dict[str, Any]) -> Dict[str, Any]:
    """Calculate total emissions for an entire itinerary"""
    legs = itinerary.get('legs', [])
    
    # If legs is just strings, convert to dict format
    if legs and isinstance(legs[0], str):
        modes = itinerary.get('modes', [])
        duration_per_leg = itinerary.get('durationMin', 30) / max(len(legs), 1)
        legs = [{'mode': modes[i] if i < len(modes) else 'walk', 
                 'duration': duration_per_leg} 
                for i in range(len(legs))]
    
    leg_emissions = [calculate_leg_emissions(leg) for leg in legs]
    
    total_distance = sum(leg['distance_km'] for leg in leg_emissions)
    total_co2 = sum(leg['co2_kg'] for leg in leg_emissions)
    
    # Calculate car comparison (baseline)
    car_distance = total_distance
    car_co2 = car_distance * EMISSIONS_PER_KM['car']
    co2_saved = car_co2 - total_co2
    
    # Calculate tree equivalent
    trees_to_offset = (total_co2 / 1000) * TREES_PER_TON_CO2  # Convert kg to tons
    
    return {
        'total_distance_km': round(total_distance, 2),
        'total_co2_kg': round(total_co2, 3),
        'car_co2_kg': round(car_co2, 3),
        'co2_saved_kg': round(co2_saved, 3),
        'co2_saved_percent': round((co2_saved / car_co2 * 100) if car_co2 > 0 else 0, 1),
        'trees_equivalent': round(trees_to_offset, 2),
        'legs': leg_emissions
    }


def compare_modal_emissions(itineraries: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Compare environmental impact across multiple itineraries"""
    comparisons = []
    
    for idx, itinerary in enumerate(itineraries):
        emissions = calculate_itinerary_emissions(itinerary)
        
        comparisons.append({
            'itinerary_id': itinerary.get('id', f'Option_{idx+1}'),
            'duration_min': itinerary.get('durationMin', 0),
            'modes': itinerary.get('modes', []),
            'environmental': emissions,
            'eco_score': calculate_eco_score(emissions)
        })
    
    # Find best option
    best_eco = min(comparisons, key=lambda x: x['environmental']['total_co2_kg'])
    
    return {
        'comparisons': comparisons,
        'best_environmental': best_eco,
        'total_co2_saved_vs_car': sum(c['environmental']['co2_saved_kg'] for c in comparisons),
        'recommendation': generate_eco_recommendation(comparisons)
    }


def calculate_eco_score(emissions: Dict[str, Any]) -> float:
    """
    Calculate environmental score (0-100, higher is better)
    Based on CO2 saved compared to driving
    """
    saved_percent = emissions.get('co2_saved_percent', 0)
    
    # Score formula: maximize savings
    if saved_percent >= 80:
        return 100
    elif saved_percent >= 60:
        return 85
    elif saved_percent >= 40:
        return 70
    elif saved_percent >= 20:
        return 55
    elif saved_percent > 0:
        return 40
    else:
        return 20


def generate_eco_recommendation(comparisons: List[Dict[str, Any]]) -> str:
    """Generate environmental recommendation based on analysis"""
    best = min(comparisons, key=lambda x: x['environmental']['total_co2_kg'])
    worst = max(comparisons, key=lambda x: x['environmental']['total_co2_kg'])
    
    best_co2 = best['environmental']['total_co2_kg']
    worst_co2 = worst['environmental']['total_co2_kg']
    
    if best_co2 == 0:
        return f"🌱 Best choice: {best['itinerary_id']} produces zero emissions! Perfect for the environment."
    elif best['environmental']['co2_saved_percent'] >= 70:
        return f"🌱 Best choice: {best['itinerary_id']} saves {best['environmental']['co2_saved_percent']:.0f}% CO2 compared to driving."
    elif worst_co2 - best_co2 > 0.5:
        savings = worst_co2 - best_co2
        return f"💡 Consider {best['itinerary_id']}: saves {savings:.2f}kg CO2 compared to {worst['itinerary_id']}."
    else:
        return f"✅ All options are environmentally similar. Choose based on convenience."


def calculate_cumulative_impact(trips: List[Dict[str, Any]], period: str = "monthly") -> Dict[str, Any]:
    """
    Calculate cumulative environmental impact over time
    Useful for analytics dashboard
    """
    total_trips = len(trips)
    total_co2 = sum(trip.get('environmental', {}).get('total_co2_kg', 0) for trip in trips)
    total_co2_saved = sum(trip.get('environmental', {}).get('co2_saved_kg', 0) for trip in trips)
    total_distance = sum(trip.get('environmental', {}).get('total_distance_km', 0) for trip in trips)
    
    # Calculate annual projections
    multiplier = {'daily': 365, 'weekly': 52, 'monthly': 12, 'yearly': 1}
    annual_multiplier = multiplier.get(period, 12)
    
    annual_co2_saved = total_co2_saved * annual_multiplier
    annual_trees = (annual_co2_saved / 1000) * TREES_PER_TON_CO2
    
    return {
        'period': period,
        'total_trips': total_trips,
        'total_co2_kg': round(total_co2, 2),
        'total_co2_saved_kg': round(total_co2_saved, 2),
        'total_distance_km': round(total_distance, 2),
        'avg_co2_per_trip': round(total_co2 / max(total_trips, 1), 2),
        'annual_projection': {
            'co2_saved_kg': round(annual_co2_saved, 2),
            'trees_equivalent': round(annual_trees, 1),
            'car_trips_avoided': total_trips * annual_multiplier
        },
        'impact_level': get_impact_level(annual_co2_saved)
    }


def get_impact_level(annual_co2_saved_kg: float) -> str:
    """Categorize environmental impact level"""
    if annual_co2_saved_kg >= 1000:  # 1+ ton
        return "🌟 Outstanding"
    elif annual_co2_saved_kg >= 500:
        return "🌿 Excellent"
    elif annual_co2_saved_kg >= 200:
        return "🌱 Very Good"
    elif annual_co2_saved_kg >= 50:
        return "♻️ Good"
    else:
        return "🌍 Making a difference"


"""
Multi-Criteria Decision Analysis (MCDA) for ATIS
Scores and ranks itineraries based on multiple criteria
"""

from typing import Dict, List, Any, Optional
import math


class MCDAScorer:
    """
    Implements weighted scoring for multi-criteria decision analysis
    """
    
    # Default weights for criteria (must sum to 1.0)
    DEFAULT_WEIGHTS = {
        'time': 0.35,          # Duration importance
        'cost': 0.20,          # Fare importance
        'comfort': 0.20,       # Transfers and convenience
        'reliability': 0.15,   # On-time performance
        'environmental': 0.10  # CO2 emissions
    }
    
    # Fare estimates per mode (NZD)
    FARE_ESTIMATES = {
        'bus': 3.50,
        'train': 4.00,
        'ferry': 6.00,
        'walk': 0.0,
        'bike': 0.0
    }
    
    def __init__(self, weights: Optional[Dict[str, float]] = None):
        """Initialize with custom or default weights"""
        self.weights = weights if weights else self.DEFAULT_WEIGHTS.copy()
        self._validate_weights()
    
    def _validate_weights(self):
        """Ensure weights are valid and sum to 1.0"""
        total = sum(self.weights.values())
        if not math.isclose(total, 1.0, rel_tol=0.01):
            # Normalize weights to sum to 1.0
            for key in self.weights:
                self.weights[key] /= total
    
    def normalize_value(self, value: float, min_val: float, max_val: float, 
                       inverse: bool = False) -> float:
        """
        Normalize value to 0-1 range
        inverse=True means lower is better (e.g., duration, cost)
        """
        if max_val == min_val:
            return 1.0
        
        normalized = (value - min_val) / (max_val - min_val)
        
        if inverse:
            normalized = 1.0 - normalized
        
        return max(0.0, min(1.0, normalized))
    
    def calculate_time_score(self, duration_min: int, all_durations: List[int]) -> float:
        """Score based on duration (lower is better)"""
        if not all_durations:
            return 0.5
        
        min_duration = min(all_durations)
        max_duration = max(all_durations)
        
        return self.normalize_value(duration_min, min_duration, max_duration, inverse=True)
    
    def calculate_cost_score(self, modes: List[str], all_costs: List[float]) -> float:
        """Score based on estimated cost (lower is better)"""
        cost = sum(self.FARE_ESTIMATES.get(mode, 0) for mode in modes)
        
        if not all_costs:
            return 0.5
        
        min_cost = min(all_costs)
        max_cost = max(all_costs)
        
        return self.normalize_value(cost, min_cost, max_cost, inverse=True)
    
    def calculate_comfort_score(self, transfers: int, walk_km: float, 
                                all_transfers: List[int], all_walks: List[float]) -> float:
        """
        Score based on comfort factors (fewer transfers and less walking is better)
        """
        # Transfer score (fewer is better)
        min_transfers = min(all_transfers) if all_transfers else 0
        max_transfers = max(all_transfers) if all_transfers else transfers
        transfer_score = self.normalize_value(transfers, min_transfers, max_transfers, inverse=True)
        
        # Walking score (less is better, but some walking is expected)
        min_walk = min(all_walks) if all_walks else 0
        max_walk = max(all_walks) if all_walks else walk_km
        walk_score = self.normalize_value(walk_km, min_walk, max_walk, inverse=True)
        
        # Combine (60% transfers, 40% walking)
        return transfer_score * 0.6 + walk_score * 0.4
    
    def calculate_reliability_score(self, reliability: float) -> float:
        """Score based on reliability (higher is better, already 0-1)"""
        return reliability
    
    def calculate_environmental_score(self, environmental_data: Dict[str, Any]) -> float:
        """Score based on CO2 savings (higher savings is better)"""
        # Use the eco_score if available (0-100 scale)
        if 'eco_score' in environmental_data:
            return environmental_data['eco_score'] / 100
        
        # Otherwise use CO2 saved percentage
        co2_saved_percent = environmental_data.get('co2_saved_percent', 0)
        return min(co2_saved_percent / 100, 1.0)
    
    def score_itinerary(self, itinerary: Dict[str, Any], 
                       context: Dict[str, Any]) -> Dict[str, Any]:
        """
        Calculate MCDA score for a single itinerary
        
        Args:
            itinerary: The itinerary to score
            context: Context data containing all itineraries for normalization
        """
        # Extract values
        duration = itinerary.get('durationMin', 0)
        modes = itinerary.get('modes', [])
        transfers = itinerary.get('transfers', 0)
        walk_km = itinerary.get('walk_km', 0)
        reliability = itinerary.get('reliability', 0.8)
        environmental = itinerary.get('environmental', {})
        
        # Get context for normalization
        all_durations = context.get('all_durations', [duration])
        all_costs = context.get('all_costs', [])
        all_transfers = context.get('all_transfers', [transfers])
        all_walks = context.get('all_walks', [walk_km])
        
        # Calculate individual scores
        time_score = self.calculate_time_score(duration, all_durations)
        cost_score = self.calculate_cost_score(modes, all_costs)
        comfort_score = self.calculate_comfort_score(transfers, walk_km, all_transfers, all_walks)
        reliability_score = self.calculate_reliability_score(reliability)
        environmental_score = self.calculate_environmental_score(environmental)
        
        # Calculate weighted total score
        scores = {
            'time': time_score,
            'cost': cost_score,
            'comfort': comfort_score,
            'reliability': reliability_score,
            'environmental': environmental_score
        }
        
        # Weighted sum
        total_score = sum(scores[criterion] * self.weights[criterion] 
                         for criterion in scores)
        
        # Scale to 0-100
        total_score_100 = total_score * 100
        
        return {
            'total_score': round(total_score_100, 1),
            'scores_breakdown': {k: round(v * 100, 1) for k, v in scores.items()},
            'weights_used': self.weights.copy(),
            'recommendation': self.generate_recommendation(total_score_100, scores)
        }
    
    def score_all_itineraries(self, itineraries: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Score all itineraries and rank them
        """
        # Build context for normalization
        all_durations = [itin.get('durationMin', 0) for itin in itineraries]
        all_costs = [sum(self.FARE_ESTIMATES.get(mode, 0) 
                        for mode in itin.get('modes', [])) 
                    for itin in itineraries]
        all_transfers = [itin.get('transfers', 0) for itin in itineraries]
        all_walks = [itin.get('walk_km', 0) for itin in itineraries]
        
        context = {
            'all_durations': all_durations,
            'all_costs': all_costs,
            'all_transfers': all_transfers,
            'all_walks': all_walks
        }
        
        # Score each itinerary
        scored_itineraries = []
        for itin in itineraries:
            scores = self.score_itinerary(itin, context)
            scored_itin = {
                **itin,
                'mcda_score': scores['total_score'],
                'mcda_breakdown': scores['scores_breakdown'],
                'mcda_weights': scores['weights_used'],
                'mcda_recommendation': scores['recommendation']
            }
            scored_itineraries.append(scored_itin)
        
        # Sort by score (highest first)
        scored_itineraries.sort(key=lambda x: x['mcda_score'], reverse=True)
        
        # Add rank
        for idx, itin in enumerate(scored_itineraries):
            itin['mcda_rank'] = idx + 1
        
        return scored_itineraries
    
    def generate_recommendation(self, score: float, scores: Dict[str, float]) -> str:
        """Generate human-readable recommendation"""
        if score >= 85:
            strengths = [k for k, v in scores.items() if v >= 0.85]
            return f"⭐ Excellent choice! Strong in {', '.join(strengths)}."
        elif score >= 70:
            return "✅ Very good option with balanced performance."
        elif score >= 55:
            weakness = min(scores.items(), key=lambda x: x[1])[0]
            return f"👍 Good option, though {weakness} could be better."
        else:
            return "⚠️ Consider other options for better overall performance."


def create_comparison_chart_data(itineraries: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Create data structure for radar/spider chart visualization
    """
    chart_data = {
        'labels': ['Time', 'Cost', 'Comfort', 'Reliability', 'Environmental'],
        'datasets': []
    }
    
    for itin in itineraries:
        if 'mcda_breakdown' in itin:
            dataset = {
                'label': f"Option {itin.get('id', '?')}",
                'data': [
                    itin['mcda_breakdown'].get('time', 0),
                    itin['mcda_breakdown'].get('cost', 0),
                    itin['mcda_breakdown'].get('comfort', 0),
                    itin['mcda_breakdown'].get('reliability', 0),
                    itin['mcda_breakdown'].get('environmental', 0)
                ]
            }
            chart_data['datasets'].append(dataset)
    
    return chart_data


def customize_weights_for_profile(profile: str) -> Dict[str, float]:
    """
    Return preset weight profiles for different user types
    """
    profiles = {
        'commuter': {
            'time': 0.45,
            'cost': 0.15,
            'comfort': 0.25,
            'reliability': 0.15,
            'environmental': 0.0
        },
        'budget': {
            'time': 0.20,
            'cost': 0.50,
            'comfort': 0.10,
            'reliability': 0.10,
            'environmental': 0.10
        },
        'eco': {
            'time': 0.20,
            'cost': 0.10,
            'comfort': 0.15,
            'reliability': 0.15,
            'environmental': 0.40
        },
        'comfort': {
            'time': 0.25,
            'cost': 0.15,
            'comfort': 0.40,
            'reliability': 0.15,
            'environmental': 0.05
        },
        'reliable': {
            'time': 0.25,
            'cost': 0.15,
            'comfort': 0.20,
            'reliability': 0.35,
            'environmental': 0.05
        },
        'balanced': MCDAScorer.DEFAULT_WEIGHTS.copy()
    }
    
    return profiles.get(profile, MCDAScorer.DEFAULT_WEIGHTS.copy())


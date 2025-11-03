"""
Analytics and Tracking Module for ATIS
Tracks system usage, performance metrics, and generates insights
"""

from typing import Dict, List, Any, Optional
import time
import json
import os
from collections import defaultdict, Counter
from datetime import datetime, timedelta


class AnalyticsTracker:
    """Tracks and analyzes system usage"""
    
    def __init__(self, data_file: str = "analytics_data.json"):
        self.data_file = os.path.join(os.path.dirname(__file__), data_file)
        self.data = self._load_data()
    
    def _load_data(self) -> Dict[str, Any]:
        """Load analytics data from file"""
        if os.path.exists(self.data_file):
            try:
                with open(self.data_file, 'r') as f:
                    return json.load(f)
            except:
                return self._init_data()
        return self._init_data()
    
    def _init_data(self) -> Dict[str, Any]:
        """Initialize empty analytics data structure"""
        return {
            'trips': [],
            'searches': [],
            'users': {},
            'system_events': [],
            'started_at': int(time.time())
        }
    
    def _save_data(self):
        """Save analytics data to file"""
        try:
            with open(self.data_file, 'w') as f:
                json.dump(self.data, f, indent=2)
        except Exception as e:
            print(f"Failed to save analytics: {e}")
    
    def track_trip_planned(self, user: str, origin: List[float], destination: List[float], 
                          itinerary: Dict[str, Any]):
        """Track when a trip is planned"""
        trip_record = {
            'timestamp': int(time.time()),
            'user': user,
            'origin': origin,
            'destination': destination,
            'duration_min': itinerary.get('durationMin', 0),
            'transfers': itinerary.get('transfers', 0),
            'modes': itinerary.get('modes', []),
            'walk_km': itinerary.get('walk_km', 0),
            'environmental': itinerary.get('environmental', {}),
            'mcda_score': itinerary.get('mcda_score', 0)
        }
        
        self.data['trips'].append(trip_record)
        self._update_user_stats(user, 'trip')
        self._save_data()
    
    def track_search(self, user: str, query: str, results_count: int):
        """Track location searches"""
        search_record = {
            'timestamp': int(time.time()),
            'user': user,
            'query': query,
            'results_count': results_count
        }
        
        self.data['searches'].append(search_record)
        self._update_user_stats(user, 'search')
        self._save_data()
    
    def track_system_event(self, event_type: str, details: Dict[str, Any]):
        """Track system events (errors, warnings, etc.)"""
        event_record = {
            'timestamp': int(time.time()),
            'type': event_type,
            'details': details
        }
        
        self.data['system_events'].append(event_record)
        self._save_data()
    
    def _update_user_stats(self, user: str, action_type: str):
        """Update user-specific statistics"""
        if user not in self.data['users']:
            self.data['users'][user] = {
                'first_seen': int(time.time()),
                'trip_count': 0,
                'search_count': 0,
                'last_active': int(time.time())
            }
        
        if action_type == 'trip':
            self.data['users'][user]['trip_count'] += 1
        elif action_type == 'search':
            self.data['users'][user]['search_count'] += 1
        
        self.data['users'][user]['last_active'] = int(time.time())
    
    def get_summary_stats(self) -> Dict[str, Any]:
        """Get overall summary statistics"""
        trips = self.data.get('trips', [])
        users = self.data.get('users', {})
        
        # Calculate totals
        total_trips = len(trips)
        total_users = len(users)
        total_searches = len(self.data.get('searches', []))
        
        # Calculate environmental impact
        total_co2_saved = sum(
            trip.get('environmental', {}).get('co2_saved_kg', 0) 
            for trip in trips
        )
        
        total_distance = sum(
            trip.get('environmental', {}).get('total_distance_km', 0)
            for trip in trips
        )
        
        # Active users (last 7 days)
        week_ago = int(time.time()) - (7 * 24 * 60 * 60)
        active_users = sum(
            1 for user_data in users.values() 
            if user_data.get('last_active', 0) > week_ago
        )
        
        # Average trip metrics
        avg_duration = sum(trip.get('duration_min', 0) for trip in trips) / max(total_trips, 1)
        avg_transfers = sum(trip.get('transfers', 0) for trip in trips) / max(total_trips, 1)
        avg_mcda_score = sum(trip.get('mcda_score', 0) for trip in trips) / max(total_trips, 1)
        
        return {
            'total_trips': total_trips,
            'total_users': total_users,
            'total_searches': total_searches,
            'active_users_7d': active_users,
            'total_co2_saved_kg': round(total_co2_saved, 2),
            'total_distance_km': round(total_distance, 2),
            'avg_duration_min': round(avg_duration, 1),
            'avg_transfers': round(avg_transfers, 2),
            'avg_mcda_score': round(avg_mcda_score, 1),
            'car_trips_avoided': total_trips,
            'system_uptime_days': (int(time.time()) - self.data.get('started_at', int(time.time()))) / 86400
        }
    
    def get_popular_routes(self, limit: int = 10) -> List[Dict[str, Any]]:
        """Get most popular routes"""
        trips = self.data.get('trips', [])
        
        # Create route signatures
        route_counter = Counter()
        route_details = {}
        
        for trip in trips:
            origin = tuple(trip.get('origin', []))
            destination = tuple(trip.get('destination', []))
            route_key = (origin, destination)
            
            route_counter[route_key] += 1
            
            if route_key not in route_details:
                route_details[route_key] = {
                    'origin': list(origin),
                    'destination': list(destination),
                    'avg_duration': trip.get('duration_min', 0),
                    'common_modes': trip.get('modes', []),
                    'count': 0
                }
            else:
                # Update averages
                current = route_details[route_key]
                current['count'] += 1
                current['avg_duration'] = (
                    (current['avg_duration'] * current['count'] + trip.get('duration_min', 0)) 
                    / (current['count'] + 1)
                )
        
        # Get top routes
        popular = []
        for (origin, dest), count in route_counter.most_common(limit):
            route_key = (origin, dest)
            details = route_details[route_key]
            popular.append({
                'origin': list(origin),
                'destination': list(dest),
                'trip_count': count,
                'avg_duration_min': round(details['avg_duration'], 1),
                'common_modes': details['common_modes']
            })
        
        return popular
    
    def get_hourly_usage_heatmap(self) -> List[Dict[str, Any]]:
        """Get trip counts by hour of day and day of week"""
        trips = self.data.get('trips', [])
        
        # Initialize 7x24 grid (days x hours)
        heatmap = [[0 for _ in range(24)] for _ in range(7)]
        
        for trip in trips:
            timestamp = trip.get('timestamp', 0)
            dt = datetime.fromtimestamp(timestamp)
            day_of_week = dt.weekday()  # 0=Monday, 6=Sunday
            hour = dt.hour
            heatmap[day_of_week][hour] += 1
        
        # Convert to list format
        result = []
        days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        
        for day_idx, day_name in enumerate(days):
            for hour in range(24):
                result.append({
                    'day': day_name,
                    'hour': hour,
                    'count': heatmap[day_idx][hour]
                })
        
        return result
    
    def get_mode_popularity(self) -> Dict[str, Any]:
        """Get statistics on transport mode usage"""
        trips = self.data.get('trips', [])
        
        mode_counter = Counter()
        for trip in trips:
            for mode in trip.get('modes', []):
                mode_counter[mode] += 1
        
        total = sum(mode_counter.values())
        
        return {
            'counts': dict(mode_counter),
            'percentages': {
                mode: round((count / total * 100), 1) 
                for mode, count in mode_counter.items()
            } if total > 0 else {}
        }
    
    def get_environmental_impact(self) -> Dict[str, Any]:
        """Get cumulative environmental impact statistics"""
        trips = self.data.get('trips', [])
        
        total_co2_saved = sum(
            trip.get('environmental', {}).get('co2_saved_kg', 0)
            for trip in trips
        )
        
        total_distance = sum(
            trip.get('environmental', {}).get('total_distance_km', 0)
            for trip in trips
        )
        
        # Calculate tree equivalent (45.9 trees per ton CO2 per year)
        trees_equivalent = (total_co2_saved / 1000) * 45.9
        
        return {
            'total_co2_saved_kg': round(total_co2_saved, 2),
            'total_distance_km': round(total_distance, 2),
            'trees_equivalent': round(trees_equivalent, 1),
            'car_trips_avoided': len(trips),
            'avg_co2_per_trip': round(total_co2_saved / max(len(trips), 1), 2)
        }
    
    def get_user_leaderboard(self, metric: str = 'trips', limit: int = 10) -> List[Dict[str, Any]]:
        """Get top users by various metrics"""
        users = self.data.get('users', {})
        trips = self.data.get('trips', [])
        
        if metric == 'trips':
            sorted_users = sorted(
                users.items(),
                key=lambda x: x[1].get('trip_count', 0),
                reverse=True
            )[:limit]
            
            return [
                {
                    'username': user,
                    'trip_count': data.get('trip_count', 0),
                    'search_count': data.get('search_count', 0)
                }
                for user, data in sorted_users
            ]
        
        elif metric == 'environmental':
            # Calculate per-user CO2 savings
            user_co2 = defaultdict(float)
            for trip in trips:
                user = trip.get('user', 'unknown')
                co2_saved = trip.get('environmental', {}).get('co2_saved_kg', 0)
                user_co2[user] += co2_saved
            
            sorted_users = sorted(
                user_co2.items(),
                key=lambda x: x[1],
                reverse=True
            )[:limit]
            
            return [
                {
                    'username': user,
                    'co2_saved_kg': round(co2, 2),
                    'trees_equivalent': round((co2 / 1000) * 45.9, 1)
                }
                for user, co2 in sorted_users
            ]
        
        return []
    
    def get_performance_metrics(self) -> Dict[str, Any]:
        """Get system performance metrics"""
        trips = self.data.get('trips', [])
        
        if not trips:
            return {'avg_mcda_score': 0, 'success_rate': 100}
        
        # Calculate average MCDA scores
        avg_mcda = sum(trip.get('mcda_score', 0) for trip in trips) / len(trips)
        
        # Success rate (trips with reasonable scores)
        successful = sum(1 for trip in trips if trip.get('mcda_score', 0) >= 50)
        success_rate = (successful / len(trips)) * 100
        
        # Average satisfaction (mock data based on MCDA scores)
        avg_satisfaction = min(5.0, (avg_mcda / 20))  # Scale 0-100 to 0-5
        
        return {
            'avg_mcda_score': round(avg_mcda, 1),
            'success_rate': round(success_rate, 1),
            'avg_satisfaction': round(avg_satisfaction, 1),
            'total_evaluations': len(trips)
        }


# Global analytics instance
_analytics = None

def get_analytics() -> AnalyticsTracker:
    """Get or create global analytics instance"""
    global _analytics
    if _analytics is None:
        _analytics = AnalyticsTracker()
    return _analytics


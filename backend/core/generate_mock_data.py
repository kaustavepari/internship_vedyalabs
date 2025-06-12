from django.core.management.base import BaseCommand
from django.utils import timezone
import random
import numpy as np
from datetime import datetime, timedelta
from .models import TrafficRecord, TotalCount

def generate_hourly_data(timestamp):
    """
    Generate mock data for a single hour with more realistic patterns.
    """
    # Base values for each category
    base_values = {
        'pedestrian': (50, 200),    # 50-200 pedestrians per hour
        'two_wheeler': (100, 400),  # 100-400 two-wheelers per hour
        'car': (80, 300),          # 80-300 cars per hour
        'bus': (5, 30),            # 5-30 buses per hour
        'truck': (10, 50)          # 10-50 trucks per hour
    }

    # Time-based multipliers
    hour = timestamp.hour
    is_weekend = timestamp.weekday() >= 5  # Saturday or Sunday

    # Peak hours for different categories
    peak_hours = {
        'pedestrian': [8, 9, 17, 18],  # Morning and evening rush
        'two_wheeler': [8, 9, 17, 18, 19],  # Extended rush hours
        'car': [8, 9, 17, 18],  # Standard rush hours
        'bus': [7, 8, 16, 17],  # Slightly earlier for buses
        'truck': [10, 11, 14, 15]  # Mid-day for trucks
    }

    # Weekend patterns
    weekend_multipliers = {
        'pedestrian': 1.5,  # More pedestrians on weekends
        'two_wheeler': 0.7,  # Fewer two-wheelers
        'car': 0.8,  # Fewer cars
        'bus': 0.5,  # Fewer buses
        'truck': 0.3  # Much fewer trucks
    }

    # Generate values with more variation
    values = {}
    for category, (min_val, max_val) in base_values.items():
        # Base random value
        base = random.randint(min_val, max_val)
        
        # Apply time-based variation
        if hour in peak_hours[category]:
            base *= random.uniform(1.5, 2.5)  # Peak hour boost
        elif hour in [12, 13]:  # Lunch hour
            base *= random.uniform(0.7, 1.2)
        elif hour in [0, 1, 2, 3, 4]:  # Late night
            base *= random.uniform(0.1, 0.3)
        
        # Apply weekend adjustment
        if is_weekend:
            base *= weekend_multipliers[category]
        
        # Add some random noise
        noise = random.uniform(-0.2, 0.2)  # ±20% variation
        base *= (1 + noise)
        
        # Ensure minimum value
        values[category] = max(1, round(base))

    # Create records
    traffic_record = TrafficRecord.objects.create(timestamp=timestamp)
    total_count = TotalCount.objects.create(
        traffic_record=traffic_record,
        pedestrian=values['pedestrian'],
        two_wheeler=values['two_wheeler'],
        car=values['car'],
        bus=values['bus'],
        truck=values['truck']
    )

    return traffic_record, total_count

def generate_weekly_data(start_date):
    """
    Generate data for a week with realistic daily patterns.
    """
    records = []
    for day in range(7):
        current_date = start_date + timedelta(days=day)
        
        # Generate 24 hours of data
        for hour in range(24):
            timestamp = timezone.make_aware(
                datetime.combine(current_date, datetime.min.time()) + timedelta(hours=hour)
            )
            traffic_record, total_count = generate_hourly_data(timestamp)
            records.append((traffic_record, total_count))
    
    return records

def generate_historical_data(weeks=1):
    """
    Generate historical data for the specified number of weeks.
    """
    # Clear existing data
    TotalCount.objects.all().delete()
    TrafficRecord.objects.all().delete()

    # Generate data
    start_date = timezone.now().date() - timedelta(days=weeks * 7)
    all_records = []
    
    for week in range(weeks):
        week_start = start_date + timedelta(days=week * 7)
        week_records = generate_weekly_data(week_start)
        all_records.extend(week_records)

    return len(all_records)

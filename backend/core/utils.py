import random
from django.db.models import Sum, F, Value
from django.utils import timezone
from .models import TrafficRecord, TotalCount
from .generate_mock_data import generate_hourly_data, generate_weekly_data, generate_historical_data

# Constants for metric data
METRIC_CONSTANTS = {
    "Total Pedestrians": {
        "color": "#e0efff",
        "icon": "https://res.cloudinary.com/dpgxlbpz1/image/upload/v1747327106/Frame_1171275857_owiu91.png"
    },
    "Two-Wheelers": {
        "color": "#e5fff1",
        "icon": "https://res.cloudinary.com/dpgxlbpz1/image/upload/v1747327086/Frame_1171275856_rigqxv.png"
    },
    "Four-Wheelers": {
        "color": "#fff2dc",
        "icon": "https://res.cloudinary.com/dpgxlbpz1/image/upload/v1747327067/Frame_1171275859_z6wi01.png"
    },
    "Heavy Vehicles": {
        "color": "#ffffe5",
        "icon": "https://res.cloudinary.com/dpgxlbpz1/image/upload/v1747327039/Frame_1171275858_rf1oym.png"
    }
}

def calculate_metric_value(category, start_time, end_time):
    """Calculate the total value for a given category in the specified time range"""
    if category == "Total Pedestrians":
        total = TotalCount.objects.filter(
            traffic_record__timestamp__range=(start_time, end_time)
        ).aggregate(total=Sum('pedestrian'))['total'] or 0
        return str(total)
    elif category == "Two-Wheelers":
        total = TotalCount.objects.filter(
            traffic_record__timestamp__range=(start_time, end_time)
        ).aggregate(total=Sum('two_wheeler'))['total'] or 0
        return str(total)
    elif category == "Four-Wheelers":
        total = TotalCount.objects.filter(
            traffic_record__timestamp__range=(start_time, end_time)
        ).aggregate(total=Sum('car'))['total'] or 0
        return str(total)
    elif category == "Heavy Vehicles":
        agg = TotalCount.objects.filter(
            traffic_record__timestamp__range=(start_time, end_time)
        ).aggregate(total_bus=Sum('bus'), total_truck=Sum('truck'))
        total = (agg['total_bus'] or 0) + (agg['total_truck'] or 0)
        # You can set a max value if needed, e.g., MAX_HEAVY_VEHICLES = 10000
        MAX_HEAVY_VEHICLES = 10000
        return f"{total}/{MAX_HEAVY_VEHICLES}"
    return "0"

def calculate_trend_and_change(current_value, previous_value):
    """
    Calculate trend and percentage change between two values.
    
    Args:
        current_value (float): The current period's value
        previous_value (float): The previous period's value
        
    Returns:
        tuple: (trend, change_percent)
            - trend (str): Either "increase" or "decrease"
            - change_percent (float): Absolute percentage change rounded to 1 decimal place
    """
    if previous_value == 0:
        if current_value > 0:
            return "increase", 100.0
        return "increase", 0.0
    
    change_percent = ((current_value - previous_value) / previous_value) * 100
    trend = "increase" if change_percent >= 0 else "decrease"
    change_percent = abs(round(change_percent, 1))
    
    return trend, change_percent

def get_metrics_data(days=7):
    """Get metrics data for the dashboard"""
    # Get the latest record in the database
    latest_record = TrafficRecord.objects.order_by('-timestamp').first()
    if not latest_record:
        return []

    # Calculate time ranges based on the latest record
    end_time = latest_record.timestamp
    start_time = end_time - timezone.timedelta(days=days)
    prev_start_time = start_time - timezone.timedelta(days=days)
    prev_end_time = start_time

    metrics_data = []
    for title, constants in METRIC_CONSTANTS.items():
        # Calculate current period value
        current_value = calculate_metric_value(title, start_time, end_time)
        # Calculate previous period value
        previous_value = calculate_metric_value(title, prev_start_time, prev_end_time)
        # For Heavy Vehicles, handle the special format "current/max"
        if title == "Heavy Vehicles":
            current_num = int(current_value.split('/')[0])
            previous_num = int(previous_value.split('/')[0])
        else:
            current_num = int(current_value)
            previous_num = int(previous_value)
        # Calculate trend and change percentage
        trend, change_percent = calculate_trend_and_change(current_num, previous_num)
        metrics_data.append({
            "title": title,
            "value": current_value,
            "trend": trend,
            "changePercent": change_percent,
            "color": constants["color"],
            "icon": constants["icon"]
        })
    return metrics_data 
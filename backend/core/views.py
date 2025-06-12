from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.db.models import Sum, Max, Q
from .models import TrafficRecord, TotalCount
from .utils import calculate_trend_and_change
from datetime import datetime, timedelta
import random

@require_http_methods(["GET"])
def get_all_data(request):
    """Get all data from the database"""
    try:
        # Get all records ordered by timestamp
        records = TrafficRecord.objects.all().order_by('-timestamp')
        
        # Convert to list of dictionaries
        data_list = []
        for record in records:
            total_count = record.total_counts.first()  # Get the associated TotalCount
            if total_count:
                data_list.append({
                    'timestamp': record.timestamp,
                    'pedestrians': total_count.pedestrian,
                    'two_wheelers': total_count.two_wheeler,
                    'four_wheelers': total_count.car,
                    'heavy_vehicles': total_count.bus + total_count.truck
                })
        
        return JsonResponse({
            'data': data_list,
            'total_records': len(data_list)
        })
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

@require_http_methods(["GET"])
def get_card_data(request):
    """
    Get aggregated data for the dashboard cards.
    """
    # Get the requested time period
    period = request.GET.get('period', '7')  # Default to 7 days
    period = int(period)

    # Get the latest record in the database
    latest_record = TrafficRecord.objects.order_by('-timestamp').first()
    if not latest_record:
        return JsonResponse({"error": "No data available"}, status=404)

    # Calculate the time range based on the latest record
    end_time = latest_record.timestamp
    start_time = end_time - timedelta(days=period)
    prev_start_time = start_time - timedelta(days=period)
    prev_end_time = start_time

    # Get current period data
    current_period = TotalCount.objects.filter(
        traffic_record__timestamp__gte=start_time,
        traffic_record__timestamp__lte=end_time
    ).aggregate(
        total_pedestrians=Sum('pedestrian'),
        total_two_wheelers=Sum('two_wheeler'),
        total_four_wheelers=Sum('car'),
        total_heavy_vehicles=Sum('bus') + Sum('truck')
    )

    # Get previous period data
    prev_period = TotalCount.objects.filter(
        traffic_record__timestamp__gte=prev_start_time,
        traffic_record__timestamp__lt=start_time
    ).aggregate(
        total_pedestrians=Sum('pedestrian'),
        total_two_wheelers=Sum('two_wheeler'),
        total_four_wheelers=Sum('car'),
        total_heavy_vehicles=Sum('bus') + Sum('truck')
    )

    # Calculate percentages
    def calculate_percentage(current, previous):
        if not previous:
            return 0
        # Calculate the absolute difference
        diff = current - previous
        # Calculate percentage change while preserving the sign
        return (diff / previous) * 100

    return JsonResponse({
        'pedestrians': {
            'current': current_period['total_pedestrians'] or 0,
            'previous': prev_period['total_pedestrians'] or 0,
            'percentage': calculate_percentage(
                current_period['total_pedestrians'] or 0,
                prev_period['total_pedestrians'] or 0
            )
        },
        'two_wheelers': {
            'current': current_period['total_two_wheelers'] or 0,
            'previous': prev_period['total_two_wheelers'] or 0,
            'percentage': calculate_percentage(
                current_period['total_two_wheelers'] or 0,
                prev_period['total_two_wheelers'] or 0
            )
        },
        'four_wheelers': {
            'current': current_period['total_four_wheelers'] or 0,
            'previous': prev_period['total_four_wheelers'] or 0,
            'percentage': calculate_percentage(
                current_period['total_four_wheelers'] or 0,
                prev_period['total_four_wheelers'] or 0
            )
        },
        'heavy_vehicles': {
            'current': current_period['total_heavy_vehicles'] or 0,
            'previous': prev_period['total_heavy_vehicles'] or 0,
            'percentage': calculate_percentage(
                current_period['total_heavy_vehicles'] or 0,
                prev_period['total_heavy_vehicles'] or 0
            )
        }
    })

@require_http_methods(["GET"])
def get_traffic_volume_data(request):
    """
    Get traffic volume data for the chart.
    """
    # Get the requested time period
    period = request.GET.get('period', '7')
    period = int(period)

    # Get the latest record in the database
    latest_record = TrafficRecord.objects.order_by('-timestamp').first()
    if not latest_record:
        return JsonResponse({"error": "No data available"}, status=404)

    # Calculate the time range based on the latest record
    end_time = latest_record.timestamp
    start_time = end_time - timedelta(days=period)

    # Fetch data for the specified period, aggregated by day
    volume_data = TotalCount.objects.filter(
        traffic_record__timestamp__gte=start_time,
        traffic_record__timestamp__lte=end_time
    ).values('traffic_record__timestamp__date').annotate(
        Category1=Sum('pedestrian'),  # Pedestrians
        Category2=Sum('two_wheeler'),  # Two-Wheelers
        Category3=Sum('car'),  # Four-Wheelers
        Category4=Sum('bus') + Sum('truck')  # Heavy Vehicles
    ).order_by('traffic_record__timestamp__date')

    # Format data for the frontend
    transformed_data = []
    
    if period > 7:
        # Group data by weeks
        week_groups = {}
        for entry in volume_data:
            date = entry['traffic_record__timestamp__date']
            week_num = (date - start_time.date()).days // 7 + 1
            week_key = f"Week {week_num}"
            
            if week_key not in week_groups:
                week_groups[week_key] = {
                    'day': week_key,
                    'Category1': 0,
                    'Category2': 0,
                    'Category3': 0,
                    'Category4': 0,
                    'count': 0
                }
            
            week_data = week_groups[week_key]
            week_data['Category1'] += entry['Category1'] or 0
            week_data['Category2'] += entry['Category2'] or 0
            week_data['Category3'] += entry['Category3'] or 0
            week_data['Category4'] += entry['Category4'] or 0
            week_data['count'] += 1
        
        # Calculate averages for each week
        for week_data in week_groups.values():
            count = week_data.pop('count')
            if count > 0:
                week_data['Category1'] = round(week_data['Category1'] / count)
                week_data['Category2'] = round(week_data['Category2'] / count)
                week_data['Category3'] = round(week_data['Category3'] / count)
                week_data['Category4'] = round(week_data['Category4'] / count)
            transformed_data.append(week_data)
    else:
        # Use daily data for periods <= 7 days
        for entry in volume_data:
            date = entry['traffic_record__timestamp__date']
            transformed_data.append({
                'day': date.strftime('%a'),  # Get day name (Mon, Tue, etc.)
                'Category1': entry['Category1'] or 0,
                'Category2': entry['Category2'] or 0,
                'Category3': entry['Category3'] or 0,
                'Category4': entry['Category4'] or 0
            })

    return JsonResponse({'data': transformed_data})

@require_http_methods(["GET"])
def get_peak_time_data(request):
    """
    Get aggregated peak time data for the chart with random variations.
    """
    # Get the requested time period
    period = request.GET.get('period', '7')
    period = int(period)

    # Get the latest record in the database
    latest_record = TrafficRecord.objects.order_by('-timestamp').first()
    if not latest_record:
        return JsonResponse({"error": "No data available"}, status=404)

    # Calculate the time range based on the latest record
    end_time = latest_record.timestamp
    start_time = end_time - timedelta(days=period)

    # Fetch data for the specified period, aggregated by day
    peak_data_query = TotalCount.objects.filter(
        traffic_record__timestamp__gte=start_time,
        traffic_record__timestamp__lte=end_time
    ).values('traffic_record__timestamp__date').annotate(
        pedestrian=Sum('pedestrian'),
        two_wheeler=Sum('two_wheeler'),
        car=Sum('car'),
        heavy_vehicles=Sum('bus') + Sum('truck')
    ).order_by('traffic_record__timestamp__date')

    # Initialize category totals with random variations
    category_totals = {
        'Pedestrians': random.randint(5000, 15000),
        'Two-Wheelers': random.randint(8000, 20000),
        'Four-Wheelers': random.randint(6000, 18000),
        'Heavy Vehicles': random.randint(2000, 8000)
    }

    # Generate random peak hours for each category
    peak_hours = {
        'Pedestrians': random.randint(8, 20),
        'Two-Wheelers': random.randint(8, 20),
        'Four-Wheelers': random.randint(8, 20),
        'Heavy Vehicles': random.randint(8, 20)
    }

    # Format data for the frontend with random variations
    transformed_data = [
        {
            'name': 'Pedestrians',
            'value': category_totals['Pedestrians'],
            'originalValue': category_totals['Pedestrians'],
            'peak_hour': peak_hours['Pedestrians']
        },
        {
            'name': 'Two-Wheelers',
            'value': category_totals['Two-Wheelers'],
            'originalValue': category_totals['Two-Wheelers'],
            'peak_hour': peak_hours['Two-Wheelers']
        },
        {
            'name': 'Four-Wheelers',
            'value': category_totals['Four-Wheelers'],
            'originalValue': category_totals['Four-Wheelers'],
            'peak_hour': peak_hours['Four-Wheelers']
        },
        {
            'name': 'Heavy Vehicles',
            'value': category_totals['Heavy Vehicles'],
            'originalValue': category_totals['Heavy Vehicles'],
            'peak_hour': peak_hours['Heavy Vehicles']
        }
    ]

    return JsonResponse({'data': transformed_data})


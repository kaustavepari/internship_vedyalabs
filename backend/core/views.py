from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from .models import TrafficRecord, TotalCount
from .utils import (
    TimeRangeService, 
    DataAggregationService, 
    DataTransformationService
)

@require_http_methods(["GET"])
def get_all_data(request):
    """Get all data from the database"""
    try:
        # Get all records ordered by timestamp
        records = TrafficRecord.objects.all().order_by('-timestamp')
        
        # Convert to list of dictionaries
        data_list = []
        for record in records:
            total_count = record.total_counts.first()
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
    """Get aggregated data for the dashboard cards."""
    try:
        # Parse time range parameters
        period = request.GET.get('period', '7')
        start_date = request.GET.get('start_date')
        end_date = request.GET.get('end_date')

        start_time, end_time, error = TimeRangeService.parse_time_range(
            period, start_date, end_date
        )
        
        if error:
            return JsonResponse({"error": error}, status=400)
        
        # Get previous period for comparison
        prev_start_time, prev_end_time = TimeRangeService.get_previous_period(
            start_time, end_time
        )
        
        # Get current and previous period data
        current_totals = DataAggregationService.get_category_totals(start_time, end_time)
        previous_totals = DataAggregationService.get_category_totals(
            prev_start_time, prev_end_time
        )
        
        # Format data for response
        card_data = DataTransformationService.format_card_data(
            current_totals, previous_totals
        )
        
        return JsonResponse(card_data)
        
    except Exception as e:
        return JsonResponse({"error": "Internal server error"}, status=500)

@require_http_methods(["GET"])
def get_traffic_volume_data(request):
    """Get traffic volume data for the chart."""
    try:
        # Parse time range parameters
        period = request.GET.get('period', '7')
        start_date = request.GET.get('start_date')
        end_date = request.GET.get('end_date')

        start_time, end_time, error = TimeRangeService.parse_time_range(
            period, start_date, end_date
        )
        
        if error:
            return JsonResponse({"error": error}, status=400)
        
        # Get daily volume data
        volume_data = DataAggregationService.get_daily_volume_data(start_time, end_time)
        
        # Format data for frontend
        transformed_data = DataTransformationService.format_volume_data(
            volume_data, start_time, end_time
        )

        return JsonResponse({'data': transformed_data})
        
    except Exception as e:
        return JsonResponse({"error": "Internal server error"}, status=500)

@require_http_methods(["GET"])
def get_peak_time_data(request):
    """Get aggregated peak time data for the chart."""
    try:
        # Parse time range parameters
        period = request.GET.get('period', '7')
        start_date = request.GET.get('start_date')
        end_date = request.GET.get('end_date')

        start_time, end_time, error = TimeRangeService.parse_time_range(
            period, start_date, end_date
        )
        
        if error:
            return JsonResponse({"error": error}, status=400)
        
        # Get category totals
        totals = DataAggregationService.get_category_totals(start_time, end_time)
        
        # Calculate peak hours for each category
        peak_data = {}
        categories = ['pedestrians', 'twoWheelers', 'fourWheelers', 'trucks']
        
        for category in categories:
            peak_data[category] = DataAggregationService.get_peak_hour(
                category, start_time, end_time
            )
        
        # Format data for frontend
        transformed_data = DataTransformationService.format_peak_time_data(
            totals, peak_data
        )
        
        return JsonResponse({'data': transformed_data})
        
    except Exception as e:
        return JsonResponse({"error": "Internal server error"}, status=500)

@require_http_methods(["GET"])
def get_latest_data_info(request):
    """Get information about the latest data for polling."""
    try:
        # Get the latest record
        latest_record = TrafficRecord.objects.order_by('-timestamp').first()
        
        if not latest_record:
            return JsonResponse({
                'has_data': False,
                'latest_timestamp': None,
                'total_records': 0
            })
        
        # Get total count of records
        total_records = TrafficRecord.objects.count()
        
        return JsonResponse({
            'has_data': True,
            'latest_timestamp': latest_record.timestamp.isoformat(),
            'total_records': total_records,
            'last_updated': latest_record.timestamp.strftime('%Y-%m-%d %H:%M:%S')
        })
        
    except Exception as e:
        return JsonResponse({"error": "Internal server error"}, status=500)

@require_http_methods(["GET"])
def debug_card_data(request):
    """Debug endpoint to verify time period calculations and percentage changes."""
    try:
        # Parse time range parameters
        period = request.GET.get('period', '7')
        start_date = request.GET.get('start_date')
        end_date = request.GET.get('end_date')
        
        start_time, end_time, error = TimeRangeService.parse_time_range(
            period, start_date, end_date
        )
        
        if error:
            return JsonResponse({"error": error}, status=400)
        
        # Get previous period for comparison
        prev_start_time, prev_end_time = TimeRangeService.get_previous_period(
            start_time, end_time
        )
        
        # Get current and previous period data
        current_totals = DataAggregationService.get_category_totals(start_time, end_time)
        previous_totals = DataAggregationService.get_category_totals(
            prev_start_time, prev_end_time
        )
        
        # Get debug information
        time_debug = TimeRangeService.debug_time_periods(start_time, end_time)
        
        # Calculate percentage changes manually for verification
        debug_calculations = {}
        categories = ['pedestrians', 'two_wheelers', 'four_wheelers', 'heavy_vehicles']
        
        for category in categories:
            current = current_totals.get(category, 0)
            previous = previous_totals.get(category, 0)
            percentage = DataTransformationService.calculate_percentage_change(current, previous)
            trend = DataTransformationService.determine_trend(current, previous)
            
            debug_calculations[category] = {
                'current_total': current,
                'previous_total': previous,
                'difference': current - previous,
                'percentage_change': round(percentage, 1),
                'trend': trend,
                'calculation': f"(({current} - {previous}) / {previous}) * 100 = {round(percentage, 1)}%"
            }
        
        return JsonResponse({
            'time_periods': time_debug,
            'calculations': debug_calculations,
            'summary': {
                'current_period_days': (end_time - start_time).days,
                'previous_period_days': (prev_end_time - prev_start_time).days,
                'total_categories': len(categories)
            }
        })
        
    except Exception as e:
        return JsonResponse({"error": f"Debug error: {str(e)}"}, status=500)


from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from .models import TrafficRecord
from .utils import (
    TimeRangeService, 
    DataAggregationService, 
    DataTransformationService
)
from .llm_service import (
    process_user_prompt
)

import logging
import json

logger = logging.getLogger(__name__)

@csrf_exempt
@require_http_methods(["POST"])
def get_output_from_llm(request):
    logger.info("Received LLM request")
    user_prompt = request.POST.get("user_prompt")
    logger.info("User prompt: %s", str(user_prompt or '')[:200])

    # Utility: Recursively sanitize values so JSON serialization never fails
    def make_json_safe(value):
        if isinstance(value, dict):
            return {k: make_json_safe(v) for k, v in value.items()}
        elif isinstance(value, list):
            return [make_json_safe(v) for v in value]
        elif isinstance(value, Exception):
            return str(value)
        return value

    def create_error_response(error, error_type, status=500):
        error_msg = str(error) or 'An unknown error occurred'
        logger.error("Error in LLM request: %s - %s", error_type, error_msg, exc_info=True)
        
        payload = {
            "error": error_msg,
            "error_type": str(error_type),
            "details": error_msg
        }
        return JsonResponse(payload, status=status, json_dumps_params={'ensure_ascii': False})

    try:
        # --- Call LLM ---
        llm_response = process_user_prompt(user_prompt)

        # --- If LLM returned an exception object ---
        if isinstance(llm_response, Exception):
            safe_message = str(llm_response)
            response_data = {
                "response": safe_message,
                "error": True,
                "error_type": llm_response.__class__.__name__,
            }
            return JsonResponse(response_data)

        # --- LLM returned normal structured data ---
        safe_response = make_json_safe(llm_response)

        logger.info("LLM response: %s...", str(safe_response)[:200])
        return JsonResponse({"response": safe_response})

    except ValueError as ve:
        return create_error_response(f"Invalid request: {str(ve)}", "ValidationError", 400)

    except Exception as e:
        return create_error_response(str(e), e.__class__.__name__, 500)




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


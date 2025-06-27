from django.db.models import Sum, F
from django.utils import timezone
from datetime import datetime, timedelta
from .models import TrafficRecord, TotalCount


# Constants
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
    "Trucks": {
        "color": "#ffffe5",
        "icon": "https://res.cloudinary.com/dpgxlbpz1/image/upload/v1747327039/Frame_1171275858_rf1oym.png"
    }
}

# Field mappings for database queries
FIELD_MAPPINGS = {
    'pedestrians': 'pedestrian',
    'two_wheelers': 'two_wheeler',
    'four_wheelers': 'car',
    'trucks': 'bus + truck'  # Special case for heavy vehicles
}


class TimeRangeService:
    """Service for handling time range calculations and validation"""
    
    @staticmethod
    def parse_time_range(period=None, start_date=None, end_date=None):
        """
        Parse and validate time range parameters.
        
        Args:
            period (str): Number of days as string
            start_date (str): Start date in YYYY-MM-DD format
            end_date (str): End date in YYYY-MM-DD format
            
        Returns:
            tuple: (start_time, end_time, error_message)
        """
        # Get the latest record for reference
        latest_record = TrafficRecord.objects.order_by('-timestamp').first()
        if not latest_record:
            return None, None, "No data available"
        
        if start_date and end_date:
            try:
                start_time = datetime.strptime(start_date, '%Y-%m-%d')
                end_time = datetime.strptime(end_date, '%Y-%m-%d')
            except ValueError:
                return None, None, "Invalid date format. Use YYYY-MM-DD."
        else:
            try:
                period = int(period or 7)
                end_time = latest_record.timestamp
                # Subtract (period - 1) days to include exactly 'period' days including today
                start_time = end_time - timedelta(days=period - 1)
            except ValueError:
                return None, None, "Invalid period format."
        
        return start_time, end_time, None
    
    @staticmethod
    def get_previous_period(start_time, end_time):
        """Calculate the previous period for comparison"""
        period_duration = end_time - start_time
        prev_end_time = start_time
        prev_start_time = start_time - period_duration
        return prev_start_time, prev_end_time
    
    @staticmethod
    def debug_time_periods(start_time, end_time):
        """
        Debug method to verify time period calculations.
        
        Args:
            start_time (datetime): Current period start
            end_time (datetime): Current period end
            
        Returns:
            dict: Debug information about the time periods
        """
        prev_start, prev_end = TimeRangeService.get_previous_period(start_time, end_time)
        
        return {
            'current_period': {
                'start': start_time.isoformat(),
                'end': end_time.isoformat(),
                'duration_days': (end_time - start_time).days
            },
            'previous_period': {
                'start': prev_start.isoformat(),
                'end': prev_end.isoformat(),
                'duration_days': (prev_end - prev_start).days
            },
            'explanation': f"Comparing last {(end_time - start_time).days} days with the previous {(end_time - start_time).days} days"
        }


class DataAggregationService:
    """Service for database aggregation operations"""
    
    @staticmethod
    def get_category_totals(start_time, end_time):
        """
        Get total counts for all categories in the specified time range.
        
        Returns:
            dict: Category totals
        """
        totals = TotalCount.objects.filter(
            traffic_record__timestamp__range=(start_time, end_time)
        ).aggregate(
            pedestrians=Sum('pedestrian'),
            twoWheelers=Sum('two_wheeler'),
            fourWheelers=Sum('car'),
            buses=Sum('bus'),
            trucks=Sum('truck')
        )
        
        # Calculate heavy vehicles (buses + trucks)
        totals['trucks'] = (totals['buses'] or 0) + (totals['trucks'] or 0)
        
        # Ensure all values are integers and remove buses field
        result = {k: int(v or 0) for k, v in totals.items() if k != 'buses'}
        return result
    
    @staticmethod
    def get_daily_volume_data(start_time, end_time):
        """
        Get daily traffic volume data aggregated by date.
        
        Returns:
            QuerySet: Daily aggregated data
        """
        return TotalCount.objects.filter(
            traffic_record__timestamp__range=(start_time, end_time)
        ).values('traffic_record__timestamp__date').annotate(
            pedestrians=Sum('pedestrian'),
            twoWheelers=Sum('two_wheeler'),
            fourWheelers=Sum('car'),
            trucks=Sum('bus') + Sum('truck')
        ).order_by('traffic_record__timestamp__date')
    
    @staticmethod
    def get_peak_hour(category, start_time, end_time):
        """
        Calculate peak hour, date, and actual peak value for a given category.
        
        Args:
            category (str): Category name
            start_time (datetime): Start time
            end_time (datetime): End time
            
        Returns:
            dict: Contains peak_hour (int), peak_date (str), and peak_value (int)
        """
        if category == 'trucks':
            # For trucks, sum bus and truck counts
            peak_record = TotalCount.objects.filter(
                traffic_record__timestamp__range=(start_time, end_time)
            ).annotate(
                total_count=F('bus') + F('truck')
            ).order_by('-total_count').first()
            if peak_record:
                peak_value = peak_record.bus + peak_record.truck
            else:
                peak_value = 0
        else:
            field_map = {
                'pedestrians': 'pedestrian',
                'twoWheelers': 'two_wheeler',
                'fourWheelers': 'car'
            }
            field = field_map.get(category)
            if not field:
                return {
                    'peak_hour': 12,
                    'peak_date': 'N/A',
                    'peak_value': 0
                }
            peak_record = TotalCount.objects.filter(
                traffic_record__timestamp__range=(start_time, end_time)
            ).order_by(f'-{field}').first()
            if peak_record:
                peak_value = getattr(peak_record, field, 0)
            else:
                peak_value = 0
        if peak_record:
            timestamp = peak_record.traffic_record.timestamp
            return {
                'peak_hour': timestamp.hour,
                'peak_date': timestamp.strftime('%Y-%m-%d'),
                'peak_value': peak_value
            }
        else:
            return {
                'peak_hour': 12,
                'peak_date': 'N/A',
                'peak_value': 0
            }


class DataTransformationService:
    """Service for data transformation and formatting"""
    
    @staticmethod
    def calculate_percentage_change(current, previous):
        """
        Calculate percentage change between two values.
        
        This function compares the current period with the previous period of equal duration.
        For example, if user requests last 7 days, it compares:
        - Current: Last 7 days from latest record
        - Previous: The 7 days before the current period (days 8-14 from latest)
        
        Args:
            current (int): Current period total
            previous (int): Previous period total
            
        Returns:
            float: Percentage change (can be positive or negative)
        """
        if not previous:
            # If previous period had no data, but current has data, it's a 100% increase
            return 100.0 if current > 0 else 0.0
        diff = current - previous
        return (diff / previous) * 100
    
    @staticmethod
    def determine_trend(current, previous):
        """
        Determine if the trend is increasing or decreasing.
        
        Args:
            current (int): Current period total
            previous (int): Previous period total
            
        Returns:
            str: 'increase' or 'decrease'
        """
        if current > previous:
            return 'increase'
        elif current < previous:
            return 'decrease'
        else:
            return 'no_change'
    
    @staticmethod
    def format_card_data(current_totals, previous_totals):
        """
        Format data for dashboard cards with percentage changes.
        
        This function compares two periods of equal duration:
        - Current period: The requested time range (e.g., last 7 days)
        - Previous period: The same duration before the current period
        
        Args:
            current_totals (dict): Current period totals
            previous_totals (dict): Previous period totals
            
        Returns:
            dict: Formatted card data with current, previous, and percentage change
        """
        categories = ['pedestrians', 'twoWheelers', 'fourWheelers', 'trucks']
        result = {}
        for category in categories:
            current = current_totals.get(category, 0)
            previous = previous_totals.get(category, 0)
            percentage = DataTransformationService.calculate_percentage_change(current, previous)
            trend = DataTransformationService.determine_trend(current, previous)
            result[category] = {
                'current': current,
                'previous': previous,
                'percentage': round(percentage, 1),
                'trend': trend
            }
        return result
    
    @staticmethod
    def format_volume_data(volume_data, start_time, end_time):
        """
        Format traffic volume data for charts.
        
        Args:
            volume_data (QuerySet): Raw volume data
            start_time (datetime): Start time
            end_time (datetime): End time
            
        Returns:
            list: Formatted volume data
        """
        period_days = (end_time - start_time).days
        
        if period_days > 7:
            # Group by weeks for longer periods
            return DataTransformationService._group_by_weeks(volume_data, start_time)
        else:
            # Use daily data for shorter periods
            return DataTransformationService._format_daily_data(volume_data)
    
    @staticmethod
    def _group_by_weeks(volume_data, start_time):
        """Group daily data by weeks"""
        week_groups = {}
        
        for entry in volume_data:
            date = entry['traffic_record__timestamp__date']
            week_num = (date - start_time.date()).days // 7 + 1
            week_key = f"Week {week_num}"
            
            if week_key not in week_groups:
                week_groups[week_key] = {
                    'day': week_key,
                    'pedestrians': 0,
                    'twoWheelers': 0,
                    'fourWheelers': 0,
                    'trucks': 0,
                    'count': 0
                }
            
            week_data = week_groups[week_key]
            week_data['pedestrians'] += entry['pedestrians'] or 0
            week_data['twoWheelers'] += entry['twoWheelers'] or 0
            week_data['fourWheelers'] += entry['fourWheelers'] or 0
            week_data['trucks'] += entry['trucks'] or 0
            week_data['count'] += 1
        
        # Calculate averages
        result = []
        for week_data in week_groups.values():
            count = week_data.pop('count')
            if count > 0:
                week_data['pedestrians'] = round(week_data['pedestrians'] / count)
                week_data['twoWheelers'] = round(week_data['twoWheelers'] / count)
                week_data['fourWheelers'] = round(week_data['fourWheelers'] / count)
                week_data['trucks'] = round(week_data['trucks'] / count)
            result.append(week_data)
        
        return result
    
    @staticmethod
    def _format_daily_data(volume_data):
        """Format daily data"""
        result = []
        for entry in volume_data:
            date = entry['traffic_record__timestamp__date']
            result.append({
                'day': date.strftime('%a'),  # Get day name (Mon, Tue, etc.)
                'pedestrians': entry['pedestrians'] or 0,
                'twoWheelers': entry['twoWheelers'] or 0,
                'fourWheelers': entry['fourWheelers'] or 0,
                'trucks': entry['trucks'] or 0
            })
        return result
    
    @staticmethod
    def format_peak_time_data(totals, peak_data):
        """
        Format peak time data for charts.
        
        Args:
            totals (dict): Category totals
            peak_data (dict): Peak data for each category (contains peak_hour, peak_date, and peak_value)
            
        Returns:
            list: Formatted peak time data with actual peak values
        """
        categories = [
            ('pedestrians', 'Pedestrians'),
            ('twoWheelers', 'Two-Wheelers'),
            ('fourWheelers', 'Four-Wheelers'),
            ('trucks', 'Trucks')
        ]
        
        result = []
        for category_key, category_name in categories:
            total_value = totals.get(category_key, 0)
            peak_info = peak_data.get(category_key, {
                'peak_hour': 12, 
                'peak_date': 'N/A',
                'peak_value': 0
            })
            
            result.append({
                'name': category_name,
                'value': peak_info.get('peak_value', 0),  # Use actual peak value instead of percentage
                'originalValue': total_value,  # Keep total for reference
                'peak_hour': peak_info.get('peak_hour', 12),
                'peak_date': peak_info.get('peak_date', 'N/A')
            })
        
        return result 
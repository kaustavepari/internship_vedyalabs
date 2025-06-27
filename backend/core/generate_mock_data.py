from django.core.management.base import BaseCommand
from django.utils import timezone
import random
import numpy as np
from datetime import datetime, timedelta
from django.db import transaction
from .models import TrafficRecord, TotalCount

def get_completely_random_count():
    """
    Generate completely random counts with wide ranges and no patterns.
    Each call will be completely independent and random.
    """
    return {
        'pedestrian': random.randint(0, 200),      # 0-200 pedestrians
        'two_wheeler': random.randint(0, 150),     # 0-150 two-wheelers
        'car': random.randint(0, 100),             # 0-100 cars
        'bus': random.randint(0, 50),              # 0-50 buses
        'truck': random.randint(0, 30)             # 0-30 trucks
    }

def generate_mock_data():
    try:
        # Get the latest record in the database
        latest_record = TrafficRecord.objects.order_by('-timestamp').first()
        now = timezone.now()

        if not latest_record:
            print("No existing records found. Starting from 2 months ago...")
            # If no records exist, start from 2 months ago
            latest_record = TrafficRecord.objects.create(timestamp=now - timedelta(days=60))
            # Create initial total counts with completely random values
            counts = get_completely_random_count()
            TotalCount.objects.create(
                traffic_record=latest_record,
                pedestrian=counts['pedestrian'],
                two_wheeler=counts['two_wheeler'],
                car=counts['car'],
                bus=counts['bus'],
                truck=counts['truck']
            )

        # Calculate the time difference between the latest record and now
        time_diff = now - latest_record.timestamp

        # If the difference is less than a minute, no need to generate mock data
        if time_diff.total_seconds() < 60:
            print("No new data needed. Latest record is less than a minute old.")
            return

        # Calculate how many records we'll create
        minutes_diff = int(time_diff.total_seconds() / 60)
        print(f"Generating completely random mock data for {minutes_diff} minutes...")

        # Generate mock data for each missing timestamp (every minute)
        current_time = latest_record.timestamp + timedelta(minutes=1)
        records_created = 0

        # Use transaction to make the process faster
        with transaction.atomic():
            while current_time <= now:
                # Generate completely random values with no patterns
                counts = get_completely_random_count()

                # Create a new TrafficRecord
                new_record = TrafficRecord.objects.create(timestamp=current_time)
                TotalCount.objects.create(
                    traffic_record=new_record,
                    pedestrian=counts['pedestrian'],
                    two_wheeler=counts['two_wheeler'],
                    car=counts['car'],
                    bus=counts['bus'],
                    truck=counts['truck']
                )

                records_created += 1
                if records_created % 100 == 0:  # Show progress every 100 records
                    print(f"Created {records_created} records...")

                current_time += timedelta(minutes=1)

        print(f"Successfully created {records_created} completely random mock records.")

    except Exception as e:
        print(f"An error occurred: {str(e)}")
        raise

if __name__ == '__main__':
    generate_mock_data()

from django.core.management.base import BaseCommand
from core.generate_mock_data import generate_historical_data

class Command(BaseCommand):
    help = 'Generate mock data for the dashboard'

    def add_arguments(self, parser):
        parser.add_argument('weeks', type=int, help='Number of weeks of data to generate')

    def handle(self, *args, **options):
        weeks = options['weeks']
        num_records = generate_historical_data(weeks)
        self.stdout.write(self.style.SUCCESS(f'Successfully generated {num_records} records')) 
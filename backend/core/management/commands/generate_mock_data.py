from django.core.management.base import BaseCommand
from core.generate_mock_data import generate_mock_data

class Command(BaseCommand):
    help = 'Generates completely random mock traffic data for missing timestamps'

    def handle(self, *args, **options):
        self.stdout.write('Starting completely random mock data generation...')
        generate_mock_data()
        self.stdout.write(self.style.SUCCESS('Successfully generated completely random mock data')) 
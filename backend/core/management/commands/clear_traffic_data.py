from django.core.management.base import BaseCommand
from core.models import TrafficRecord, TotalCount
from core.generate_mock_data import generate_mock_data

class Command(BaseCommand):
    help = 'Clears all traffic data and generates new completely random data'

    def add_arguments(self, parser):
        parser.add_argument(
            '--force',
            action='store_true',
            help='Force clear without confirmation',
        )

    def handle(self, *args, **options):
        if not options['force']:
            confirm = input('This will delete ALL traffic data. Are you sure? (yes/no): ')
            if confirm.lower() != 'yes':
                self.stdout.write('Operation cancelled.')
                return

        try:
            # Clear all existing data
            self.stdout.write('Clearing all existing traffic data...')
            TotalCount.objects.all().delete()
            TrafficRecord.objects.all().delete()
            
            self.stdout.write(
                self.style.SUCCESS('Successfully cleared all traffic data')
            )
            
            # Generate new completely random data
            self.stdout.write('Generating new completely random data...')
            generate_mock_data()
            
            self.stdout.write(
                self.style.SUCCESS('Successfully generated new random traffic data')
            )
            
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'An error occurred: {str(e)}')
            ) 
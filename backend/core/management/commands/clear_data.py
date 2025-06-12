from django.core.management.base import BaseCommand
from core.models import TrafficRecord, TotalCount

class Command(BaseCommand):
    help = 'Clears all records from the database'

    def handle(self, *args, **options):
        # Delete all records
        TotalCount.objects.all().delete()
        TrafficRecord.objects.all().delete()
        
        self.stdout.write(self.style.SUCCESS('Successfully cleared all records from the database')) 
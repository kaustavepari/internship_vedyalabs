from django.db import models






class TrafficRecord(models.Model):
    timestamp = models.DateTimeField()

    class Meta:
        db_table = 'traffic_record'

class DirectionCount(models.Model):
    traffic_record = models.ForeignKey(TrafficRecord, on_delete=models.CASCADE, related_name='direction_counts')
    direction = models.CharField(max_length=10)  # e.g., S_W, S_N
    pedestrian = models.IntegerField(default=0)
    car = models.IntegerField(default=0)
    bus = models.IntegerField(default=0)
    truck = models.IntegerField(default=0)
    two_wheeler = models.IntegerField(default=0)

    class Meta:
        db_table = 'direction_count'

class TotalCount(models.Model):
    traffic_record = models.ForeignKey(TrafficRecord, on_delete=models.CASCADE, related_name='total_counts')
    pedestrian = models.IntegerField(default=0)
    car = models.IntegerField(default=0)
    bus = models.IntegerField(default=0)
    truck = models.IntegerField(default=0)
    two_wheeler = models.IntegerField(default=0)

    class Meta:
        db_table = 'total_count'

class RawTrafficData(models.Model):
    traffic_record = models.OneToOneField(TrafficRecord, on_delete=models.CASCADE, related_name='raw_data')
    raw_json = models.JSONField()
    created_at = models.DateTimeField(auto_now_add=True)
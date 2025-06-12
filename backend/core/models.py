from django.db import models

class TrafficRecord(models.Model):
    timestamp = models.DateTimeField()

    class Meta:
        db_table = 'traffic_record'
        ordering = ['-timestamp']

    def __str__(self):
        return f"Record at {self.timestamp}"

class TotalCount(models.Model):
    traffic_record = models.ForeignKey(TrafficRecord, on_delete=models.CASCADE, related_name='total_counts')
    pedestrian = models.IntegerField(default=0)
    car = models.IntegerField(default=0)  # This maps to four_wheelers in your application
    bus = models.IntegerField(default=0)
    truck = models.IntegerField(default=0)
    two_wheeler = models.IntegerField(default=0)

    class Meta:
        db_table = 'total_count'
        ordering = ['-traffic_record__timestamp']

    @property
    def heavy_vehicles(self):
        """Calculate total heavy vehicles (sum of buses and trucks)"""
        return self.bus + self.truck

    @property
    def four_wheelers(self):
        """Alias for cars"""
        return self.car

    def __str__(self):
        return f"Counts for {self.traffic_record.timestamp}"

# class VehicleData(models.Model):
#     # Constants
#     MAX_HEAVY_VEHICLES = 10000  # Maximum number of heavy vehicles that can be used
    
#     # Time fields
#     timestamp = models.DateTimeField()  # Replacing week, day, hour with single timestamp
#     week = models.IntegerField(default=0)  # Week number
#     day = models.IntegerField()  # 0-6 for Monday to Sunday
#     hour = models.IntegerField()  # 0-23 for each hour
    
#     # Category counts
#     pedestrians = models.IntegerField(default=0)
#     two_wheelers = models.IntegerField(default=0)
#     four_wheelers = models.IntegerField(default=0)  # This represents cars
#     heavy_vehicles = models.IntegerField(default=0)  # This represents sum of buses and trucks

#     class Meta:
#         ordering = ['timestamp']  # Order by timestamp
#         indexes = [
#             models.Index(fields=['timestamp']),
#             models.Index(fields=['week']),
#             models.Index(fields=['day']),
#             models.Index(fields=['hour']),
#         ]

#     def __str__(self):
#         return f"Record at {self.timestamp}"

#     @property
#     def resource_utilization(self):
#         """Calculate resource utilization percentage"""
#         return int((self.heavy_vehicles / self.MAX_HEAVY_VEHICLES) * 100)

#     @property
#     def total_vehicles(self):
#         """Calculate total number of vehicles"""
#         return self.two_wheelers + self.four_wheelers + self.heavy_vehicles

#     @property
#     def is_peak_hour(self):
#         """Check if current hour is peak hour"""
#         return 8 <= self.hour <= 18 
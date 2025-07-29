from rest_framework import serializers

class SongSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only = True)
    artist_id = serializers.IntegerField()
    title = serializers.CharField()
    genre = serializers.CharField()
    artist_name = serializers.CharField(min_length = 3)
    first_release_year = serializers.DateTimeField()


# Generated by Django 5.2.4 on 2025-07-29 15:40

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('artist', '0002_add_manager_field'),
    ]

    operations = [
          migrations.RunSQL(
            sql="""
                ALTER TABLE Artists
                ADD COLUMN no_of_album_released INT DEFAULT 0
            """,
            reverse_sql="""
                ALTER TABLE Artists
                DROP COLUMN no_of_album_released
            """
        )
    ]

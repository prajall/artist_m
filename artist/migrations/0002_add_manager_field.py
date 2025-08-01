# Generated by Django 5.2.4 on 2025-07-29 06:37

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('artist', '0001_initial'),
    ]

    operations = [
        migrations.RunSQL(
            sql="""
                ALTER TABLE Artists
                ADD COLUMN manager INTEGER 
                    REFERENCES Users 
                    ON DELETE SET NULL
            """,
            reverse_sql="""
                ALTER TABLE Artists
                DROP COLUMN manager
            """
        )
    ]

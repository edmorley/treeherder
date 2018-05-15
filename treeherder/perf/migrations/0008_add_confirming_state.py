# -*- coding: utf-8 -*-
# Generated by Django 1.11.13 on 2018-05-14 11:40
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('perf', '0007_star_performancealert'),
    ]

    operations = [
        migrations.AlterField(
            model_name='performancealert',
            name='status',
            field=models.IntegerField(choices=[(0, 'Untriaged'), (1, 'Downstream'), (2, 'Reassigned'), (3, 'Invalid'), (4, 'Acknowledged'), (5, 'Confirming')], default=0),
        ),
        migrations.AlterField(
            model_name='performancealertsummary',
            name='status',
            field=models.IntegerField(choices=[(0, 'Untriaged'), (1, 'Downstream'), (3, 'Invalid'), (4, 'Improvement'), (5, 'Investigating'), (6, "Won't fix"), (7, 'Fixed'), (8, 'Backed out'), (9, 'Confirming')], default=0),
        ),
    ]
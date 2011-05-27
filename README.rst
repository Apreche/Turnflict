Blank Django Project Template
=============================

This is a blank Django project that is ready to roll. It's a much better starting point than what you get from django-admin.py startproject. Follow these steps to get going. More boilerplate that's already boiled.

1. pip install -r requirements.txt
2. cp local_settings.py.template local_settings.py
3. use local_apps.py and/or local_middleware.py, if you desire
4. use ./manage.py generate_secret_key and add it to local_settings.py
5. create database and configure in local_settings.py
6. ./manage.py syncdb
7. rock and roll

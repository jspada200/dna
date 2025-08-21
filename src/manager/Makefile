format:
	docker-compose -f docker-compose.local.yml run web isort src
	docker-compose -f docker-compose.local.yml run web black src

lint:
	docker-compose -f docker-compose.local.yml run web isort src --check
	docker-compose -f docker-compose.local.yml run web black src --check

# Makefile for local development

.PHONY: up down migrate test

build:
	docker-compose -f docker-compose.local.yml build

up:
	docker-compose -f docker-compose.local.yml up --build

down:
	docker-compose -f docker-compose.local.yml down

migrate:
	docker-compose -f docker-compose.local.yml run web python src/manage.py makemigrations && \
	docker-compose -f docker-compose.local.yml run web python src/manage.py migrate

test:
	docker-compose -f docker-compose.local.yml run web sh -c "cd src && PYTHONPATH=. pytest --cov=."

shell:
	docker-compose -f docker-compose.local.yml run web /bin/bash

createsuperuser:
	docker-compose -f docker-compose.local.yml run web python src/manage.py createsuperuser

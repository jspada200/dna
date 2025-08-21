# Makefile for local development

.PHONY: up down migrate test

up:
	docker-compose -f docker-compose.local.yml up --build

down:
	docker-compose -f docker-compose.local.yml down

migrate:
	docker-compose -f docker-compose.local.yml exec web uv venv exec python src/manage.py migrate

test:
	docker-compose -f docker-compose.local.yml exec web uv venv exec pytest --cov=src

.PHONY: help dev dev-api dev-worker start-api start-worker build clean verify

help:
	@echo "Available commands:"
	@echo "  make dev          - Run both API and Worker in parallel (development mode)"
	@echo "  make dev-api      - Run only the API in development mode"
	@echo "  make dev-worker   - Run only the Worker in development mode"
	@echo "  make start-api    - Start compiled API in production"
	@echo "  make start-worker - Start compiled Worker in production"
	@echo "  make build        - Build the project for production"
	@echo "  make clean        - Remove dist folder"
	@echo "  make verify       - Run lint, typecheck, and tests"

dev:
	npm run dev:all

dev-api:
	npm run dev:api

dev-worker:
	npm run dev:worker

start-api:
	npm run start:api

start-worker:
	npm run start:worker

build:
	npm run build

clean:
	npm run clean

verify:
	npm run verify


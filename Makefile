# =============================================================================
# otel-ui Makefile
# =============================================================================

.PHONY: help setup install dev build preview clean lint format test docker-build docker-run docker-push all

# Default target
.DEFAULT_GOAL := help

# Variables
DOCKER_IMAGE := stuartshay/otel-ui
DOCKER_TAG := latest
NODE_VERSION := 24

# Colors for output
RED := \033[0;31m
GREEN := \033[0;32m
YELLOW := \033[1;33m
NC := \033[0m # No Color

help: ## Show this help message
	@echo "$(GREEN)otel-ui Makefile Commands$(NC)"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(YELLOW)%-20s$(NC) %s\n", $$1, $$2}'
	@echo ""

# =============================================================================
# Setup and Installation
# =============================================================================

setup: ## Run initial project setup (install nvm, node, dependencies)
	@echo "$(YELLOW)Running setup script...$(NC)"
	@bash setup.sh

install: ## Install npm dependencies
	@echo "$(YELLOW)Installing dependencies...$(NC)"
	@npm install
	@echo "$(GREEN)✓ Dependencies installed$(NC)"

clean: ## Clean build artifacts and node_modules
	@echo "$(YELLOW)Cleaning build artifacts...$(NC)"
	@rm -rf dist node_modules .vite
	@echo "$(GREEN)✓ Cleaned$(NC)"

# =============================================================================
# Development
# =============================================================================

dev: ## Start development server (http://localhost:5173)
	@echo "$(YELLOW)Starting dev server...$(NC)"
	@npm run dev

build: ## Build for production
	@echo "$(YELLOW)Building for production...$(NC)"
	@npm run build
	@echo "$(GREEN)✓ Build complete$(NC)"

preview: ## Preview production build locally
	@echo "$(YELLOW)Starting preview server...$(NC)"
	@npm run preview

# =============================================================================
# Code Quality
# =============================================================================

lint: ## Run all linters (ESLint, markdownlint, shellcheck)
	@echo "$(YELLOW)Running linters...$(NC)"
	@npm run lint:all --silent
	@echo "$(GREEN)✓ Linting complete$(NC)"

lint-fix: ## Fix linting issues automatically
	@echo "$(YELLOW)Fixing lint issues...$(NC)"
	@npm run lint:fix
	@npm run lint:md:fix
	@echo "$(GREEN)✓ Fixes applied$(NC)"

format: ## Format code with Prettier
	@echo "$(YELLOW)Formatting code...$(NC)"
	@npm run format
	@echo "$(GREEN)✓ Formatting complete$(NC)"

format-check: ## Check code formatting
	@npm run format:check

type-check: ## Run TypeScript type checking
	@echo "$(YELLOW)Running type check...$(NC)"
	@npm run type-check
	@echo "$(GREEN)✓ Type check complete$(NC)"

# =============================================================================
# Testing
# =============================================================================

test: ## Run Playwright tests
	@echo "$(YELLOW)Running tests...$(NC)"
	@npx playwright test
	@echo "$(GREEN)✓ Tests complete$(NC)"

test-ui: ## Run Playwright tests in UI mode
	@echo "$(YELLOW)Starting Playwright UI...$(NC)"
	@npx playwright test --ui

test-headed: ## Run Playwright tests in headed mode
	@npx playwright test --headed

test-debug: ## Run Playwright tests in debug mode
	@npx playwright test --debug

# =============================================================================
# Docker
# =============================================================================

docker-build: ## Build Docker image
	@echo "$(YELLOW)Building Docker image...$(NC)"
	@docker build -t $(DOCKER_IMAGE):$(DOCKER_TAG) .
	@echo "$(GREEN)✓ Docker image built: $(DOCKER_IMAGE):$(DOCKER_TAG)$(NC)"

docker-run: ## Run Docker container locally (http://localhost:8080)
	@echo "$(YELLOW)Running Docker container...$(NC)"
	@docker run -p 8080:80 --name otel-ui --rm $(DOCKER_IMAGE):$(DOCKER_TAG)

docker-push: ## Push Docker image to registry
	@echo "$(YELLOW)Pushing Docker image...$(NC)"
	@docker push $(DOCKER_IMAGE):$(DOCKER_TAG)
	@echo "$(GREEN)✓ Image pushed$(NC)"

docker-stop: ## Stop running Docker container
	@docker stop otel-ui || true

# =============================================================================
# Git Hooks
# =============================================================================

hooks-install: ## Install git hooks
	@echo "$(YELLOW)Installing git hooks...$(NC)"
	@npm run prepare
	@echo "$(GREEN)✓ Git hooks installed$(NC)"

# =============================================================================
# Convenience Targets
# =============================================================================

all: clean install lint type-check build ## Clean, install, lint, type-check, and build

check: lint type-check test ## Run all checks (lint, type-check, test)

pre-commit: lint type-check ## Run pre-commit checks locally

pre-push: check build ## Run pre-push checks locally

verify: ## Verify environment and dependencies
	@echo "$(YELLOW)Verifying environment...$(NC)"
	@echo "Node.js: $$(node --version)"
	@echo "npm: $$(npm --version)"
	@command -v shellcheck >/dev/null 2>&1 && echo "shellcheck: $$(shellcheck --version | grep version: | awk '{print $$2}')" || echo "shellcheck: not installed"
	@echo "$(GREEN)✓ Environment verified$(NC)"

# =============================================================================
# Development Workflow
# =============================================================================

reset: clean install ## Reset project (clean and reinstall)
	@echo "$(GREEN)✓ Project reset complete$(NC)"

rebuild: clean install build ## Clean, install, and build

watch: dev ## Alias for dev (start development server)

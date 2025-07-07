# AI 강의 커리큘럼 작성 웹앱 - Makefile

.PHONY: help dev build up down logs clean install test lint

# 기본 명령어
help: ## 사용 가능한 명령어를 보여줍니다
	@echo "AI 강의 커리큘럼 작성 웹앱 - 사용 가능한 명령어:"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

# 개발 환경
dev: ## 개발 환경 실행 (핫 리로딩)
	docker-compose -f docker-compose.dev.yml up --build

dev-d: ## 개발 환경 백그라운드 실행
	docker-compose -f docker-compose.dev.yml up -d --build

# 프로덕션 환경
build: ## 프로덕션 이미지 빌드
	docker-compose build

up: ## 프로덕션 환경 실행
	docker-compose up -d

up-build: ## 프로덕션 환경 빌드 후 실행
	docker-compose up -d --build

# 컨테이너 관리
down: ## 모든 컨테이너 중지 및 제거
	docker-compose down
	docker-compose -f docker-compose.dev.yml down

stop: ## 컨테이너 중지
	docker-compose stop
	docker-compose -f docker-compose.dev.yml stop

restart: ## 컨테이너 재시작
	docker-compose restart

# 로그 및 모니터링
logs: ## 모든 서비스 로그 확인
	docker-compose logs -f

logs-frontend: ## 프론트엔드 로그 확인
	docker-compose logs -f frontend

logs-backend: ## 백엔드 로그 확인
	docker-compose logs -f backend

# 개발 도구
shell-frontend: ## 프론트엔드 컨테이너 쉘 접속
	docker-compose exec frontend sh

shell-backend: ## 백엔드 컨테이너 쉘 접속
	docker-compose exec backend sh

# 의존성 설치
install: ## 의존성 설치
	cd frontend && npm install
	cd backend && npm install

install-frontend: ## 프론트엔드 의존성 설치
	cd frontend && npm install

install-backend: ## 백엔드 의존성 설치
	cd backend && npm install

# 테스트
test: ## 전체 테스트 실행
	cd frontend && npm test
	cd backend && npm test

test-frontend: ## 프론트엔드 테스트
	cd frontend && npm test

test-backend: ## 백엔드 테스트
	cd backend && npm test

# 코드 품질
lint: ## 코드 린트 검사
	cd frontend && npm run lint
	cd backend && npm run lint

lint-fix: ## 코드 린트 자동 수정
	cd frontend && npm run lint:fix
	cd backend && npm run lint:fix

# 데이터베이스
db-migrate: ## 데이터베이스 마이그레이션 실행
	docker-compose exec supabase-db psql -U postgres -d postgres -f /docker-entrypoint-initdb.d/20240707000001_initial_schema.sql

db-seed: ## 샘플 데이터 삽입
	docker-compose exec supabase-db psql -U postgres -d postgres -f /docker-entrypoint-initdb.d/seed.sql

# 정리
clean: ## 사용하지 않는 Docker 리소스 정리
	docker system prune -f
	docker volume prune -f

clean-all: ## 모든 Docker 리소스 정리 (주의: 모든 볼륨 삭제)
	docker-compose down -v --remove-orphans
	docker-compose -f docker-compose.dev.yml down -v --remove-orphans
	docker system prune -af
	docker volume prune -f

# 상태 확인
status: ## 컨테이너 상태 확인
	docker-compose ps

health: ## 서비스 상태 확인
	@echo "Frontend: http://localhost:3000"
	@echo "Backend: http://localhost:4000/health"
	@curl -s http://localhost:4000/health | jq '.' || echo "Backend not responding"

# 환경 설정
env-copy: ## .env.example을 .env로 복사
	cp .env.example .env
	@echo ".env 파일이 생성되었습니다. 실제 값으로 수정해주세요."

# 초기 설정
setup: env-copy install ## 초기 프로젝트 설정
	@echo "프로젝트 설정이 완료되었습니다."
	@echo "1. .env 파일의 환경 변수를 설정하세요"
	@echo "2. 'make dev' 명령어로 개발 환경을 실행하세요"
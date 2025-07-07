# 🚀 배포 가이드

## 로컬 Docker 배포

### 1. 환경 설정

#### 1.1 환경 변수 파일 생성
```bash
# 프로젝트 루트에서
cp .env.example .env
```

#### 1.2 실제 값으로 변경
`.env` 파일을 열어 다음 값들을 실제 값으로 변경:

```env
# Supabase 설정 (필수)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key

# Anthropic Claude API (필수)
ANTHROPIC_API_KEY=sk-ant-api03-your-api-key

# JWT 보안 키 (32자 이상의 강력한 키로 변경)
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-required

# 암호화 키 (32자)
ENCRYPTION_KEY=your-encryption-key-32-characters
```

### 2. Docker 배포 실행

#### 2.1 개발 모드 배포
```bash
# 모든 서비스 실행
docker-compose -f docker-compose.dev.yml up -d

# 로그 확인
docker-compose -f docker-compose.dev.yml logs -f

# 특정 서비스 로그 확인
docker-compose -f docker-compose.dev.yml logs -f frontend
docker-compose -f docker-compose.dev.yml logs -f backend
```

#### 2.2 프로덕션 모드 배포
```bash
# 모든 서비스 실행
docker-compose up -d

# 로그 확인
docker-compose logs -f
```

### 3. 서비스 접근

#### 3.1 웹 애플리케이션
- **프론트엔드**: http://localhost:3000
- **백엔드 API**: http://localhost:8000 (프로덕션) 또는 http://localhost:4000 (개발)

#### 3.2 헬스 체크
```bash
# 백엔드 헬스 체크
curl http://localhost:8000/api/health

# 또는 개발 모드
curl http://localhost:4000/api/health
```

### 4. 배포 상태 확인

#### 4.1 컨테이너 상태 확인
```bash
# 실행 중인 컨테이너 확인
docker ps

# 모든 컨테이너 상태 확인
docker-compose ps
```

#### 4.2 웹 인터페이스에서 확인
1. http://localhost:3000 접속
2. 좌측 하단 환경 설정 상태 버튼(🔧) 클릭
3. 모든 연결 상태가 ✅인지 확인

### 5. 문제 해결

#### 5.1 컨테이너 재시작
```bash
# 모든 서비스 재시작
docker-compose restart

# 특정 서비스 재시작
docker-compose restart frontend
docker-compose restart backend
```

#### 5.2 컨테이너 재빌드
```bash
# 캐시 없이 재빌드
docker-compose build --no-cache

# 재빌드 후 실행
docker-compose up -d --build
```

#### 5.3 로그 분석
```bash
# 전체 로그 (최근 100줄)
docker-compose logs --tail=100

# 실시간 로그 모니터링
docker-compose logs -f --tail=50

# 에러만 필터링
docker-compose logs | grep ERROR
```

#### 5.4 개별 컨테이너 디버깅
```bash
# 컨테이너 내부 접근
docker exec -it ai-curriculum-frontend-dev sh
docker exec -it ai-curriculum-backend-dev sh

# 컨테이너 상세 정보
docker inspect ai-curriculum-frontend-dev
```

### 6. 성능 모니터링

#### 6.1 리소스 사용량 확인
```bash
# Docker 통계
docker stats

# 특정 컨테이너 통계
docker stats ai-curriculum-frontend-dev ai-curriculum-backend-dev
```

#### 6.2 디스크 사용량
```bash
# Docker 디스크 사용량
docker system df

# 불필요한 데이터 정리
docker system prune
```

### 7. 백업 및 복원

#### 7.1 데이터 백업
```bash
# 로그 백업
mkdir -p backup/$(date +%Y%m%d)
docker-compose logs > backup/$(date +%Y%m%d)/docker-logs.txt

# 환경 설정 백업
cp .env backup/$(date +%Y%m%d)/
```

#### 7.2 컨테이너 이미지 백업
```bash
# 이미지 저장
docker save ai-curriculum-builder_frontend > backup/frontend-image.tar
docker save ai-curriculum-builder_backend > backup/backend-image.tar
```

### 8. 업데이트 배포

#### 8.1 코드 업데이트 후 재배포
```bash
# Git에서 최신 코드 가져오기
git pull origin main

# 컨테이너 중지
docker-compose down

# 재빌드 및 재실행
docker-compose up -d --build
```

#### 8.2 무중단 업데이트 (향후 고려사항)
```bash
# Blue-Green 배포를 위한 추가 설정 필요
# 현재는 단일 환경에서의 업데이트만 지원
```

### 9. 보안 고려사항

#### 9.1 환경 변수 보안
- `.env` 파일을 Git에 커밋하지 않기
- 강력한 암호화 키 사용하기
- 정기적으로 키 교체하기

#### 9.2 네트워크 보안
- 방화벽 설정으로 필요한 포트만 열기
- HTTPS 인증서 설정 (운영 환경)
- 정기적인 보안 업데이트

### 10. 운영 환경 배포 준비사항

#### 10.1 도메인 및 SSL
- 도메인 등록 및 DNS 설정
- SSL 인증서 발급 (Let's Encrypt 권장)
- Reverse Proxy 설정 (Nginx)

#### 10.2 모니터링 및 로깅
- 애플리케이션 모니터링 도구 설정
- 로그 수집 및 분석 시스템 구축
- 알림 시스템 설정

#### 10.3 백업 및 복구
- 정기적인 데이터베이스 백업
- 복구 프로세스 테스트
- 재해 복구 계획 수립

---

## 빠른 시작 명령어 요약

```bash
# 1. 환경 설정
cp .env.example .env
# .env 파일 편집하여 실제 값 입력

# 2. 개발 모드 실행
docker-compose -f docker-compose.dev.yml up -d

# 3. 상태 확인
docker-compose ps
curl http://localhost:4000/api/health

# 4. 웹 접속
# http://localhost:3000

# 5. 중지
docker-compose down
```

이 가이드를 따라 진행하면 로컬 환경에서 완전한 AI 커리큘럼 빌더 시스템을 실행할 수 있습니다.
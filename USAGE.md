# PDF Vision MCP 서버 사용법

## Claude Code에서 사용 가능한 명령어

### 1. MCP 서버 확인
```bash
/mcp
```
현재 연결된 MCP 서버와 사용 가능한 도구들을 확인

### 2. PDF 파일 로드
```
"pdf-vision의 load_pdf로 /path/to/file.pdf 열어줘"
```

### 3. 현재 페이지 보기
```
"현재 페이지 보여줘"
```

### 4. 페이지 이동
```
"다음 페이지로"
"이전 페이지로"
"5페이지로 이동"
```

### 5. 여러 페이지 보기
```
"1-5페이지 보여줘"
"전체 페이지 보여줘" (페이지 수가 적을 때만)
```

### 6. PDF 정보 확인
```
"PDF 정보 확인해줘"
```

### 7. 세션 관리
```
"현재 열린 PDF 세션 목록"
```

## 사용 예시

### 문서 분석
```
1. "test.pdf 파일 열어줘"
2. "현재 페이지에 뭐가 있어?"
3. "이 페이지의 표를 마크다운으로 정리해줘"
4. "다음 페이지로 넘어가"
```

### 전체 문서 요약
```
"test.pdf 전체 내용을 요약해줘"
```

## MCP 서버 관리

### 서버 추가 (이미 완료됨)
```bash
claude mcp add pdf-vision -- node /Users/taehoon.kim/Desktop/Sources/pdf2img/dist/index.js
```

### 서버 목록 확인
```bash
claude mcp list
```

### 서버 제거
```bash
claude mcp remove pdf-vision
```

## 주의사항

- PDF 파일 경로는 절대 경로로 지정
- 대용량 PDF의 경우 페이지 범위를 지정해서 보는 것이 효율적
- 이미지가 많은 PDF는 처리 시간이 오래 걸릴 수 있음
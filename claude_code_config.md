# Claude Code에서 PDF Vision Analyzer 사용하기

## 1. MCP 서버 설정

Claude Code의 설정 파일에 다음을 추가:

### macOS
`~/Library/Application Support/Claude/claude_desktop_config.json`

### Linux
`~/.config/claude/claude_desktop_config.json`

### Windows
`%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "pdf-vision": {
      "command": "node",
      "args": ["/Users/taehoon.kim/Desktop/Sources/pdf2img/dist/index.js"]
    }
  }
}
```

## 2. Claude Code 재시작

설정 후 Claude Code를 재시작하면 MCP 서버가 자동으로 연결됩니다.

## 3. 사용 예시

### PDF 로드 및 분석
```
1. "pdf-vision 서버의 load_pdf 도구를 사용해서 /path/to/document.pdf 파일을 로드해줘"
2. "현재 페이지를 보여줘" (get_current_page 사용)
3. "이 페이지의 표를 분석해줘" (Claude가 이미지를 직접 보고 분석)
4. "다음 페이지로 이동해줘" (next_page 사용)
```

### 여러 페이지 한번에 분석
```
"1페이지부터 5페이지까지 한번에 보여주고 전체 내용을 요약해줘"
(get_pages_range 사용)
```

### 전체 문서 분석
```
"전체 PDF를 분석해서 주요 내용을 정리해줘"
(get_all_pages 사용 - 페이지 수가 적을 때만 권장)
```

## 4. 도구 목록

MCP 서버가 제공하는 도구들:

- `load_pdf`: PDF 파일 로드
- `get_current_page`: 현재 페이지를 이미지로 가져오기
- `next_page`: 다음 페이지로 이동
- `previous_page`: 이전 페이지로 이동
- `go_to_page`: 특정 페이지로 이동
- `get_pages_range`: 페이지 범위 지정하여 가져오기
- `get_all_pages`: 모든 페이지 가져오기
- `get_pdf_info`: PDF 정보 확인
- `list_sessions`: 활성 세션 목록

## 5. 장점

- PDF 파서 대신 Claude의 비전 기능 직접 활용
- 복잡한 레이아웃, 표, 그래프도 정확하게 인식
- 스캔된 PDF나 이미지 PDF도 분석 가능
- 페이지별 대화형 분석으로 세밀한 제어 가능
#!/bin/bash

# Claude Code MCP 서버 설정 스크립트

CONFIG_FILE="$HOME/Library/Application Support/Claude/claude_desktop_config.json"
PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "PDF Vision Analyzer MCP 서버 설정을 시작합니다..."

# 기존 설정 백업
if [ -f "$CONFIG_FILE" ]; then
    cp "$CONFIG_FILE" "$CONFIG_FILE.backup"
    echo "기존 설정을 백업했습니다: $CONFIG_FILE.backup"
fi

# 새 설정 추가 (jq 사용)
if command -v jq &> /dev/null; then
    # jq가 설치되어 있는 경우
    jq --arg cmd "node" \
       --arg path "$PROJECT_DIR/dist/index.js" \
       '.mcpServers["pdf-vision"] = {"command": $cmd, "args": [$path]}' \
       "$CONFIG_FILE" > "$CONFIG_FILE.tmp" && mv "$CONFIG_FILE.tmp" "$CONFIG_FILE"
    echo "설정이 추가되었습니다."
else
    echo "jq가 설치되어 있지 않습니다. 수동으로 설정을 추가해주세요:"
    echo ""
    echo "파일: $CONFIG_FILE"
    echo "추가할 내용:"
    echo '  "pdf-vision": {'
    echo '    "command": "node",'
    echo "    \"args\": [\"$PROJECT_DIR/dist/index.js\"]"
    echo '  }'
fi

echo ""
echo "설정 완료! Claude Code를 재시작해주세요."
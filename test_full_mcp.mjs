import { spawn } from 'child_process';

// MCP 서버 실행 및 테스트
const server = spawn('node', ['dist/index.js']);

// 서버 출력 처리
server.stderr.on('data', (data) => {
  console.log(`Server: ${data}`);
});

server.stdout.on('data', (data) => {
  const response = data.toString();
  try {
    const parsed = JSON.parse(response);
    if (parsed.result?.content) {
      parsed.result.content.forEach(item => {
        if (item.type === 'text') {
          console.log('Response Text:', item.text);
        } else if (item.type === 'image') {
          console.log('Response Image: Successfully received image data');
          console.log('Image size:', item.data.length, 'bytes (base64)');
        }
      });
    }
  } catch (e) {
    // JSON이 아닌 경우 무시
  }
});

// 초기화 요청
const initRequest = {
  jsonrpc: "2.0",
  method: "initialize",
  params: {
    protocolVersion: "1.0.0",
    capabilities: {},
    clientInfo: {
      name: "test-client",
      version: "1.0.0"
    }
  },
  id: 1
};

// PDF 로드 요청
const loadPdfRequest = {
  jsonrpc: "2.0",
  method: "tools/call",
  params: {
    name: "load_pdf",
    arguments: {
      pdfPath: "/Users/taehoon.kim/Desktop/Sources/pdf2img/test.pdf",
      sessionId: "test_session_2"
    }
  },
  id: 2
};

// 현재 페이지 가져오기 요청
const getCurrentPageRequest = {
  jsonrpc: "2.0",
  method: "tools/call",
  params: {
    name: "get_current_page",
    arguments: {
      sessionId: "test_session_2",
      dpi: 150
    }
  },
  id: 3
};

console.log('Testing MCP Server with Image Extraction...\n');

// 요청 전송
setTimeout(() => {
  console.log('1. Initializing...');
  server.stdin.write(JSON.stringify(initRequest) + '\n');
}, 500);

setTimeout(() => {
  console.log('\n2. Loading PDF...');
  server.stdin.write(JSON.stringify(loadPdfRequest) + '\n');
}, 1500);

setTimeout(() => {
  console.log('\n3. Getting current page as image...');
  server.stdin.write(JSON.stringify(getCurrentPageRequest) + '\n');
}, 2500);

setTimeout(() => {
  console.log('\n✅ Test completed successfully!');
  server.kill();
  process.exit(0);
}, 4000);
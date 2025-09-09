import { spawn } from 'child_process';
import { createInterface } from 'readline';

// MCP 서버 실행 및 테스트
const server = spawn('node', ['dist/index.js']);

const rl = createInterface({
  input: process.stdin,
  output: process.stdout
});

// 서버 출력 처리
server.stderr.on('data', (data) => {
  console.log(`Server: ${data}`);
});

server.stdout.on('data', (data) => {
  const response = data.toString();
  console.log('Response:', response);
  
  try {
    const parsed = JSON.parse(response);
    console.log('Parsed:', JSON.stringify(parsed, null, 2));
  } catch (e) {
    // JSON이 아닌 경우 그대로 출력
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

// tools 목록 요청
const listToolsRequest = {
  jsonrpc: "2.0",
  method: "tools/list",
  params: {},
  id: 2
};

// PDF 로드 요청
const loadPdfRequest = {
  jsonrpc: "2.0",
  method: "tools/call",
  params: {
    name: "load_pdf",
    arguments: {
      pdfPath: "/Users/taehoon.kim/Desktop/Sources/pdf2img/test.pdf",
      sessionId: "test_session"
    }
  },
  id: 3
};

console.log('Testing MCP Server...\n');

// 요청 전송
setTimeout(() => {
  console.log('Sending initialize request...');
  server.stdin.write(JSON.stringify(initRequest) + '\n');
}, 500);

setTimeout(() => {
  console.log('Sending list tools request...');
  server.stdin.write(JSON.stringify(listToolsRequest) + '\n');
}, 1500);

setTimeout(() => {
  console.log('Sending load PDF request...');
  server.stdin.write(JSON.stringify(loadPdfRequest) + '\n');
}, 2500);

setTimeout(() => {
  console.log('\nTest completed.');
  server.kill();
  process.exit(0);
}, 4000);
#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { PDFDocument } from 'pdf-lib';
import * as fs from 'fs/promises';
import * as path from 'path';
import { createCanvas } from 'canvas';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

const server = new Server(
  {
    name: 'pdf-vision-analyzer',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

interface PDFSession {
  pdfPath: string;
  pageCount: number;
  currentPage: number;
  outputDir: string;
  extractedPages: Map<number, string>;
}

const sessions: Map<string, PDFSession> = new Map();

async function loadPDF(pdfPath: string, sessionId: string): Promise<PDFSession> {
  try {
    await fs.access(pdfPath);
  } catch {
    throw new Error(`PDF file not found: ${pdfPath}`);
  }

  const pdfBuffer = await fs.readFile(pdfPath);
  const pdfDoc = await PDFDocument.load(pdfBuffer);
  const pageCount = pdfDoc.getPageCount();
  
  const outputDir = path.join('./pdf_sessions', sessionId);
  await fs.mkdir(outputDir, { recursive: true });

  const session: PDFSession = {
    pdfPath,
    pageCount,
    currentPage: 1,
    outputDir,
    extractedPages: new Map(),
  };

  sessions.set(sessionId, session);
  return session;
}

async function extractPage(sessionId: string, pageNum: number, dpi: number = 150): Promise<string> {
  const session = sessions.get(sessionId);
  if (!session) {
    throw new Error(`Session not found: ${sessionId}`);
  }

  if (pageNum < 1 || pageNum > session.pageCount) {
    throw new Error(`Page ${pageNum} out of range (1-${session.pageCount})`);
  }

  if (session.extractedPages.has(pageNum)) {
    return session.extractedPages.get(pageNum)!;
  }

  const outputImagePath = path.join(session.outputDir, `page_${pageNum}.png`);
  
  try {
    // PDF 파일 읽기
    const data = new Uint8Array(await fs.readFile(session.pdfPath));
    
    // PDF 문서 로드
    const loadingTask = pdfjsLib.getDocument({
      data: data,
      useSystemFonts: true,
    });
    
    const pdfDoc = await loadingTask.promise;
    const page = await pdfDoc.getPage(pageNum);
    
    // 스케일 계산 (DPI 기반)
    const scale = dpi / 72; // PDF는 기본 72 DPI
    const viewport = page.getViewport({ scale });
    
    // Canvas 생성
    const canvas = createCanvas(viewport.width, viewport.height);
    const context = canvas.getContext('2d');
    
    // 페이지 렌더링
    const renderContext = {
      canvasContext: context,
      viewport: viewport,
    } as any;
    
    await page.render(renderContext).promise;
    
    // 이미지로 저장
    const buffer = canvas.toBuffer('image/png');
    await fs.writeFile(outputImagePath, buffer);
    
    session.extractedPages.set(pageNum, outputImagePath);
    
    return outputImagePath;
  } catch (error) {
    throw new Error(`Failed to convert page ${pageNum}: ${error}`);
  }
}

async function getPageAsBase64(sessionId: string, pageNum: number): Promise<string> {
  const session = sessions.get(sessionId);
  if (!session) {
    throw new Error(`Session not found: ${sessionId}`);
  }

  const imagePath = await extractPage(sessionId, pageNum);
  const imageBuffer = await fs.readFile(imagePath);
  return imageBuffer.toString('base64');
}

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'load_pdf',
        description: 'Load a PDF file and start a new analysis session',
        inputSchema: {
          type: 'object',
          properties: {
            pdfPath: {
              type: 'string',
              description: 'Path to the PDF file to analyze',
            },
            sessionId: {
              type: 'string',
              description: 'Unique identifier for this PDF session (optional, will be generated if not provided)',
            },
          },
          required: ['pdfPath'],
        },
      },
      {
        name: 'get_current_page',
        description: 'Get the current page as an image for vision analysis',
        inputSchema: {
          type: 'object',
          properties: {
            sessionId: {
              type: 'string',
              description: 'Session ID of the loaded PDF',
            },
            dpi: {
              type: 'number',
              description: 'DPI for image extraction (default: 150)',
            },
          },
          required: ['sessionId'],
        },
      },
      {
        name: 'go_to_page',
        description: 'Navigate to a specific page in the PDF',
        inputSchema: {
          type: 'object',
          properties: {
            sessionId: {
              type: 'string',
              description: 'Session ID of the loaded PDF',
            },
            pageNumber: {
              type: 'number',
              description: 'Page number to navigate to (1-indexed)',
            },
          },
          required: ['sessionId', 'pageNumber'],
        },
      },
      {
        name: 'next_page',
        description: 'Move to the next page in the PDF',
        inputSchema: {
          type: 'object',
          properties: {
            sessionId: {
              type: 'string',
              description: 'Session ID of the loaded PDF',
            },
          },
          required: ['sessionId'],
        },
      },
      {
        name: 'previous_page',
        description: 'Move to the previous page in the PDF',
        inputSchema: {
          type: 'object',
          properties: {
            sessionId: {
              type: 'string',
              description: 'Session ID of the loaded PDF',
            },
          },
          required: ['sessionId'],
        },
      },
      {
        name: 'get_pdf_info',
        description: 'Get information about the loaded PDF',
        inputSchema: {
          type: 'object',
          properties: {
            sessionId: {
              type: 'string',
              description: 'Session ID of the loaded PDF',
            },
          },
          required: ['sessionId'],
        },
      },
      {
        name: 'list_sessions',
        description: 'List all active PDF analysis sessions',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'get_pages_range',
        description: 'Get multiple pages at once as images for batch analysis',
        inputSchema: {
          type: 'object',
          properties: {
            sessionId: {
              type: 'string',
              description: 'Session ID of the loaded PDF',
            },
            startPage: {
              type: 'number',
              description: 'Starting page number (1-indexed)',
            },
            endPage: {
              type: 'number',
              description: 'Ending page number (1-indexed)',
            },
            dpi: {
              type: 'number',
              description: 'DPI for image extraction (default: 150)',
            },
          },
          required: ['sessionId', 'startPage', 'endPage'],
        },
      },
      {
        name: 'get_all_pages',
        description: 'Get all pages of the PDF as images',
        inputSchema: {
          type: 'object',
          properties: {
            sessionId: {
              type: 'string',
              description: 'Session ID of the loaded PDF',
            },
            dpi: {
              type: 'number',
              description: 'DPI for image extraction (default: 150)',
            },
          },
          required: ['sessionId'],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'load_pdf': {
        const { pdfPath, sessionId = `session_${Date.now()}` } = args as any;
        const session = await loadPDF(pdfPath, sessionId);
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                sessionId,
                pdfPath: session.pdfPath,
                pageCount: session.pageCount,
                currentPage: session.currentPage,
                message: `PDF loaded successfully. ${session.pageCount} pages available.`,
              }, null, 2),
            },
          ],
        };
      }

      case 'get_current_page': {
        const { sessionId, dpi = 150 } = args as any;
        const session = sessions.get(sessionId);
        
        if (!session) {
          throw new Error(`Session not found: ${sessionId}`);
        }

        const base64Image = await getPageAsBase64(sessionId, session.currentPage);
        
        return {
          content: [
            {
              type: 'image',
              data: base64Image,
              mimeType: 'image/png',
            },
            {
              type: 'text',
              text: JSON.stringify({
                sessionId,
                currentPage: session.currentPage,
                totalPages: session.pageCount,
                hasNext: session.currentPage < session.pageCount,
                hasPrevious: session.currentPage > 1,
              }, null, 2),
            },
          ],
        };
      }

      case 'go_to_page': {
        const { sessionId, pageNumber } = args as any;
        const session = sessions.get(sessionId);
        
        if (!session) {
          throw new Error(`Session not found: ${sessionId}`);
        }

        if (pageNumber < 1 || pageNumber > session.pageCount) {
          throw new Error(`Page ${pageNumber} out of range (1-${session.pageCount})`);
        }

        session.currentPage = pageNumber;
        const base64Image = await getPageAsBase64(sessionId, pageNumber);

        return {
          content: [
            {
              type: 'image',
              data: base64Image,
              mimeType: 'image/png',
            },
            {
              type: 'text',
              text: JSON.stringify({
                sessionId,
                currentPage: session.currentPage,
                totalPages: session.pageCount,
                hasNext: session.currentPage < session.pageCount,
                hasPrevious: session.currentPage > 1,
              }, null, 2),
            },
          ],
        };
      }

      case 'next_page': {
        const { sessionId } = args as any;
        const session = sessions.get(sessionId);
        
        if (!session) {
          throw new Error(`Session not found: ${sessionId}`);
        }

        if (session.currentPage >= session.pageCount) {
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  success: false,
                  message: 'Already at the last page',
                  currentPage: session.currentPage,
                  totalPages: session.pageCount,
                }, null, 2),
              },
            ],
          };
        }

        session.currentPage++;
        const base64Image = await getPageAsBase64(sessionId, session.currentPage);

        return {
          content: [
            {
              type: 'image',
              data: base64Image,
              mimeType: 'image/png',
            },
            {
              type: 'text',
              text: JSON.stringify({
                sessionId,
                currentPage: session.currentPage,
                totalPages: session.pageCount,
                hasNext: session.currentPage < session.pageCount,
                hasPrevious: session.currentPage > 1,
              }, null, 2),
            },
          ],
        };
      }

      case 'previous_page': {
        const { sessionId } = args as any;
        const session = sessions.get(sessionId);
        
        if (!session) {
          throw new Error(`Session not found: ${sessionId}`);
        }

        if (session.currentPage <= 1) {
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  success: false,
                  message: 'Already at the first page',
                  currentPage: session.currentPage,
                  totalPages: session.pageCount,
                }, null, 2),
              },
            ],
          };
        }

        session.currentPage--;
        const base64Image = await getPageAsBase64(sessionId, session.currentPage);

        return {
          content: [
            {
              type: 'image',
              data: base64Image,
              mimeType: 'image/png',
            },
            {
              type: 'text',
              text: JSON.stringify({
                sessionId,
                currentPage: session.currentPage,
                totalPages: session.pageCount,
                hasNext: session.currentPage < session.pageCount,
                hasPrevious: session.currentPage > 1,
              }, null, 2),
            },
          ],
        };
      }

      case 'get_pdf_info': {
        const { sessionId } = args as any;
        const session = sessions.get(sessionId);
        
        if (!session) {
          throw new Error(`Session not found: ${sessionId}`);
        }

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                sessionId,
                pdfPath: session.pdfPath,
                pageCount: session.pageCount,
                currentPage: session.currentPage,
                extractedPages: Array.from(session.extractedPages.keys()),
              }, null, 2),
            },
          ],
        };
      }

      case 'list_sessions': {
        const sessionList = Array.from(sessions.entries()).map(([id, session]) => ({
          sessionId: id,
          pdfPath: session.pdfPath,
          pageCount: session.pageCount,
          currentPage: session.currentPage,
        }));

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                sessions: sessionList,
                count: sessionList.length,
              }, null, 2),
            },
          ],
        };
      }

      case 'get_pages_range': {
        const { sessionId, startPage, endPage, dpi = 150 } = args as any;
        const session = sessions.get(sessionId);
        
        if (!session) {
          throw new Error(`Session not found: ${sessionId}`);
        }

        if (startPage < 1 || startPage > session.pageCount) {
          throw new Error(`Start page ${startPage} out of range (1-${session.pageCount})`);
        }

        if (endPage < 1 || endPage > session.pageCount) {
          throw new Error(`End page ${endPage} out of range (1-${session.pageCount})`);
        }

        if (startPage > endPage) {
          throw new Error(`Start page ${startPage} cannot be greater than end page ${endPage}`);
        }

        const pages = [];
        for (let pageNum = startPage; pageNum <= endPage; pageNum++) {
          const base64Image = await getPageAsBase64(sessionId, pageNum);
          pages.push({
            pageNumber: pageNum,
            image: {
              type: 'image',
              data: base64Image,
              mimeType: 'image/png',
            }
          });
        }

        return {
          content: [
            ...pages.map(p => p.image),
            {
              type: 'text',
              text: JSON.stringify({
                sessionId,
                startPage,
                endPage,
                totalPages: session.pageCount,
                pagesReturned: pages.length,
                pageNumbers: pages.map(p => p.pageNumber),
              }, null, 2),
            },
          ],
        };
      }

      case 'get_all_pages': {
        const { sessionId, dpi = 150 } = args as any;
        const session = sessions.get(sessionId);
        
        if (!session) {
          throw new Error(`Session not found: ${sessionId}`);
        }

        const pages = [];
        for (let pageNum = 1; pageNum <= session.pageCount; pageNum++) {
          const base64Image = await getPageAsBase64(sessionId, pageNum);
          pages.push({
            pageNumber: pageNum,
            image: {
              type: 'image',
              data: base64Image,
              mimeType: 'image/png',
            }
          });
        }

        return {
          content: [
            ...pages.map(p => p.image),
            {
              type: 'text',
              text: JSON.stringify({
                sessionId,
                totalPages: session.pageCount,
                pagesReturned: pages.length,
                pageNumbers: pages.map(p => p.pageNumber),
              }, null, 2),
            },
          ],
        };
      }

      default:
        throw new McpError(
          ErrorCode.MethodNotFound,
          `Unknown tool: ${name}`
        );
    }
  } catch (error) {
    if (error instanceof McpError) {
      throw error;
    }
    throw new McpError(
      ErrorCode.InternalError,
      `Tool execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('PDF Vision Analyzer MCP server running...');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
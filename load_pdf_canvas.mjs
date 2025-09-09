import { createCanvas } from 'canvas';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// PDF.js 설정
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function loadPDFWithCanvas() {
  const pdfPath = '/Users/taehoon.kim/Desktop/Sources/pdf2img/test.pdf';
  
  try {
    // pdfjs-dist 동적 import
    const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');
    
    console.log('📖 Loading PDF file with canvas...');
    
    // PDF 파일 읽기
    const data = new Uint8Array(await fs.readFile(pdfPath));
    
    // PDF 문서 로드
    const loadingTask = pdfjsLib.getDocument({
      data: data,
      useSystemFonts: true,
    });
    
    const pdfDoc = await loadingTask.promise;
    const numPages = pdfDoc.numPages;
    
    console.log(`✅ PDF loaded successfully!`);
    console.log(`📄 File: ${pdfPath}`);
    console.log(`📊 Total pages: ${numPages}`);
    
    // 첫 번째 페이지 가져오기
    console.log('\n🔄 Rendering page 1...');
    const page = await pdfDoc.getPage(1);
    
    // 페이지 크기 가져오기
    const viewport = page.getViewport({ scale: 2.0 });
    
    // Canvas 생성
    const canvas = createCanvas(viewport.width, viewport.height);
    const context = canvas.getContext('2d');
    
    // 페이지 렌더링
    const renderContext = {
      canvasContext: context,
      viewport: viewport,
    };
    
    await page.render(renderContext).promise;
    
    // 이미지로 저장
    const outputDir = './pdf_images';
    await fs.mkdir(outputDir, { recursive: true });
    
    const outputPath = path.join(outputDir, 'page-1.png');
    const buffer = canvas.toBuffer('image/png');
    await fs.writeFile(outputPath, buffer);
    
    console.log(`✅ Page rendered successfully!`);
    console.log(`📁 Saved to: ${outputPath}`);
    console.log(`📐 Dimensions: ${viewport.width} x ${viewport.height} pixels`);
    
    // 파일 크기 확인
    const stats = await fs.stat(outputPath);
    console.log(`📏 Image size: ${(stats.size / 1024).toFixed(2)} KB`);
    
    console.log('\n🎉 PDF loaded and rendered successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  }
}

loadPDFWithCanvas();
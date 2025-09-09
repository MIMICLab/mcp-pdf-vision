import { fromPath } from 'pdf2pic';
import { PDFDocument } from 'pdf-lib';
import fs from 'fs/promises';
import path from 'path';

async function openPDF() {
  const pdfPath = '/Users/taehoon.kim/Desktop/Sources/pdf2img/test.pdf';
  
  try {
    // PDF 정보 읽기
    console.log('📖 Opening PDF file...');
    const pdfBuffer = await fs.readFile(pdfPath);
    const pdfDoc = await PDFDocument.load(pdfBuffer);
    const pageCount = pdfDoc.getPageCount();
    
    console.log(`✅ PDF loaded successfully!`);
    console.log(`📄 File: ${pdfPath}`);
    console.log(`📊 Total pages: ${pageCount}`);
    
    // pdf2pic 설정
    const options = {
      density: 150,
      saveFilename: "page",
      savePath: "./pdf_images",
      format: "png",
      width: 2000,
      height: 2800
    };
    
    const convert = fromPath(pdfPath, options);
    
    // 첫 번째 페이지를 이미지로 변환
    console.log('\n🔄 Converting page 1 to image...');
    const pageNum = 1;
    
    await fs.mkdir('./pdf_images', { recursive: true });
    const result = await convert(pageNum);
    
    console.log(`✅ Page converted successfully!`);
    console.log(`📁 Saved to: ${result.path}`);
    
    // 파일 크기 확인
    const stats = await fs.stat(result.path);
    console.log(`📏 Image size: ${(stats.size / 1024).toFixed(2)} KB`);
    console.log(`📐 Dimensions: ${result.width} x ${result.height} pixels`);
    
    console.log('\n🎉 PDF opened and first page extracted successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  }
}

openPDF();
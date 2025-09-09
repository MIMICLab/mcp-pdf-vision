import pdfPoppler from 'pdf-poppler';
import { PDFDocument } from 'pdf-lib';
import fs from 'fs/promises';
import path from 'path';

async function loadPDFWithPoppler() {
  const pdfPath = '/Users/taehoon.kim/Desktop/Sources/pdf2img/test.pdf';
  
  try {
    // PDF 정보 읽기
    console.log('📖 Loading PDF file with pdf-poppler...');
    const pdfBuffer = await fs.readFile(pdfPath);
    const pdfDoc = await PDFDocument.load(pdfBuffer);
    const pageCount = pdfDoc.getPageCount();
    
    console.log(`✅ PDF loaded successfully!`);
    console.log(`📄 File: ${pdfPath}`);
    console.log(`📊 Total pages: ${pageCount}`);
    
    // 출력 디렉토리 생성
    const outputPath = './pdf_images';
    await fs.mkdir(outputPath, { recursive: true });
    
    // Poppler 옵션 설정
    const opts = {
      format: 'png',
      out_dir: outputPath,
      out_prefix: 'page',
      page: 1
    };
    
    console.log('\n🔄 Converting PDF to image using poppler...');
    
    // PDF를 이미지로 변환
    await pdfPoppler.convert(pdfPath, opts);
    
    console.log(`✅ Conversion completed!`);
    console.log(`📁 Image saved to: ${outputPath}/page-1.png`);
    
    // 생성된 이미지 확인
    const imagePath = path.join(outputPath, 'page-1.png');
    const stats = await fs.stat(imagePath);
    console.log(`📏 Image size: ${(stats.size / 1024).toFixed(2)} KB`);
    
    console.log('\n🎉 PDF loaded and converted successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.message.includes('poppler')) {
      console.log('\n💡 Poppler is not installed. On macOS, you can install it with:');
      console.log('   brew install poppler');
    }
  }
}

loadPDFWithPoppler();
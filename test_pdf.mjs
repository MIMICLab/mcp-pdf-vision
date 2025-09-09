import { PDFDocument } from 'pdf-lib';
import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';

async function loadAndExtractPDF() {
  const pdfPath = '/Users/taehoon.kim/Desktop/Sources/pdf2img/test.pdf';
  
  try {
    // PDF 파일 읽기
    const pdfBuffer = await fs.readFile(pdfPath);
    const pdfDoc = await PDFDocument.load(pdfBuffer);
    const pageCount = pdfDoc.getPageCount();
    
    console.log(`✅ PDF loaded successfully!`);
    console.log(`📄 File: ${pdfPath}`);
    console.log(`📊 Total pages: ${pageCount}`);
    
    // 출력 디렉토리 생성
    const outputDir = path.join('./pdf_output');
    await fs.mkdir(outputDir, { recursive: true });
    
    // 첫 번째 페이지 추출 및 변환
    console.log('\n🔄 Extracting first page as image...');
    const singlePageDoc = await PDFDocument.create();
    const [copiedPage] = await singlePageDoc.copyPages(pdfDoc, [0]);
    singlePageDoc.addPage(copiedPage);
    
    const pdfBytes = await singlePageDoc.save();
    const tempPdfPath = path.join(outputDir, 'temp_page_1.pdf');
    await fs.writeFile(tempPdfPath, pdfBytes);
    
    // PDF를 PNG 이미지로 변환
    const outputImagePath = path.join(outputDir, 'page_1.png');
    await sharp(tempPdfPath, { density: 150 })
      .png()
      .toFile(outputImagePath);
    
    console.log(`✅ Page 1 extracted to: ${outputImagePath}`);
    
    // 임시 PDF 파일 삭제
    await fs.unlink(tempPdfPath);
    
    // 이미지 파일 정보 출력
    const stats = await fs.stat(outputImagePath);
    console.log(`📏 Image size: ${(stats.size / 1024).toFixed(2)} KB`);
    
    console.log('\n🎉 PDF processing completed successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

loadAndExtractPDF();
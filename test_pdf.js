const { PDFDocument } = require('pdf-lib');
const fs = require('fs').promises;
const path = require('path');
const sharp = require('sharp');

async function loadAndExtractPDF() {
  const pdfPath = '/Users/taehoon.kim/Desktop/Sources/pdf2img/test.pdf';
  
  try {
    // PDF 파일 읽기
    const pdfBuffer = await fs.readFile(pdfPath);
    const pdfDoc = await PDFDocument.load(pdfBuffer);
    const pageCount = pdfDoc.getPageCount();
    
    console.log(`PDF loaded successfully!`);
    console.log(`Total pages: ${pageCount}`);
    
    // 출력 디렉토리 생성
    const outputDir = path.join('./pdf_output');
    await fs.mkdir(outputDir, { recursive: true });
    
    // 첫 번째 페이지 추출
    console.log('\nExtracting first page...');
    const singlePageDoc = await PDFDocument.create();
    const [copiedPage] = await singlePageDoc.copyPages(pdfDoc, [0]);
    singlePageDoc.addPage(copiedPage);
    
    const pdfBytes = await singlePageDoc.save();
    const tempPdfPath = path.join(outputDir, 'temp_page_1.pdf');
    await fs.writeFile(tempPdfPath, pdfBytes);
    
    // PDF를 이미지로 변환
    const outputImagePath = path.join(outputDir, 'page_1.png');
    await sharp(tempPdfPath, { density: 150 })
      .png()
      .toFile(outputImagePath);
    
    console.log(`Page 1 extracted to: ${outputImagePath}`);
    
    // 임시 PDF 파일 삭제
    await fs.unlink(tempPdfPath);
    
    // 이미지 파일 정보 출력
    const stats = await fs.stat(outputImagePath);
    console.log(`Image size: ${stats.size} bytes`);
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

loadAndExtractPDF();
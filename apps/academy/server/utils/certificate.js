const PDFDocument = require('pdfkit');

const PMC_GREEN = '#385246';
const PMC_ACCENT = '#9BC7AE';
const PMC_DARK = '#1F3529';

// Streams a landscape "Certificate of Completion" PDF straight to an
// Express response. Called only after a QuizAttempt with passed=true exists.
function streamCertificate(res, { name, courseTitle, score, total, certificateId, date }) {
  const doc = new PDFDocument({ layout: 'landscape', size: 'A4', margin: 0 });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="certificate-${certificateId}.pdf"`);
  doc.pipe(res);

  const { width, height } = doc.page;

  // Background + border
  doc.rect(0, 0, width, height).fill('#FFFFFF');
  doc.lineWidth(6).strokeColor(PMC_GREEN).rect(24, 24, width - 48, height - 48).stroke();
  doc.lineWidth(1.5).strokeColor(PMC_ACCENT).rect(36, 36, width - 72, height - 72).stroke();

  doc.fillColor(PMC_GREEN)
    .font('Helvetica-Bold').fontSize(14)
    .text('PMC GLOBAL ACADEMY', 0, 70, { align: 'center' });

  doc.fillColor(PMC_DARK)
    .font('Helvetica-Bold').fontSize(34)
    .text('Certificate of Completion', 0, 110, { align: 'center' });

  doc.fillColor('#555').font('Helvetica').fontSize(13)
    .text('This is to certify that', 0, 175, { align: 'center' });

  doc.fillColor(PMC_GREEN).font('Helvetica-Bold').fontSize(30)
    .text(name, 0, 200, { align: 'center' });

  doc.fillColor('#555').font('Helvetica').fontSize(13)
    .text('has successfully completed the course', 0, 250, { align: 'center' });

  doc.fillColor(PMC_DARK).font('Helvetica-Bold').fontSize(20)
    .text(courseTitle, 0, 275, { align: 'center' });

  doc.fillColor('#555').font('Helvetica').fontSize(12)
    .text(`and passed the certification quiz with a score of ${score}/${total}`, 0, 310, { align: 'center' });

  doc.font('Helvetica').fontSize(11).fillColor('#777')
    .text(`Date: ${date}`, 80, height - 110)
    .text(`Certificate ID: ${certificateId}`, 80, height - 92);

  doc.font('Helvetica-Bold').fontSize(12).fillColor(PMC_GREEN)
    .text('PMC Global Academy', width - 280, height - 110, { width: 200, align: 'right' })
    .font('Helvetica').fontSize(10).fillColor('#777')
    .text('Verified Certificate', width - 280, height - 92, { width: 200, align: 'right' });

  doc.end();
}

module.exports = { streamCertificate };

import puppeteer, { type PDFOptions } from 'puppeteer'
import { config } from '../config'

const PMC_GREEN = '#385246'
const PMC_ACCENT = '#9BC7AE'
const PMC_DARK = '#1F3529'

const DEFAULT_PDF_OPTIONS: PDFOptions = {
  format: 'a4',
  landscape: true,
  printBackground: true,
  margin: { top: '0', right: '0', bottom: '0', left: '0' },
}

export type CertificateData = {
  name: string
  courseTitle: string
  score: number
  total: number
  certificateId: string
  date: string
}

/**
 * Renders the academy's "Certificate of Completion" as a PDF.
 *
 * Ported from the academy-demo's `utils/certificate.js`, which drew the same
 * layout with pdfkit straight onto an Express response. This server already
 * generates every other PDF (prescriptions, see lib/prescription.ts) with
 * puppeteer + an HTML template against a shared browserless instance, so the
 * certificate is redrawn as HTML/CSS instead of pulling in a second PDF
 * library for one document type.
 */
export async function generateCertificatePDF(data: CertificateData): Promise<Buffer> {
  const browser = await puppeteer.connect({
    browserWSEndpoint: config.browserlessWsUrl,
    defaultViewport: { width: 1600, height: 1131 },
  })

  const page = await browser.newPage()

  const template = `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Certificate ${data.certificateId}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: Helvetica, Arial, sans-serif;
    width: 1600px;
    height: 1131px;
    position: relative;
    background: #FFFFFF;
    color: ${PMC_DARK};
  }
  .border-outer {
    position: absolute;
    inset: 24px;
    border: 6px solid ${PMC_GREEN};
  }
  .border-inner {
    position: absolute;
    inset: 36px;
    border: 1.5px solid ${PMC_ACCENT};
  }
  .content {
    position: absolute;
    inset: 0;
    text-align: center;
  }
  .brand {
    color: ${PMC_GREEN};
    font-weight: bold;
    font-size: 24px;
    letter-spacing: 2px;
    margin-top: 70px;
  }
  .heading {
    color: ${PMC_DARK};
    font-weight: bold;
    font-size: 58px;
    margin-top: 28px;
  }
  .lead {
    color: #555;
    font-size: 22px;
    margin-top: 40px;
  }
  .name {
    color: ${PMC_GREEN};
    font-weight: bold;
    font-size: 50px;
    margin-top: 12px;
  }
  .lead2 {
    color: #555;
    font-size: 22px;
    margin-top: 20px;
  }
  .course-title {
    color: ${PMC_DARK};
    font-weight: bold;
    font-size: 34px;
    margin-top: 12px;
  }
  .score {
    color: #555;
    font-size: 20px;
    margin-top: 20px;
  }
  .footer-left {
    position: absolute;
    left: 80px;
    bottom: 70px;
    text-align: left;
    font-size: 18px;
    color: #777;
    line-height: 1.6;
  }
  .footer-right {
    position: absolute;
    right: 80px;
    bottom: 70px;
    width: 340px;
    text-align: right;
  }
  .footer-right .org {
    font-weight: bold;
    font-size: 20px;
    color: ${PMC_GREEN};
  }
  .footer-right .verified {
    font-size: 16px;
    color: #777;
    margin-top: 4px;
  }
</style>
</head>
<body>
  <div class="border-outer"></div>
  <div class="border-inner"></div>
  <div class="content">
    <div class="brand">PMC GLOBAL ACADEMY</div>
    <div class="heading">Certificate of Completion</div>
    <div class="lead">This is to certify that</div>
    <div class="name">${data.name}</div>
    <div class="lead2">has successfully completed the course</div>
    <div class="course-title">${data.courseTitle}</div>
    <div class="score">and passed the certification quiz with a score of ${data.score}/${data.total}</div>
  </div>
  <div class="footer-left">
    <div>Date: ${data.date}</div>
    <div>Certificate ID: ${data.certificateId}</div>
  </div>
  <div class="footer-right">
    <div class="org">PMC Global Academy</div>
    <div class="verified">Verified Certificate</div>
  </div>
</body>
</html>
`

  await page.setContent(template, {
    waitUntil: ['domcontentloaded', 'networkidle0'],
    timeout: 30000,
  })

  const buffer = Buffer.from(await page.pdf(DEFAULT_PDF_OPTIONS))
  await browser.close()

  return buffer
}

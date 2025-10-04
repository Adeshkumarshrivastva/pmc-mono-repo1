import puppeteer, { type PDFOptions } from 'puppeteer'
import type { Prisma } from '../generated/prisma'
import type { Medicine } from '../routes/experts/experts.input'
import dayjs from './dayjs'
import { config } from '../config'
import { getLogoAsBase64 } from './utils'
import { formatDateTimeRange } from './date'

const DEFAULT_PDF_OPTIONS: PDFOptions = {
  format: 'a4',
  printBackground: true,
  margin: {
    top: '0',
    right: '0',
    bottom: '0',
    left: '0',
  },
}

export type PrescriptionWithBooking = Prisma.PrescriptionGetPayload<{
  include: {
    booking: {
      include: {
        expert: true
      }
    }
  }
}>

export async function generatePrescriptionPDF(prescription: PrescriptionWithBooking): Promise<Buffer> {
  const medicines = prescription.medicines as unknown as Medicine[]
  const browser = await puppeteer.connect({
    browserWSEndpoint: config.browserlessWsUrl,
    defaultViewport: { width: 1280, height: 720 },
  })

  const page = await browser.newPage()
  const logoBase64 = await getLogoAsBase64()
  const template = `
      <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Prescription #${prescription.id}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: 'Arial', sans-serif;
          padding: 40px;
          color: #333;
        }

        .header {
          border-bottom: 3px solid #385246;
          padding-bottom: 20px;
          margin-bottom: 30px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .header .logo {
          max-width: 150px;
          max-height: 80px;
          object-fit: contain;
        }

        .header .header-text {
          flex: 1;
        }

        .header h1 {
          color: #385246;
          font-size: 28px;
          margin-bottom: 10px;
        }

        .header .expert-info {
          font-size: 14px;
          color: #666;
        }

        .section {
          margin-bottom: 25px;
        }

        .section-title {
          font-size: 16px;
          font-weight: bold;
          color: #385246;
          margin-bottom: 10px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .info-row {
          display: flex;
          margin-bottom: 8px;
          font-size: 14px;
        }

        .info-label {
          font-weight: 600;
          width: 150px;
          color: #555;
        }

        .info-value {
          color: #333;
        }

        .medicines {
          margin-top: 15px;
        }

        .medicine-item {
          padding: 15px;
          margin-bottom: 10px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          background-color: #f9fafb;
        }

        .medicine-name {
          font-size: 16px;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 8px;
        }

        .medicine-details {
          font-size: 14px;
          color: #6b7280;
          margin-bottom: 4px;
        }

        .notes-box {
          padding: 15px;
          background-color: #fef3c7;
          border-left: 4px solid #f59e0b;
          border-radius: 4px;
          margin-top: 10px;
        }

        .notes-text {
          font-size: 14px;
          line-height: 1.6;
          color: #92400e;
        }

        .footer {
          margin-top: 50px;
          padding-top: 20px;
          border-top: 2px solid #e5e7eb;
          text-align: right;
        }

        .signature {
          margin-top: 30px;
          font-size: 14px;
        }

        .signature-line {
          border-top: 1px solid #333;
          width: 250px;
          margin-left: auto;
          margin-top: 5px;
          padding-top: 5px;
        }

        .prescription-id {
          font-size: 12px;
          color: #9ca3af;
          margin-top: 10px;
        }
      </style>
    </head>
      <body>
      <div class="header">
        <div class="header-text">
          <h1>Medical Prescription</h1>
        </div>
        ${logoBase64 ? `<img src="${logoBase64}" alt="Company Logo" class="logo" />` : ''}
      </div>

      <div class="section">
        <div class="section-title">Patient Information</div>
        <div class="info-row">
          <span class="info-label">Patient Name:</span>
          <span class="info-value">${prescription.booking.patientName}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Date:</span>
          <span class="info-value">${dayjs(prescription.createdAt).format('DD MMM YYYY')}</span>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Booking Details</div>
        <div class="info-row">
          <span class="info-label">Service:</span>
          <span class="info-value">${prescription.booking.serviceName || 'N/A'}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Booking Date & Time:</span>
          <span class="info-value">${formatDateTimeRange({ startDateTime: prescription.booking.startDateTime, endDateTime: prescription.booking.endDateTime })}</span>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Prescription</div>
        <div class="medicines">
          ${medicines
            .map(
              (medicine, index: number) => `
            <div class="medicine-item">
              <div class="medicine-name">${index + 1}. ${medicine.name}</div>
              ${medicine.dosage ? `<div class="medicine-details"><strong>Dosage:</strong> ${medicine.dosage}</div>` : ''}
              ${medicine.frequency ? `<div class="medicine-details"><strong>Frequency:</strong> ${medicine.frequency}</div>` : ''}
              ${medicine.duration ? `<div class="medicine-details"><strong>Duration:</strong> ${medicine.duration}</div>` : ''}
              ${medicine.instructions ? `<div class="medicine-details"><strong>Instructions:</strong> ${medicine.instructions}</div>` : ''}
            </div>
          `,
            )
            .join('')}
        </div>
      </div>

      ${
        prescription.notes
          ? `
        <div class="section">
          <div class="section-title">Additional Notes</div>
          <div class="notes-box">
            <div class="notes-text">${prescription.notes}</div>
          </div>
        </div>
      `
          : ''
      }

      <div class="footer">
        <div class="signature">
          <div class="signature-line">
            ${prescription.booking.expert.name}
          </div>
        </div>
        <div class="prescription-id">
          Prescription ID: ${prescription.id}
        </div>
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

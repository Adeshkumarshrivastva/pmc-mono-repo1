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
  font-family: Arial, sans-serif;
  padding: 40px;
  color: #333;
  font-size: 14px;
  line-height: 1.5;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  border-bottom: 2px solid #ddd;
  padding-bottom: 8px;
  margin-bottom: 16px;
}

.clinic-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1 1 60%;
  word-break: break-word;
}

.clinic-logo img {
  max-width: 150px;
  max-height: 80px;
  object-fit: contain;
}

.clinic-details strong {
  font-weight: bold;
}

.doctor-info {
  text-align: right;
  width: 35%;
}

.doctor-name {
  font-weight: bold;
}

.section {
  margin-bottom: 30px;
}

.patient-info {
  border-bottom: 1px solid #bbb;
  padding-bottom: 8px;
}

.patient-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
}

.rx-heading {
  font-size: 16px;
  font-weight: bold;
  margin: 8px 0;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 16px;
}

th,
td {
  border: 1px solid #bbb;
  padding: 8px;
  vertical-align: top;
}

th {
  background-color: #f5f5f5;
  font-weight: bold;
  text-align: left;
}

.col-sl {
  width: 5%;
  text-align: center;
}

.col-name {
  width: 45%;
  text-transform: uppercase;
}

.col-frequency {
  width: 20%;
}

.col-duration {
  width: 30%;
}

.doctor-signature {
  font-weight: 600;
  text-align: right;
  margin-top: 40px;
  margin-right: 30px;
}

.additional-notes strong {
  display: block;
  margin-bottom: 2px;
}

.small-note {
  position: fixed;
  bottom: 18px;
  left: 0;
  right: 0;
  font-size: 12px;
  color: #666;
  text-align: center;
  background: white;
  padding-bottom: 12px;
}

.note-line {
  border: 0;
  border-top: 1px solid #ddd;
  margin: 5px 40px 0 40px;
}

</style>
</head>
<body>

  <div class="header">
    <div class="clinic-info">
      <div class="clinic-logo">${logoBase64 ? `<img src="${logoBase64}" alt="Clinic Logo"/>` : ''}</div>
      <div class="clinic-details">
        <div><strong>Positive Mind Care</strong></div>
        <div>804 (A), Arcadia, South City II, Sector 49, Gurugram, Fatehpur, Haryana 122018</div>
        <div>+91-8920530832</div>
      </div>
    </div>
    <div class="doctor-info">
      <div class="doctor-name">${prescription.booking.expert.name}</div>
      ${prescription.booking.expert.qualifications ? `<div>${prescription.booking.expert.qualifications}</div>` : ''}
    </div>
  </div>

  <div class="section patient-info">
    <div class="patient-row">
      <div><strong>Patient Name:</strong> ${prescription.booking.patientName}</div>
      <div><strong>Patient ID:</strong> ${prescription.booking.patientId || prescription.booking.id}</div>
    </div>
    <div><strong>Date:</strong> ${dayjs(prescription.createdAt).format('DD MMM YYYY')}</div>
    <div><strong>Booking Date & Time:</strong>
      ${formatDateTimeRange({ startDateTime: prescription.booking.startDateTime, endDateTime: prescription.booking.endDateTime })}
    </div>
  </div>

  <div class="section">
    <div class="rx-heading">Prescription</div>
   <table>
  <thead>
    <tr>
      <th class="col-sl">Sl</th>
      <th class="col-name">Medicine Name</th>
      <th class="col-frequency">Frequency</th>
      <th class="col-duration">Duration / Instructions</th>
    </tr>
  </thead>
  <tbody>
    ${medicines
      .map(
        (medicine, index: number) => `
      <tr>
        <td class="col-sl">${index + 1}</td>
        <td class="col-name">${medicine.name}</td>
        <td class="col-frequency">${medicine.frequency || '-'}</td>
        <td class="col-duration">${
          [
            medicine.duration ? `Duration: ${medicine.duration}` : '',
            medicine.instructions ? `Instructions: ${medicine.instructions}` : '',
          ]
            .filter(Boolean)
            .join('<br />') || '-'
        }</td>
      </tr>
    `,
      )
      .join('')}
  </tbody>
</table>

  </div>

  ${prescription.notes ? `<div class="section additional-notes"><strong>Additional Notes</strong><div>${prescription.notes}</div></div>` : ''}

  <div class="doctor-signature">${prescription.booking.expert.name}</div>

  <div class="small-note">
    Booking ID: ${prescription.booking.id}
    <hr class="note-line" />
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

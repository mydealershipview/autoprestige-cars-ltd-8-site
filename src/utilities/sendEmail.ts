import { Resend } from 'resend'
import { WebhookData, VehicleReservationData } from '@/types/webhook'

const resend = new Resend(process.env.RESEND_API_KEY)

interface EmailResult {
  success: boolean
  error?: string
  emailId?: string
}

export async function sendEnquiryEmail(data: WebhookData): Promise<EmailResult> {
  try {
    const fromEmail = process.env.EMAIL_FROM || 'admin@forms.mydealershipview.com'
    const toEmail = process.env.EMAIL_TO || 'support@mydealershipview.com'

    const subject = getEmailSubject(data.enquiryType)
    const htmlContent = generateEmailTemplate(data)

    const result = await resend.emails.send({
      from: fromEmail,
      to: [toEmail, 'muhammadhassanchannel786@gmail.com'],
      subject: subject,
      html: htmlContent,
    })

    return {
      success: true,
      emailId: result.data?.id,
    }
  } catch (error) {
    console.error('Error sending email:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown email error',
    }
  }
}

export async function sendVehicleReservationEmail(data: VehicleReservationData): Promise<EmailResult> {
  try {
    const fromEmail = process.env.EMAIL_FROM || 'admin@forms.mydealershipview.com'
    const toEmail = process.env.EMAIL_TO || 'support@mydealershipview.com'

    const subject = 'New Vehicle Reservation Request'
    const htmlContent = generateVehicleReservationEmailTemplate(data)

    const result = await resend.emails.send({
      from: fromEmail,
      to: [toEmail, 'muhammadhassanchannel786@gmail.com'],
      subject: subject,
      html: htmlContent,
    })

    return {
      success: true,
      emailId: result.data?.id,
    }
  } catch (error) {
    console.error('Error sending vehicle reservation email:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown email error',
    }
  }
}

function getEmailSubject(enquiryType: WebhookData['enquiryType']): string {
  switch (enquiryType) {
    case 'part-exchange':
      return 'New Part Exchange Enquiry'
    case 'find-your-next-car':
      return 'New Vehicle Enquiry'
    case 'book-appointment':
      return 'New Appointment Request'
    case 'request-finance':
      return 'New Finance Application'
    default:
      return 'New Website Enquiry'
  }
}

function formatEnquiryType(value: unknown): string {
  if (typeof value !== 'string' || !value.trim()) {
    return 'GENERAL ENQUIRY'
  }

  return value.replace('-', ' ').toUpperCase()
}

function generateEmailTemplate(data: WebhookData): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${getEmailSubject(data.enquiryType)}</title>
      <style>
        * {
        color: white;
        }
        div {
          color: white;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          line-height: 1.6;
          color: white !important;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #000000;
        }
        .email-container {
          background-color: #111111;
          border-radius: 8px;
          padding: 30px;
          border: 1px solid rgba(255,255,255,0.1);
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.5);
        }
        .header {
          background-color: #3b82f6;
          color: white;
          padding: 20px;
          border-radius: 8px 8px 0 0;
          margin: -30px -30px 30px -30px;
        }
        .header h1 {
          margin: 0;
          font-size: 24px;
        }
        .section {
          margin-bottom: 25px;
          padding: 15px;
          background-color: #1f232a;
          border-radius: 6px;
          border-left: 4px solid #3b82f6;
        }
        .section h3 {
          margin-top: 0;
          color: #60a5fa;
          font-size: 18px;
        }
        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-top: 10px;
        }
        .info-item {
          background-color: #111111;
          padding: 10px;
          border-radius: 4px;
          border: 1px solid #4a4f58;
        }
        .info-item strong {
          color: #60a5fa;
          display: block;
          font-size: 12px;
          text-transform: uppercase;
          margin-bottom: 4px;
        }
        .full-width {
          grid-column: 1 / -1;
        }
        .priority-badge {
          display: inline-block;
          background-color: #ef4444;
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: bold;
          text-transform: uppercase;
        }
        .notes {
          background-color: #1f2937;
          border: 1px solid #374151;
          padding: 15px;
          border-radius: 6px;
          margin-top: 15px;
        }
        .footer {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid rgba(255,255,255,0.1);
          color: #9ca3af;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <h1>${getEmailSubject(data.enquiryType)}</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">New enquiry received from your website</p>
        </div>

        ${generatePersonalInfoSection(data)}
        ${generateVehicleSection(data)}
        ${generateUserVehicleSection(data)}
        ${generateFindYourNextCarSection(data)}
        ${generateTestDriveSection(data)}
        ${generateEmploymentSection(data)}
        ${generateFinanceSection(data)}
        ${generateBankSection(data)}
        ${generateNotesSection(data)}

        <div class="footer">
          <p><strong>Enquiry Time:</strong> ${new Date().toLocaleString('en-GB', { 
            timeZone: 'Europe/London',
            dateStyle: 'full',
            timeStyle: 'short'
          })}</p>
          <p><strong>Enquiry Type:</strong> ${formatEnquiryType(data.enquiryType)}</p>
          <p>Please respond to this enquiry as soon as possible to maintain good customer service.</p>
        </div>
      </div>
    </body>
    </html>
  `
}

function generatePersonalInfoSection(data: WebhookData): string {
  const personal = data.personal
  
  return `
    <div class="section">
      <h3>📞 Customer Information</h3>
      <div class="info-grid">
        <div class="info-item">
          <strong>First Name</strong>
          ${personal.firstName}
        </div>
        <div class="info-item">
          <strong>Last Name</strong>
          ${personal.lastName}
        </div>
        <div class="info-item">
          <strong>Email</strong>
          ${personal.email}
        </div>
        <div class="info-item">
          <strong>Phone</strong>
          ${personal.phoneNumber}
        </div>
        ${personal.dateOfBirth ? `
        <div class="info-item">
          <strong>Date of Birth</strong>
          ${personal.dateOfBirth}
        </div>
        ` : ''}
        ${personal.maritalStatus ? `
        <div class="info-item">
          <strong>Marital Status</strong>
          ${personal.maritalStatus}
        </div>
        ` : ''}
        ${personal.gender ? `
        <div class="info-item">
          <strong>Gender</strong>
          ${personal.gender}
        </div>
        ` : ''}
        ${personal.dependents ? `
        <div class="info-item">
          <strong>Dependents</strong>
          ${personal.dependents}
        </div>
        ` : ''}
        ${personal.address ? `
        <div class="info-item full-width">
          <strong>Address</strong>
          ${personal.address}
        </div>
        ` : ''}
      </div>
    </div>
  `
}

function generateVehicleSection(data: WebhookData): string {
  if (!data.vehicle) return ''
  
  const vehicle = data.vehicle
  const hasVehicleInfo = vehicle.make || vehicle.model || vehicle.registration || vehicle.price
  
  if (!hasVehicleInfo) return ''
  
  return `
    <div class="section">
      <h3>🚗 Vehicle of Interest</h3>
      <div class="info-grid">
        ${vehicle.make ? `
        <div class="info-item">
          <strong>Make</strong>
          ${vehicle.make}
        </div>
        ` : ''}
        ${vehicle.model ? `
        <div class="info-item">
          <strong>Model</strong>
          ${vehicle.model}
        </div>
        ` : ''}
        ${vehicle.registration ? `
        <div class="info-item">
          <strong>Registration</strong>
          ${vehicle.registration}
        </div>
        ` : ''}
        ${vehicle.year ? `
        <div class="info-item">
          <strong>Year</strong>
          ${vehicle.year}
        </div>
        ` : ''}
        ${vehicle.mileage ? `
        <div class="info-item">
          <strong>Mileage</strong>
          ${vehicle.mileage}
        </div>
        ` : ''}
        ${vehicle.price ? `
        <div class="info-item">
          <strong>Price</strong>
          £${vehicle.price.toLocaleString()}
        </div>
        ` : ''}
        ${vehicle.initialDeposit ? `
        <div class="info-item">
          <strong>Initial Deposit</strong>
          £${vehicle.initialDeposit.toLocaleString()}
        </div>
        ` : ''}
        ${vehicle.loanTerm ? `
        <div class="info-item">
          <strong>Loan Term</strong>
          ${vehicle.loanTerm} months
        </div>
        ` : ''}
        ${vehicle.apr ? `
        <div class="info-item">
          <strong>APR</strong>
          ${vehicle.apr}%
        </div>
        ` : ''}
        ${vehicle.monthlyPayment ? `
        <div class="info-item">
          <strong>Monthly Payment</strong>
          £${vehicle.monthlyPayment.toLocaleString()}
        </div>
        ` : ''}
      </div>
    </div>
  `
}

function generateUserVehicleSection(data: WebhookData): string {
  if (!data.userVehicle) return ''
  
  const userVehicle = data.userVehicle
  const hasUserVehicleInfo = userVehicle.make || userVehicle.model || userVehicle.registration
  
  if (!hasUserVehicleInfo) return ''
  
  return `
    <div class="section">
      <h3>🔄 Customer's Current Vehicle (Part Exchange)</h3>
      <div class="info-grid">
        ${userVehicle.make ? `
        <div class="info-item">
          <strong>Make</strong>
          ${userVehicle.make}
        </div>
        ` : ''}
        ${userVehicle.model ? `
        <div class="info-item">
          <strong>Model</strong>
          ${userVehicle.model}
        </div>
        ` : ''}
        ${userVehicle.registration ? `
        <div class="info-item">
          <strong>Registration</strong>
          ${userVehicle.registration}
        </div>
        ` : ''}
        ${userVehicle.year ? `
        <div class="info-item">
          <strong>Year</strong>
          ${userVehicle.year}
        </div>
        ` : ''}
        ${userVehicle.mileage ? `
        <div class="info-item">
          <strong>Mileage</strong>
          ${userVehicle.mileage}
        </div>
        ` : ''}
        ${userVehicle.recentValuations ? `
        <div class="info-item full-width">
          <strong>Recent Valuations</strong>
          ${userVehicle.recentValuations}
        </div>
        ` : ''}
      </div>
    </div>
  `
}

function generateTestDriveSection(data: WebhookData): string {
  if (!data.testDrive) return ''
  
  const testDrive = data.testDrive
  
  return `
    <div class="section">
      <h3>🏃 Test Drive Information</h3>
      <div class="info-grid">
        <div class="info-item">
          <strong>Test Drive Requested</strong>
          ${testDrive.isTestDrive ? '<span class="priority-badge">YES</span>' : 'No'}
        </div>
        ${testDrive.isTestDrive && testDrive.testDriveDate ? `
        <div class="info-item">
          <strong>Preferred Date</strong>
          ${testDrive.testDriveDate}
        </div>
        ` : ''}
        ${testDrive.isTestDrive && testDrive.testDriveTime ? `
        <div class="info-item">
          <strong>Preferred Time</strong>
          ${testDrive.testDriveTime}
        </div>
        ` : ''}
        ${testDrive.additionalRequirements ? `
        <div class="info-item full-width">
          <strong>Additional Requirements</strong>
          ${testDrive.additionalRequirements}
        </div>
        ` : ''}
      </div>
    </div>
  `
}

function generateEmploymentSection(data: WebhookData): string {
  if (!data.employment) return ''
  
  const employment = data.employment
  
  return `
    <div class="section">
      <h3>💼 Employment Information</h3>
      <div class="info-grid">
        <div class="info-item">
          <strong>Employment Status</strong>
          ${employment.status}
        </div>
        ${employment.employerName ? `
        <div class="info-item">
          <strong>Employer</strong>
          ${employment.employerName}
        </div>
        ` : ''}
        ${employment.annualIncome ? `
        <div class="info-item">
          <strong>Annual Income</strong>
          £${employment.annualIncome.toLocaleString()}
        </div>
        ` : ''}
        ${employment.grossAnnualIncome ? `
        <div class="info-item">
          <strong>Gross Annual Income</strong>
          £${employment.grossAnnualIncome.toLocaleString()}
        </div>
        ` : ''}
        ${employment.timeInEmployment ? `
        <div class="info-item full-width">
          <strong>Time in Employment</strong>
          ${employment.timeInEmployment}
        </div>
        ` : ''}
      </div>
    </div>
  `
}

function generateFinanceSection(data: WebhookData): string {
  if (!data.finance) return ''
  
  const finance = data.finance
  
  return `
    <div class="section">
      <h3>💰 Financial Information</h3>
      <div class="info-grid">
        ${finance.monthlyExpenses ? `
        <div class="info-item">
          <strong>Monthly Expenses</strong>
          £${finance.monthlyExpenses.toLocaleString()}
        </div>
        ` : ''}
        ${finance.existenceCreditCommitments ? `
        <div class="info-item">
          <strong>Existing Credit Commitments</strong>
          £${finance.existenceCreditCommitments.toLocaleString()}
        </div>
        ` : ''}
      </div>
    </div>
  `
}

function generateBankSection(data: WebhookData): string {
  if (!data.bank) return ''
  
  const bank = data.bank
  const hasBankInfo = bank.accountHolderName || bank.bankName || bank.sortCode
  
  if (!hasBankInfo) return ''
  
  return `
    <div class="section">
      <h3>🏦 Banking Information</h3>
      <div class="info-grid">
        ${bank.accountHolderName ? `
        <div class="info-item">
          <strong>Account Holder</strong>
          ${bank.accountHolderName}
        </div>
        ` : ''}
        ${bank.bankName ? `
        <div class="info-item">
          <strong>Bank Name</strong>
          ${bank.bankName}
        </div>
        ` : ''}
        ${bank.sortCode ? `
        <div class="info-item">
          <strong>Sort Code</strong>
          ${bank.sortCode}
        </div>
        ` : ''}
        ${bank.accountNumber ? `
        <div class="info-item">
          <strong>Account Number</strong>
          ${'*'.repeat(bank.accountNumber.length - 4)}${bank.accountNumber.slice(-4)}
        </div>
        ` : ''}
        ${bank.timeWithBank ? `
        <div class="info-item full-width">
          <strong>Time with Bank</strong>
          ${bank.timeWithBank}
        </div>
        ` : ''}
      </div>
    </div>
  `
}

function generateNotesSection(data: WebhookData): string {
  if (!data.notes) return ''
  
  return `
    <div class="notes">
      <h3 style="margin-top: 0; color: #fbbf24;">📝 Additional Notes</h3>
      <p style="margin-bottom: 0; white-space: pre-wrap; color: white;">${data.notes}</p>
    </div>
  `
}

function generateFindYourNextCarSection(data: WebhookData): string {
  if (!data.findYourNextCar) return ''
  
  const findCar = data.findYourNextCar
  
  return `
    <div class="section">
      <h3>🔍 Vehicle Search Preferences</h3>
      <div class="info-grid">
        <div class="info-item">
          <strong>Enquiry Type</strong>
          ${formatEnquiryType(findCar.enquiryType)}
        </div>
        ${findCar.vehiclePreferences ? `
        <div class="info-item full-width">
          <strong>Vehicle Preferences</strong>
          ${findCar.vehiclePreferences}
        </div>
        ` : ''}
      </div>
    </div>
  `
}

function generateVehicleReservationEmailTemplate(data: VehicleReservationData): string {
  const customerName = `${data.customerDetails.firstName} ${data.customerDetails.lastName}`.trim()
  const vehicleTitle = `${data.vehicleDetails.make} ${data.vehicleDetails.model}`.trim()
  const reservationAmount = (data.amount / 100).toFixed(2) // Convert from pence to pounds
  
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Vehicle Reservation Request</title>
      <style>
        * {
          color: white;
        }
        div {
          color: white;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          line-height: 1.6;
          color: white;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #000000;
        }
        .email-container {
          background-color: #111111;
          border-radius: 8px;
          padding: 30px;
          border: 1px solid rgba(255,255,255,0.1);
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.5);
        }
        .header {
          background-color: #3b82f6;
          color: white;
          padding: 20px;
          border-radius: 8px 8px 0 0;
          margin: -30px -30px 30px -30px;
        }
        .header h1 {
          margin: 0;
          font-size: 24px;
        }
        .priority-alert {
          background-color: #ef4444;
          color: white;
          padding: 15px;
          border-radius: 6px;
          margin-bottom: 20px;
          text-align: center;
          font-weight: bold;
        }
        .section {
          margin-bottom: 25px;
          padding: 15px;
          background-color: #1f232a;
          border-radius: 6px;
          border-left: 4px solid #3b82f6;
        }
        .section h3 {
          margin-top: 0;
          color: #60a5fa;
          font-size: 18px;
        }
        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-top: 10px;
        }
        .info-item {
          background-color: #111111;
          padding: 10px;
          border-radius: 4px;
          border: 1px solid #4a4f58;
        }
        .info-item strong {
          color: #60a5fa;
          display: block;
          font-size: 12px;
          text-transform: uppercase;
          margin-bottom: 4px;
        }
        .full-width {
          grid-column: 1 / -1;
        }
        .amount-highlight {
          background-color: #1f232a;
          color: white;
          padding: 20px;
          border-radius: 8px;
          text-align: center;
          margin: 20px 0;
          border: 1px solid #3b82f6;
        }
        .amount-highlight h2 {
          margin: 0;
          font-size: 28px;
          color: #60a5fa;
        }
        .footer {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid rgba(255,255,255,0.1);
          color: #9ca3af;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <h1>🚗 Vehicle Reservation Request</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Customer wants to reserve a vehicle</p>
        </div>

        <div class="priority-alert">
          ⚠️ PRIORITY: Customer is ready to make a reservation payment!
        </div>

        <div class="amount-highlight">
          <h2>£${reservationAmount}</h2>
          <p style="margin: 5px 0 0 0; opacity: 0.9;">Reservation Amount</p>
        </div>

        <div class="section">
          <h3>🚗 Vehicle Details</h3>
          <div class="info-grid">
            <div class="info-item">
              <strong>Make</strong>
              ${data.vehicleDetails.make}
            </div>
            <div class="info-item">
              <strong>Model</strong>
              ${data.vehicleDetails.model}
            </div>
            <div class="info-item">
              <strong>Registration</strong>
              ${data.vehicleDetails.registration}
            </div>
            ${data.vehicleDetails.stockId ? `
            <div class="info-item">
              <strong>Stock ID</strong>
              ${data.vehicleDetails.stockId}
            </div>
            ` : ''}
          </div>
        </div>

        <div class="section">
          <h3>👤 Customer Details</h3>
          <div class="info-grid">
            <div class="info-item">
              <strong>Title</strong>
              ${data.customerDetails.title}
            </div>
            <div class="info-item">
              <strong>First Name</strong>
              ${data.customerDetails.firstName}
            </div>
            <div class="info-item">
              <strong>Last Name</strong>
              ${data.customerDetails.lastName}
            </div>
            <div class="info-item">
              <strong>Email</strong>
              ${data.customerDetails.email}
            </div>
            <div class="info-item">
              <strong>Phone</strong>
              ${data.customerDetails.phone}
            </div>
            <div class="info-item full-width">
              <strong>Address</strong>
              ${data.customerDetails.address}
            </div>
          </div>
        </div>

        <div class="section">
          <h3>📋 Next Steps</h3>
          <ol style="margin: 0; padding-left: 20px;">
            <li><strong>Contact Customer:</strong> Call ${customerName} at ${data.customerDetails.phone}</li>
            <li><strong>Confirm Availability:</strong> Verify that ${vehicleTitle} (${data.vehicleDetails.registration}) is still available</li>
            <li><strong>Process Payment:</strong> Set up the reservation payment process for £${reservationAmount}</li>
            <li><strong>Send Confirmation:</strong> Provide written confirmation of the reservation</li>
            <li><strong>Schedule Viewing:</strong> Arrange for customer to view/collect the vehicle</li>
          </ol>
        </div>

        <div class="footer">
          <p><strong>Reservation Time:</strong> ${new Date().toLocaleString('en-GB', { 
            timeZone: 'Europe/London',
            dateStyle: 'full',
            timeStyle: 'short'
          })}</p>
          <p><strong>Customer:</strong> ${customerName}</p>
          <p><strong>Vehicle:</strong> ${vehicleTitle} (${data.vehicleDetails.registration})</p>
          <p style="color: #ef4444; font-weight: bold;">⚡ Urgent: Customer is ready to pay - please respond immediately!</p>
        </div>
      </div>
    </body>
    </html>
  `
}

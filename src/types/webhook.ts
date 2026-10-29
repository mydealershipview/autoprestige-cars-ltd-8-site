export type WebhookData = {
  website?: unknown
  advertiserId: string
  enquiryType: 'part-exchange' | 'find-your-next-car' | 'book-appointment' | 'request-finance' | 'general-contact'
  personal: {
    title: string | null
    firstName: string
    lastName: string
    email: string
    phoneNumber: string
    gender: string | null
    countryOfOrigin: string | null
    dateOfBirth: string | null
    maritalStatus: string | null
    dependents: number | null
    address: string | null
  }
  vehicle: {
    stockId: string | null
    make: string | null
    model: string | null
    registration: string | null
    mileage: string | null
    year: string | null
    recentValuations: string | null
    price: number | null
    initialDeposit: number | null
    loanTerm: number | null
    apr: number | null
    amountToFinance: number | null
    monthlyPayment: number | null
  } | null
  // User's own vehicle for part-exchange (separate from the vehicle they're interested in)
  userVehicle: {
    make: string | null
    model: string | null
    registration: string | null
    mileage: string | null
    year: string | null
    recentValuations: string | null
  } | null
  findYourNextCar: {
    enquiryType: 'stock-vehicle' | 'help-finding-car' | 'general-enquiry' | 'car-enhancement' | 'finance' | 'warranty' | 'feedback' | 'part-exchange'
    vehiclePreferences: string | null
  } | null
  testDrive: {
    isTestDrive: boolean
    testDriveDate: string | null
    testDriveTime: string | null
    additionalRequirements: string | null
  } | null
  employment: {
    status: 
      | 'Employed Full-Time'
      | 'Employed Part-Time'
      | 'Self-Employed'
      | 'Unemployed'
      | 'Retired'
      | 'Student'
      | 'Annuitant'
      | 'Pensioner'
      | 'Other'
    annualIncome: number
    employerName: string
    timeInEmployment: string
    grossAnnualIncome: number
  } | null
  finance: {
    monthlyExpenses: number
    existenceCreditCommitments: number
  } | null
  bank: {
    accountHolderName: string
    bankName: string
    sortCode: string
    accountNumber: string
    timeWithBank: string
  } | null
  notes: string | null
}

export type VehicleReservationData = {
  website?: unknown
  customerDetails: {
    title: string
    firstName: string
    lastName: string
    email: string
    phone: string
    address: string
  }
  vehicleDetails: {
    make: string
    model: string
    registration: string
    stockId?: string
  }
  amount: number // Amount in pence
}

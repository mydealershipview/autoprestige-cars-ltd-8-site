'use client'

import React, { useState } from 'react'
import type { WebhookData } from '@/types/webhook'

type EmploymentStatus = NonNullable<WebhookData['employment']>['status']
type EmploymentStatusField = EmploymentStatus | ''

interface FinanceFormState {
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth: string
  maritalStatus: string
  gender: string
  countryOfOrigin: string
  dependents: string
  businessName: string
  businessType: string
  yearStarted: string
  businessPhone: string
  vatNumber: string
  homeAddress: string
  yearsAtAddress: string
  employmentStatus: EmploymentStatusField
  annualIncome: string
  grossAnnualIncome: string
  employerName: string
  timeInEmployment: string
  monthlyExpenses: string
  creditCommitments: string
  accountHolderName: string
  bankName: string
  sortCode: string
  accountNumber: string
  timeWithBank: string
  notes: string
  acceptedTerms: boolean
}

const employmentStatusOptions: EmploymentStatus[] = [
  'Employed Full-Time',
  'Employed Part-Time',
  'Self-Employed',
  'Unemployed',
  'Retired',
  'Student',
  'Annuitant',
  'Pensioner',
  'Other',
]

const durationOptions = [
  'Less than 1 year',
  '1 - 2 years',
  '3 - 5 years',
  '6 - 10 years',
  'More than 10 years',
]

const initialState: FinanceFormState = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  dateOfBirth: '',
  maritalStatus: '',
  gender: '',
  countryOfOrigin: 'United Kingdom',
  dependents: '',
  businessName: '',
  businessType: '',
  yearStarted: '',
  businessPhone: '',
  vatNumber: '',
  homeAddress: '',
  yearsAtAddress: '',
  employmentStatus: '',
  annualIncome: '',
  grossAnnualIncome: '',
  employerName: '',
  timeInEmployment: '',
  monthlyExpenses: '',
  creditCommitments: '',
  accountHolderName: '',
  bankName: '',
  sortCode: '',
  accountNumber: '',
  timeWithBank: '',
  notes: '',
  acceptedTerms: false,
}

const inputClass =
  'w-full rounded-md bg-zinc-900 border border-white/20 text-white placeholder-zinc-500 px-4 py-3 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 !transition-colors text-sm'
const labelClass = 'block text-xs font-semibold tracking-widest text-zinc-200 uppercase mb-2'
const sectionClass = 'rounded-2xl border border-white/10 bg-zinc-950/70 p-5 md:p-6 space-y-5'

function toNumber(value: unknown): number {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : 0
  }

  if (typeof value !== 'string') {
    return 0
  }

  const parsed = Number(value.replace(/,/g, '').trim())
  return Number.isFinite(parsed) ? parsed : 0
}

export default function FinanceApplicationForm() {
  const [formData, setFormData] = useState<FinanceFormState>(initialState)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name } = e.target
    const value =
      e.target instanceof HTMLInputElement && e.target.type === 'checkbox'
        ? e.target.checked
        : e.target.value

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const notes = [
        'Finance application submitted from finance page.',
        `Years at Address: ${formData.yearsAtAddress}`,
        formData.businessName ? `Business Name: ${formData.businessName}` : '',
        formData.businessType ? `Business Type: ${formData.businessType}` : '',
        formData.yearStarted ? `Business Year Started: ${formData.yearStarted}` : '',
        formData.businessPhone ? `Business Phone: ${formData.businessPhone}` : '',
        formData.vatNumber ? `VAT Number: ${formData.vatNumber}` : 'VAT Number: Not provided',
        formData.notes ? `Additional Notes: ${formData.notes}` : '',
        `Terms accepted: ${formData.acceptedTerms ? 'Yes' : 'No'}`,
      ]
        .filter(Boolean)
        .join('\n') || null

      const payload: WebhookData = {
        advertiserId: process.env.NEXT_PUBLIC_DEALER_ID || 'b1cc0a28-8ea3-4964-a6bf-07e2a2677a70',
        enquiryType: 'request-finance',
        personal: {
          title: null,
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          email: formData.email.trim(),
          phoneNumber: formData.phone.trim(),
          gender: formData.gender || null,
          countryOfOrigin: formData.countryOfOrigin.trim() || null,
          dateOfBirth: formData.dateOfBirth.trim() || null,
          maritalStatus: formData.maritalStatus || null,
          dependents: formData.dependents ? toNumber(formData.dependents) : null,
          address: formData.homeAddress.trim() || null,
        },
        vehicle: null,
        userVehicle: null,
        findYourNextCar: null,
        testDrive: null,
        employment: {
          status: formData.employmentStatus || 'Other',
          annualIncome: toNumber(formData.annualIncome),
          employerName: formData.employerName.trim() || formData.businessName.trim() || 'Not provided',
          timeInEmployment: formData.timeInEmployment || 'Not provided',
          grossAnnualIncome: toNumber(formData.grossAnnualIncome),
        },
        finance: {
          monthlyExpenses: toNumber(formData.monthlyExpenses),
          existenceCreditCommitments: toNumber(formData.creditCommitments),
        },
        bank: {
          accountHolderName: formData.accountHolderName.trim() || 'Not provided',
          bankName: formData.bankName.trim() || 'Not provided',
          sortCode: formData.sortCode.trim() || 'Not provided',
          accountNumber: formData.accountNumber.trim() || 'Not provided',
          timeWithBank: formData.timeWithBank || 'Not provided',
        },
        notes,
      }

      const response = await fetch('/api/submit-form', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData?.error || 'Failed to submit finance application')
      }

      setSubmitted(true)
      setFormData(initialState)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="rounded-2xl border border-blue-500/30 bg-blue-500/10 p-6 text-center">
        <h3 className="text-xl font-black tracking-wider uppercase mb-2 text-white">Application Submitted</h3>
        <p className="text-white/70 mb-6">Your finance application has been sent to our team.</p>
        <button
          type="button"
          onClick={() => setSubmitted(false)}
          className="rounded-md bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 text-xs font-black tracking-widest uppercase !transition-colors"
        >
          Submit Another Application
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="space-y-2">
        <h2 className="text-2xl md:text-3xl font-black tracking-[0.1em] uppercase text-white">Finance Application</h2>
        <p className="text-zinc-300">Complete your vehicle finance application</p>
      </div>

      <section className={sectionClass}>
        <h3 className="text-sm font-black tracking-widest uppercase text-white">Personal Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className={labelClass}>First Name *</label>
            <input id="firstName" name="firstName" required value={formData.firstName} onChange={handleChange} className={inputClass} placeholder="John" />
          </div>
          <div>
            <label htmlFor="lastName" className={labelClass}>Last Name *</label>
            <input id="lastName" name="lastName" required value={formData.lastName} onChange={handleChange} className={inputClass} placeholder="Smith" />
          </div>
          <div>
            <label htmlFor="email" className={labelClass}>Email Address *</label>
            <input id="email" name="email" type="email" required value={formData.email} onChange={handleChange} className={inputClass} placeholder="your@email.com" />
          </div>
          <div>
            <label htmlFor="phone" className={labelClass}>Phone Number *</label>
            <input id="phone" name="phone" type="tel" required value={formData.phone} onChange={handleChange} className={inputClass} placeholder="+44 123 456 7890" />
          </div>
          <div>
            <label htmlFor="dateOfBirth" className={labelClass}>Date of Birth</label>
            <input
              id="dateOfBirth"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              className={inputClass}
              placeholder="dd/mm/yyyy"
              pattern="^\\d{2}/\\d{2}/\\d{4}$"
              title="Use dd/mm/yyyy format"
            />
          </div>
          <div>
            <label htmlFor="maritalStatus" className={labelClass}>Marital Status</label>
            <select id="maritalStatus" name="maritalStatus" value={formData.maritalStatus} onChange={handleChange} className={inputClass}>
              <option value="">Select status</option>
              <option value="Single">Single</option>
              <option value="Married">Married</option>
              <option value="Divorced">Divorced</option>
              <option value="Widowed">Widowed</option>
              <option value="Separated">Separated</option>
              <option value="Civil Partnership">Civil Partnership</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label htmlFor="gender" className={labelClass}>Gender</label>
            <select id="gender" name="gender" value={formData.gender} onChange={handleChange} className={inputClass}>
              <option value="">Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </select>
          </div>
          <div>
            <label htmlFor="countryOfOrigin" className={labelClass}>Country of Origin</label>
            <input id="countryOfOrigin" name="countryOfOrigin" value={formData.countryOfOrigin} onChange={handleChange} className={inputClass} />
          </div>
          <div>
            <label htmlFor="dependents" className={labelClass}>Number of Dependents</label>
            <select id="dependents" name="dependents" value={formData.dependents} onChange={handleChange} className={inputClass}>
              <option value="">Select number</option>
              {Array.from({ length: 11 }).map((_, index) => (
                <option key={index} value={String(index)}>{index}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section className={sectionClass}>
        <h3 className="text-sm font-black tracking-widest uppercase text-white">Business Information</h3>
        <p className="text-sm text-zinc-400">Complete this section if you are self-employed or have business income</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="businessName" className={labelClass}>Business Name</label>
            <input id="businessName" name="businessName" value={formData.businessName} onChange={handleChange} className={inputClass} placeholder="Your Business Ltd" />
          </div>
          <div>
            <label htmlFor="businessType" className={labelClass}>Business Type</label>
            <select id="businessType" name="businessType" value={formData.businessType} onChange={handleChange} className={inputClass}>
              <option value="">Select type</option>
              <option value="Sole Trader">Sole Trader</option>
              <option value="Limited Company">Limited Company</option>
              <option value="Partnership">Partnership</option>
              <option value="Freelancer">Freelancer</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label htmlFor="yearStarted" className={labelClass}>Year Started</label>
            <input id="yearStarted" name="yearStarted" type="number" min="1900" max="2100" value={formData.yearStarted} onChange={handleChange} className={inputClass} placeholder="2020" />
          </div>
          <div>
            <label htmlFor="businessPhone" className={labelClass}>Business Phone Number</label>
            <input id="businessPhone" name="businessPhone" type="tel" value={formData.businessPhone} onChange={handleChange} className={inputClass} placeholder="+44 123 456 7890" />
          </div>
          <div className="md:col-span-2">
            <label htmlFor="vatNumber" className={labelClass}>VAT Number</label>
            <input id="vatNumber" name="vatNumber" value={formData.vatNumber} onChange={handleChange} className={inputClass} placeholder="GB123456789" />
            <p className="mt-2 text-xs text-zinc-500">Leave blank if not VAT registered</p>
          </div>
        </div>
      </section>

      <section className={sectionClass}>
        <h3 className="text-sm font-black tracking-widest uppercase text-white">Address Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="homeAddress" className={`${labelClass} mb-0`}>Home Address</label>
              <span className="text-xs text-blue-300">Enter Manually</span>
            </div>
            <input id="homeAddress" name="homeAddress" value={formData.homeAddress} onChange={handleChange} className={inputClass} placeholder="Start typing your address..." />
          </div>
          <div>
            <label htmlFor="yearsAtAddress" className={labelClass}>Years at Address</label>
            <select id="yearsAtAddress" name="yearsAtAddress" value={formData.yearsAtAddress} onChange={handleChange} className={inputClass}>
              <option value="">Select duration</option>
              {durationOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section className={sectionClass}>
        <h3 className="text-sm font-black tracking-widest uppercase text-white">Employment Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="employmentStatus" className={labelClass}>Employment Status</label>
            <select id="employmentStatus" name="employmentStatus" value={formData.employmentStatus} onChange={handleChange} className={inputClass}>
              <option value="">Select status</option>
              {employmentStatusOptions.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="annualIncome" className={labelClass}>Annual Income</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">GBP</span>
              <input id="annualIncome" name="annualIncome" type="number" min="0" value={formData.annualIncome} onChange={handleChange} className={`${inputClass} pl-11`} placeholder="25000" />
            </div>
          </div>
          <div>
            <label htmlFor="grossAnnualIncome" className={labelClass}>Gross Annual Income</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">GBP</span>
              <input id="grossAnnualIncome" name="grossAnnualIncome" type="number" min="0" value={formData.grossAnnualIncome} onChange={handleChange} className={`${inputClass} pl-11`} placeholder="30000" />
            </div>
            <p className="mt-2 text-xs text-zinc-500">Income before taxes and deductions</p>
          </div>
          <div>
            <label htmlFor="employerName" className={labelClass}>Employer Name</label>
            <input id="employerName" name="employerName" value={formData.employerName} onChange={handleChange} className={inputClass} placeholder="Company Name" />
          </div>
          <div>
            <label htmlFor="timeInEmployment" className={labelClass}>Time in Employment</label>
            <select id="timeInEmployment" name="timeInEmployment" value={formData.timeInEmployment} onChange={handleChange} className={inputClass}>
              <option value="">Select duration</option>
              {durationOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section className={sectionClass}>
        <h3 className="text-sm font-black tracking-widest uppercase text-white">Financial Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="monthlyExpenses" className={labelClass}>Monthly Expenses</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">GBP</span>
              <input id="monthlyExpenses" name="monthlyExpenses" type="number" min="0" value={formData.monthlyExpenses} onChange={handleChange} className={`${inputClass} pl-11`} placeholder="1500" />
            </div>
            <p className="mt-2 text-xs text-zinc-500">Including rent, utilities, loans, etc.</p>
          </div>
          <div>
            <label htmlFor="creditCommitments" className={labelClass}>Existing Credit Commitments</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">GBP</span>
              <input id="creditCommitments" name="creditCommitments" type="number" min="0" value={formData.creditCommitments} onChange={handleChange} className={`${inputClass} pl-11`} placeholder="0" />
            </div>
            <p className="mt-2 text-xs text-zinc-500">Monthly payments on loans, credit cards, etc.</p>
          </div>
        </div>
      </section>

      <section className={sectionClass}>
        <h3 className="text-sm font-black tracking-widest uppercase text-white">Bank Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="accountHolderName" className={labelClass}>Account Holder Name</label>
            <input id="accountHolderName" name="accountHolderName" value={formData.accountHolderName} onChange={handleChange} className={inputClass} placeholder="John Smith" />
          </div>
          <div>
            <label htmlFor="bankName" className={labelClass}>Bank Name</label>
            <input id="bankName" name="bankName" value={formData.bankName} onChange={handleChange} className={inputClass} placeholder="Barclays Bank" />
          </div>
          <div>
            <label htmlFor="sortCode" className={labelClass}>Sort Code</label>
            <input id="sortCode" name="sortCode" value={formData.sortCode} onChange={handleChange} className={inputClass} placeholder="20-20-20" />
          </div>
          <div>
            <label htmlFor="accountNumber" className={labelClass}>Account Number</label>
            <input id="accountNumber" name="accountNumber" value={formData.accountNumber} onChange={handleChange} className={inputClass} placeholder="12345678" />
          </div>
          <div>
            <label htmlFor="timeWithBank" className={labelClass}>Time with Bank</label>
            <select id="timeWithBank" name="timeWithBank" value={formData.timeWithBank} onChange={handleChange} className={inputClass}>
              <option value="">Select duration</option>
              {durationOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section className={sectionClass}>
        <h3 className="text-sm font-black tracking-widest uppercase text-white">Additional Notes</h3>
        <label htmlFor="notes" className={labelClass}>Notes</label>
        <textarea
          id="notes"
          name="notes"
          rows={5}
          value={formData.notes}
          onChange={handleChange}
          className={`${inputClass} resize-none`}
          placeholder="Any additional information you would like to provide about your application, financial circumstances, or specific requirements..."
        />
        <p className="text-xs text-zinc-500">Optional: Include any relevant details that may help with your application</p>
      </section>

      <section className={sectionClass}>
        <h3 className="text-sm font-black tracking-widest uppercase text-white">Terms and Conditions</h3>
        <a href="#finance-terms" className="inline-block text-sm text-blue-300 hover:text-blue-200 underline">
          Read Full Terms
        </a>

        <label className="flex items-start gap-3 text-sm text-white/85">
          <input
            type="checkbox"
            name="acceptedTerms"
            checked={formData.acceptedTerms}
            onChange={handleChange}
            required
            className="mt-1"
          />
          I have read and agree to the Terms and Conditions for this finance application. I understand that credit checks will be performed. *
        </label>

        {error && <p className="text-sm text-blue-300">{error}</p>}

        <button
          type="submit"
          disabled={isSubmitting || !formData.acceptedTerms}
          className="w-full rounded-md bg-blue-500 hover:bg-blue-600 disabled:opacity-60 disabled:cursor-not-allowed text-white px-8 py-4 text-xs font-black tracking-widest uppercase !transition-colors"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Application'}
        </button>
      </section>
    </form>
  )
}

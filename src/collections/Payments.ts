import type { CollectionConfig } from 'payload'
import { isAdmin } from '@/access/isAdmin'

export const Payments: CollectionConfig = {
  slug: 'payments',
  access: {
    create: isAdmin,
    delete: isAdmin,
    read: isAdmin,
    update: isAdmin,
  },
  admin: {
    defaultColumns: ['customerName', 'vehicleDetails.make', 'vehicleDetails.model', 'amount', 'paymentStatus', 'createdAt'],
    useAsTitle: 'customerName',
  },
  fields: [
    // Customer Information
    {
      name: 'customerDetails',
      type: 'group',
      fields: [
        {
          name: 'title',
          type: 'text',
        },
        {
          name: 'firstName',
          type: 'text',
        },
        {
          name: 'lastName',
          type: 'text',
        },
        {
          name: 'email',
          type: 'email',
        },
        {
          name: 'phone',
          type: 'text',
        },
        {
          name: 'address',
          type: 'textarea',
        },
      ],
    },
    // Vehicle Information
    {
      name: 'vehicleDetails',
      type: 'group',
      fields: [
        {
          name: 'make',
          type: 'text',
        },
        {
          name: 'model',
          type: 'text',
        },
        {
          name: 'registration',
          type: 'text',
        },
        {
          name: 'stockId',
          type: 'text',
          required: false,
        },
      ],
    },
    // Payment Information
    {
      name: 'amount',
      type: 'number',
      admin: {
        description: 'Amount in GBP (pence)',
      },
    },
    {
      name: 'currency',
      type: 'text',
      defaultValue: 'GBP',
    },
    // Atoa Payment Details
    {
      name: 'atoaPaymentDetails',
      type: 'group',
      fields: [
        {
          name: 'paymentRequestId',
          type: 'text',
          unique: true,
        },
        {
          name: 'orderId',
          type: 'text',
          unique: true,
        },
        {
          name: 'customerId',
          type: 'text',
        },
        {
          name: 'paymentUrl',
          type: 'text',
        },
        {
          name: 'qrCodeUrl',
          type: 'text',
        },
        {
          name: 'paymentIdempotencyId',
          type: 'text',
        },
      ],
    },
    // Payment Status
    {
      name: 'paymentStatus',
      type: 'select',
      options: [
        {
          label: 'Pending',
          value: 'PENDING',
        },
        {
          label: 'Completed',
          value: 'COMPLETED',
        },
        {
          label: 'Failed',
          value: 'FAILED',
        },
        {
          label: 'Expired',
          value: 'EXPIRED',
        },
        {
          label: 'Cancelled',
          value: 'CANCELLED',
        },
      ],
      defaultValue: 'PENDING',
    },
    // Status Details from Atoa
    {
      name: 'statusDetails',
      type: 'group',
      fields: [
        {
          name: 'statusUpdateDate',
          type: 'date',
        },
        {
          name: 'isoStatus',
          type: 'group',
          fields: [
            {
              name: 'code',
              type: 'text',
            },
            {
              name: 'name',
              type: 'text',
            },
          ],
        },
        {
          name: 'errorDescription',
          type: 'text',
        },
      ],
    },
    // Additional payment info
    {
      name: 'paidAmount',
      type: 'number',
      admin: {
        description: 'Actual amount paid in GBP (pence)',
      },
    },
    {
      name: 'tipAmount',
      type: 'number',
      admin: {
        description: 'Tip amount in GBP (pence)',
      },
    },
    // Computed field for display
    {
      name: 'customerName',
      type: 'text',
      admin: {
        readOnly: true,
      },
      hooks: {
        beforeChange: [
          ({ siblingData }) => {
            if (siblingData.customerDetails?.firstName && siblingData.customerDetails?.lastName) {
              return `${siblingData.customerDetails.firstName} ${siblingData.customerDetails.lastName}`
            }
            return undefined
          },
        ],
      },
    },
    // Webhook signature verification
    {
      name: 'signatureHash',
      type: 'text',
      admin: {
        readOnly: true,
      },
    },
    // Reservation message
    {
      name: 'reservationMessage',
      type: 'text',
      defaultValue: 'You\'re making this payment to make a reservation for this vehicle subject to availability',
      admin: {
        readOnly: true,
      },
    },
  ],
  hooks: {
    beforeChange: [
      ({ data, operation }) => {
        // Generate orderId if not present
        if (operation === 'create' && !data.atoaPaymentDetails?.orderId) {
          data.atoaPaymentDetails = {
            ...data.atoaPaymentDetails,
            orderId: `RES-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          }
        }
        
        // Generate customerId if not present
        if (operation === 'create' && !data.atoaPaymentDetails?.customerId) {
          data.atoaPaymentDetails = {
            ...data.atoaPaymentDetails,
            customerId: `CUST-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          }
        }
        
        return data
      },
    ],
  },
}

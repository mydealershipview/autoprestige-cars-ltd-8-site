"use client"

import { motion, AnimatePresence } from "motion/react"
import { X, Phone, Mail, Send } from "lucide-react"
import { CustomButton } from "@/components/ui/custom-button"
import { Card } from "@/components/ui/card"

type Contact = { label: string; isPrimary?: boolean | null | undefined; id?: string | null | undefined; }
type Phone = Contact & { number: string }
type Email = Contact & { email: string }

interface ContactModalProps {
  isOpen: boolean
  onClose: () => void
  onButtonClick: () => void
  phoneNumbers: Phone[]
  emailAddresses: Email[]
}

export default function ContactModal({ isOpen, onClose, onButtonClick, phoneNumbers, emailAddresses }: ContactModalProps) {
  const handleButtonClick = () => {
    onButtonClick()
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <Card className="w-full max-w-md bg-white shadow-2xl border-0 overflow-hidden relative">
              {/* Close Button */}
              <CustomButton
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 h-8 w-8 p-0 z-10"
              >
                <X className="w-4 h-4" />
              </CustomButton>

              {/* Content */}
              <div className="p-8">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-heading font-semibold text-slate-900 mb-2">
                    Quick Contact
                  </h2>
                  <p className="text-gray-600 font-sans text-sm">
                    Get in touch with our dealership team
                  </p>
                </div>

                {/* Contact Options */}
                <div className="space-y-4 mb-8">
                  {/* Phone */}
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3 mb-2">
                      <Phone className="w-5 h-5 text-primary" />
                      <span className="font-medium text-slate-900 font-sans">Phone</span>
                    </div>
                    <div className="space-y-1 text-sm">
                      {phoneNumbers.map((phoneNumber: Phone) => (
                        <a
                          key={phoneNumber.number}
                          href={`tel:${phoneNumber.number}`}
                          className="block text-gray-700 hover:text-primary transition-colors"
                        >
                          {phoneNumber.number}
                        </a>
                      ))}
                    </div>
                  </div>

                  {/* Email */}
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3 mb-2">
                      <Mail className="w-5 h-5 text-accent" />
                      <span className="font-medium text-slate-900 font-sans">Email</span>
                    </div>
                    {emailAddresses.map((emailAddress: Email) => (
                      <a
                        key={emailAddress.email}
                        href={`mailto:${emailAddress.email}`}
                        className="text-sm text-gray-700 hover:text-primary transition-colors break-all"
                      >
                        {emailAddress.email}
                      </a>
                    ))}
                  </div>

                  {/* Hours */}
                  {/* <div className="p-4 bg-gray-50 rounded-xl">
                    <div className="text-sm">
                      <div className="font-medium text-slate-900 mb-1">Opening Hours</div>
                      <div className="text-gray-600 space-y-0.5">
                        <div>Mon-Sat: 10:00 - 18:00</div>
                        <div>Sunday: 10:00 - 15:00</div>
                      </div>
                    </div>
                  </div> */}
                </div>

                {/* Quick Actions */}
                <div className="space-y-3">
                  <div className="w-full flex justify-center">
                    <CustomButton
                      variant="outline"
                      gradient
                      icon={<Mail className="w-4 h-4" />}
                      className="w-full"
                      onClick={handleButtonClick}
                    >
                      Contact Us
                    </CustomButton>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-100">
                  <p className="text-xs text-gray-500 text-center font-sans">
                    We typically respond within 2 hours during business hours
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

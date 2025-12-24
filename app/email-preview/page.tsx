"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from 'next/navigation'
import { PaymentMethodIcon } from '@/components/ui/payment-method-icon'

function EmailPreviewContent() {
  const [customerName, setCustomerName] = useState("John Doe")
  const [customerId, setCustomerId] = useState("MEMBER-001")
  const searchParams = useSearchParams()
  const [paymentMethodInvalid, setPaymentMethodInvalid] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState(``)
  const [failedReason, setFailedReason] = useState('')

  useEffect(() => {
    const id = searchParams.get("id")
    const name = searchParams.get("name")
    setPaymentMethod(searchParams.get('paymentMethod'))
    setPaymentMethodInvalid(searchParams.get('paymentMethodInvalid') === 'true')
    setFailedReason(searchParams.get('reason'))
    if (id) setCustomerId(id)
    if (name) setCustomerName(name)
  }, [searchParams])

  const memberPageUrl = `${typeof window !== "undefined" ? window.location.origin : "https://example.com"}/members/${customerId}?addPayment=true`

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-2xl mx-auto">
        {/* Email Preview */}
        <div className="bg-white rounded-lg shadow-2xl overflow-hidden">
          {/* Email Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-12 text-white">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold">GymFlow</h1>
                <p className="text-blue-100 text-sm mt-1">Fitness Management Platform</p>
              </div>
              <div className="text-right">
                <p className="text-blue-100 text-sm">Member Portal</p>
              </div>
            </div>
            <h2 className="text-2xl font-semibold">Update Your Payment Method</h2>
            <p className="text-blue-100 mt-2">Keep your membership active and uninterrupted</p>
          </div>

          {/* Email Body */}
          <div className="px-8 py-12">
            {/* Greeting */}
            <p className="text-slate-800 text-lg mb-6">
              Dear <span className="font-semibold">{customerName || "Valued Member"}</span>,
            </p>

            {/* Main Message */}
            <p className="text-slate-700 leading-relaxed mb-6">
              We hope this message finds you well!
            </p>

            <div className="bg-blue-50 border-l-4 border-blue-600 p-4 mb-8 rounded">
              {paymentMethodInvalid ? (
                <>
                  <p className="text-slate-800 leading-relaxed">
                    We noticed your payment method has become invalid. To ensure uninterrupted service and avoid any disruption to your membership, please take a moment to update your payment information.
                  </p>
                  <p className="text-slate-800 leading-relaxed m-2 font-bold">
                    Payment Method: <PaymentMethodIcon type={paymentMethod} className="h-5 w-5" style={{ display: 'inline-block' }} /> {paymentMethod} 
                  </p>
                  <p className="text-slate-800 leading-relaxed m-2 font-bold">
                    Invalid Reason: {failedReason}
                  </p>
                </>
              ) : (
                <p className="text-slate-800 leading-relaxed">
                  We noticed that you do not have any payment method yet. To ensure uninterrupted service and avoid any disruption to your membership, please take a moment to add your payment information.
                </p>)}
            </div>

            {/* CTA Button */}
            <div className="mb-8 text-center">
              <a
                href={memberPageUrl}
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition duration-200 shadow-md hover:shadow-lg"
              >
                Update Payment Method
              </a>
              <p className="text-sm text-slate-500 mt-3">
                Or copy and paste this link:
                <br />
                <code className="text-xs bg-slate-100 p-2 rounded inline-block mt-2 break-all">{memberPageUrl}</code>
              </p>
            </div>

            {/* Benefits */}
            <div className="mb-8">
              <h3 className="font-semibold text-slate-800 mb-4 text-lg">Why update your payment method?</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="inline-block w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                    <span className="text-green-600 font-bold text-sm">✓</span>
                  </span>
                  <span className="text-slate-700">Keep your membership active without interruption</span>
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                    <span className="text-green-600 font-bold text-sm">✓</span>
                  </span>
                  <span className="text-slate-700">Ensure automatic billing for your convenience</span>
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                    <span className="text-green-600 font-bold text-sm">✓</span>
                  </span>
                  <span className="text-slate-700">Secure and PCI-compliant payment processing</span>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div className="bg-slate-50 p-6 rounded-lg mb-8">
              <p className="text-slate-700 leading-relaxed">
                If you have any questions or need assistance, please don't hesitate to contact us. Our support team is
                here to help!
              </p>
            </div>

            {/* Closing */}
            <p className="text-slate-700 leading-relaxed mb-2">Thank you for being a valued member of GymFlow!</p>
            <p className="text-slate-700 mb-8">Best regards,</p>

            <div className="border-t border-slate-200 pt-6">
              <p className="font-semibold text-slate-800">The GymFlow Team</p>
              <p className="text-slate-600 text-sm">Fitness Management Platform</p>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-slate-100 px-8 py-6 border-t border-slate-200">
            <p className="text-slate-600 text-xs text-center leading-relaxed">
              This is an automated message. Please do not reply to this email.
              <br />
              For support, contact us at{" "}
              <a href="mailto:support@gymflow.com" className="text-blue-600 hover:underline">
                support@gymflow.com
              </a>
            </p>

            <div className="mt-6 pt-6 border-t border-slate-300 text-center">
              <p className="text-slate-600 text-xs mb-3">Follow us on social media</p>
              <div className="flex justify-center gap-4">
                <a href="#" className="text-slate-500 hover:text-slate-700">
                  Facebook
                </a>
                <a href="#" className="text-slate-500 hover:text-slate-700">
                  Instagram
                </a>
                <a href="#" className="text-slate-500 hover:text-slate-700">
                  Twitter
                </a>
              </div>
            </div>

            <p className="text-slate-500 text-xs text-center mt-6">© 2025 GymFlow. All rights reserved.</p>
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-6 text-center text-slate-400 text-sm">
          <p>This is a preview of the payment method update email sent to members.</p>
          <p>Customize the customer name and ID above to see how the email looks.</p>
        </div>
      </div>
    </div>
  )
}

export default function EmailPreviewPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center"><div className="text-white">Loading...</div></div>}>
      <EmailPreviewContent />
    </Suspense>
  )
}

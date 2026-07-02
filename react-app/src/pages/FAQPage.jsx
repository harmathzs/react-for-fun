import { useState } from 'react'

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState(null)

  const faqs = [
    {
      question: 'Do you offer refunds?',
      answer: 'Yes! If you\'re not satisfied with your purchase, you can return it within 30 days for a full refund. The item must be unused and in original packaging.'
    },
    {
      question: 'How do I create an account?',
      answer: 'Click the "Register" button in the top menu. Fill in your details, verify your email, and you\'re all set. You\'ll be able to track orders and manage your preferences.'
    },
    {
      question: 'Can I change or cancel my order?',
      answer: 'Orders can usually be modified or cancelled within 2 hours of placing them. After that, please contact our support team immediately.'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards (Visa, Mastercard, American Express), bank transfers, and digital wallets. All transactions are secure and encrypted.'
    },
    {
      question: 'How long does delivery usually take?',
      answer: 'Standard shipping takes 5-7 business days within the EU. Express shipping is 2-3 business days. Processing time is typically 24 hours.'
    },
    {
      question: 'Is my personal data safe?',
      answer: 'Absolutely. We use industry-standard encryption and comply with all data protection regulations. Your information is never shared with third parties without your consent.'
    },
    {
      question: 'Do you have a loyalty program?',
      answer: 'Not yet, but we\'re working on something special for our repeat customers. Stay tuned!'
    },
    {
      question: 'Can I use a promotional code?',
      answer: 'Yes! If you have a promo code, you can apply it during checkout. Just paste it in the "Promo Code" field before finalizing your order.'
    }
  ]

  return (
    <div className="page-card">
      <h1>Frequently Asked Questions</h1>
      
      <p style={{ marginBottom: '2rem', color: '#666' }}>
        Can't find the answer you're looking for? <a href="/contact-us" style={{ color: '#2563eb', textDecoration: 'none' }}>Contact us</a> anytime.
      </p>

      <div style={{ maxWidth: '100%' }}>
        {faqs.map((faq, index) => (
          <div key={index} style={{
            borderBottom: '1px solid #e5e7eb',
            marginBottom: '1rem'
          }}>
            <button
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              style={{
                width: '100%',
                padding: '1rem',
                textAlign: 'left',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '500',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                color: '#1f2937'
              }}
            >
              <span>{faq.question}</span>
              <span style={{
                transition: 'transform 0.2s',
                transform: openIndex === index ? 'rotate(180deg)' : 'rotate(0deg)',
                fontSize: '1.25rem'
              }}>
                ▼
              </span>
            </button>
            {openIndex === index && (
              <div style={{
                padding: '0 1rem 1rem 1rem',
                color: '#4b5563',
                lineHeight: '1.6'
              }}>
                {faq.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

import { Link } from 'react-router-dom'

export default function ThanksPage() {
  return (
    <div className="page-card thanks-card">
      <div className="thanks-icon">✓</div>
      <h1>Thank you!</h1>
      <p>
        Your form has been submitted successfully. We&apos;ll review your
        interest and get back to you shortly.
      </p>
      <Link to="/" className="btn-primary">Back to Home</Link>
    </div>
  )
}

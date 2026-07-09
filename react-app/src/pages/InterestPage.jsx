import { useState } from 'react'
import LoadingButton from '../components/LoadingButton'

export default function InterestPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)

  function handleSubmit() {
    setIsSubmitting(true)

    // If navigation is blocked (for example by a browser extension),
    // avoid leaving the button in a perpetual loading state.
    window.setTimeout(() => {
      setIsSubmitting(false)
    }, 8000)
  }

  return (
    <div className="page-card form-card">
      <h1>Interest in Products</h1>
      <p>Fill in the form below to express your interest and we&apos;ll be in touch.</p>
      <form
        className="w2l-form"
        action="https://webto.salesforce.com/servlet/servlet.WebToLead?encoding=UTF-8&orgId=00DdM00000vOexx"
        method="POST"
        onSubmit={handleSubmit}
      >
        <input type="hidden" name="oid" value="00DdM00000vOexx" />
        <input type="hidden" name="lead_source" value="Web" />
        <input
          type="hidden"
          name="retURL"
          value="https://react-for-fun.vercel.app/thanks"
        />

        <div className="form-grid">
          <div className="name-row field-full">
            <div className="field salutation-field">
              <label htmlFor="salutation">Salutation</label>
              <select id="salutation" name="salutation" defaultValue="">
                <option value="">Select</option>
                <option value="Mr.">Mr.</option>
                <option value="Ms.">Ms.</option>
                <option value="Mrs.">Mrs.</option>
                <option value="Dr.">Dr.</option>
                <option value="Prof.">Prof.</option>
                <option value="Mx.">Mx.</option>
              </select>
            </div>

            <div className="field">
              <label htmlFor="first_name">First Name</label>
              <input id="first_name" name="first_name" maxLength="40" type="text" required autoComplete="given-name" />
            </div>

            <div className="field">
              <label htmlFor="last_name">Last Name</label>
              <input id="last_name" name="last_name" maxLength="80" type="text" required autoComplete="family-name" />
            </div>
          </div>

          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" maxLength="80" type="email" required autoComplete="email" />
          </div>

          <div className="field">
            <label htmlFor="phone">Phone</label>
            <input id="phone" name="phone" maxLength="40" type="tel" autoComplete="tel" />
          </div>

          <div className="field">
            <label htmlFor="company">Company</label>
            <input id="company" name="company" maxLength="40" type="text" required autoComplete="organization" />
          </div>

          <div className="field">
            <label htmlFor="city">City</label>
            <input id="city" name="city" maxLength="40" type="text" autoComplete="address-level2" />
          </div>

          <div className="field">
            <label htmlFor="country_code">Country</label>
            <select id="country_code" name="country_code" defaultValue="">
              <option value="">Select</option>
              <option value="HU">Hungary</option>
              <option value="AT">Austria</option>
              <option value="BE">Belgium</option>
              <option value="CZ">Czechia</option>
              <option value="DE">Germany</option>
              <option value="ES">Spain</option>
              <option value="FR">France</option>
              <option value="GB">United Kingdom</option>
              <option value="IT">Italy</option>
              <option value="NL">Netherlands</option>
              <option value="PL">Poland</option>
              <option value="RO">Romania</option>
              <option value="SK">Slovakia</option>
              <option value="US">United States</option>
            </select>
          </div>

          <div className="field field-full">
            <label htmlFor="street">Street</label>
            <textarea id="street" name="street" rows="2" autoComplete="street-address" />
          </div>

          <div className="field">
            <label htmlFor="state_code">State/Province</label>
            <input id="state_code" name="state_code" maxLength="80" type="text" autoComplete="address-level1" />
          </div>

          <div className="field">
            <label htmlFor="zip">Zip</label>
            <input id="zip" name="zip" maxLength="20" type="text" autoComplete="postal-code" />
          </div>

          <div className="field field-full">
            <label htmlFor="description">Product Interest</label>
            {/* Label is intentionally renamed! Flow copies Description to Product Interest. */}
            <textarea id="description" name="description" rows="4" />
          </div>
        </div>

        <LoadingButton type="submit" className="btn-primary w2l-submit" isLoading={isSubmitting}>
          Submit Request
        </LoadingButton>
        <p className="form-note">Required: First Name, Last Name, Company, and Email. <br />After submit, Salesforce redirects to the thank-you page.</p>
      </form>
    </div>
  )
}

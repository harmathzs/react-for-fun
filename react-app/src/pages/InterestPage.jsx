export default function InterestPage() {
  return (
    <div className="page-card">
      <h1>Interest in Products</h1>
      <p>Fill in the form below to express your interest and we&apos;ll be in touch.</p>
      <div className="form-placeholder">
        {/*
          Replace this placeholder with the Salesforce Web-to-Lead form.
          The form's action URL and hidden fields are generated from Salesforce Setup → Web-to-Lead.
          Set the return URL to: https://<your-domain>/thanks

          I think:  https://react-for-fun.vercel.app/thanks

        */}
        <p>Salesforce Web-to-Lead form coming soon</p>
      </div>
    </div>
  )
}

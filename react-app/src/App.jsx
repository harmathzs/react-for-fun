import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

export default function App(props) {
  return (
    <>
      <nav>
        <a>Interest in products</a>
        <a>Thanks page for filling form</a>
        <a>Future menuitem</a>
      </nav>
      <section>
        <article>
          <form>
            TODO
            {/* If Interest in products is checked, then here comes the Web-to-Lead form generated from Salesforce and styled. */}
          </form>
        </article>
        {/* Web-to-Lead redirects to Thanks page */}
      </section>
    </>
  )
}

'use client'

import dynamic from 'next/dynamic'

const ContactForm = dynamic(() => import('./ContactForm'))

export default function ContactFormWrapper() {
  return <ContactForm />
} 
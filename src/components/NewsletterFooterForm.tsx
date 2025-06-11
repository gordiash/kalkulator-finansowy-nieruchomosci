'use client';

import React, { useState } from 'react';
import { Mail, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

const NewsletterFooterForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      setStatus('error');
      setMessage('Podaj prawidłowy adres email');
      return;
    }

    setStatus('loading');
    
    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email, 
          source: 'footer' 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Wystąpił błąd podczas zapisu');
      }

      setStatus('success');
      setMessage('Dziękujemy za zapisanie się!');
      setEmail('');
      
      // Reset po 3 sekundach
      setTimeout(() => {
        setStatus('idle');
        setMessage('');
      }, 3000);

    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'Wystąpił nieoczekiwany błąd');
      
      // Reset błędu po 5 sekundach
      setTimeout(() => {
        setStatus('idle');
        setMessage('');
      }, 5000);
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (status === 'error') {
      setStatus('idle');
      setMessage('');
    }
  };

  return (
    <div className="space-y-3">
      <form onSubmit={handleSubmit} className="space-y-2">
        <div className="flex">
          <input
            type="email"
            value={email}
            onChange={handleEmailChange}
            placeholder="Twój email"
            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={status === 'loading' || status === 'success'}
          />
          <button
            type="submit"
            disabled={status === 'loading' || status === 'success' || !email}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-r-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
          >
            {status === 'loading' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Mail className="w-4 h-4" />
            )}
          </button>
        </div>
      </form>

      {/* Status messages */}
      {message && (
        <div className={`flex items-center gap-2 text-xs ${
          status === 'success' 
            ? 'text-green-600' 
            : status === 'error' 
              ? 'text-red-600' 
              : 'text-gray-600'
        }`}>
          {status === 'success' && <CheckCircle className="w-3 h-3" />}
          {status === 'error' && <AlertCircle className="w-3 h-3" />}
          <span>{message}</span>
        </div>
      )}
      
      {status === 'idle' && (
        <p className="text-xs text-gray-500">
          Bez spamu. Możesz zrezygnować w każdej chwili.
        </p>
      )}
    </div>
  );
};

export default NewsletterFooterForm; 
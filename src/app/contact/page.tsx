"use client";

import BrandContactDetails from '@/components/BrandContactDetails';
import { useState } from 'react';
import { Mail, Phone, MapPin, Building2 } from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    contactReason: '',
    subject: '',
    message: ''
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');

  const schemaMarkup = {
    '@context': 'https://schema.org', '@type': 'ContactPage',
    name: 'Contact Vretok', url: 'https://vretok.com/contact',
    description: 'Contact Vretok for fit, activewear, delivery, and order support.',
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSending(true);
    setError('');
    setShowSuccess(false);
    try {
      const res = await fetch('/api/send-contact-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to send message.');
        setIsSending(false);
        return;
      }
      setShowSuccess(true);
      setFormData({ name: '', email: '', contactReason: '', subject: '', message: '' });
      setTimeout(() => setShowSuccess(false), 5000);
    } catch (err) {
      setError('Failed to send message.');
    } finally {
      setIsSending(false);
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F3E8]/40 py-12">
      {/* Schema.org ContactPage & Organization Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }}
      />

      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-sm border border-[#123E52]/10 overflow-hidden">
            <div className="p-6 sm:p-8">
              <h1 className="text-3xl font-bold text-[#123E52] mb-2 font-heading">Contact Vretok</h1>
              <p className="text-gray-600 mb-8 text-sm sm:text-base">
                Have questions about leggings, activewear, delivery, or your order? Send us a message and our team will get back to you promptly.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Contact Form */}
                <div>
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#123E52] focus:border-transparent text-sm"
                        disabled={isSending}
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#123E52] focus:border-transparent text-sm"
                        disabled={isSending}
                      />
                    </div>
                    <div>
                      <label htmlFor="contactReason" className="block text-sm font-medium text-gray-700 mb-1">
                        Inquiry Reason <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="contactReason"
                        name="contactReason"
                        value={formData.contactReason}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#123E52] focus:border-transparent bg-white text-sm"
                        disabled={isSending}
                      >
                        <option value="">Select a reason</option>
                        <option value="fit-and-sizing">Fit &amp; Sizing</option>
                        <option value="order-inquiry">Order & Delivery Status</option>
                        <option value="track-order">Track My Order</option>
                        <option value="product-support">Product Support</option>
                        <option value="return-refund">Return or Exchange</option>
                        <option value="partnership">Business Inquiry</option>
                        <option value="general">General Question</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                        Subject
                      </label>
                      <input
                        type="text"
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#123E52] focus:border-transparent text-sm"
                        disabled={isSending}
                      />
                    </div>
                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                        Message
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        rows={4}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#123E52] focus:border-transparent text-sm resize-none"
                        disabled={isSending}
                      />
                    </div>
                    <button
                      type="submit"
                      className={`w-full bg-[#123E52] hover:bg-[#0C2C3D] text-[#F7F3E8] font-bold py-3 rounded-full transition-colors duration-200 shadow-sm ${isSending ? 'opacity-60 cursor-not-allowed' : ''}`}
                      disabled={isSending}
                    >
                      {isSending ? 'Sending...' : 'Send Message'}
                    </button>
                    {error && (
                      <div className="mt-2 text-red-600 text-sm font-medium">{error}</div>
                    )}
                  </form>
                </div>

                {/* Contact Information */}
                <div className="bg-[#F7F3E8]/50 p-6 rounded-xl border border-[#123E52]/10">
                  <h2 className="text-xl font-bold text-[#123E52] mb-6 font-heading">Get in Touch</h2>
                  <BrandContactDetails />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Success Message */}
      {showSuccess && (
        <div className="fixed bottom-4 right-4 bg-green-600 text-white px-6 py-3 rounded-xl shadow-lg z-50">
          Your message has been sent successfully to Vretok!
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface TravelFormProps {
  onSubmit: (data: { query: string; email: string; name: string; priceTracking?: boolean; frequency?: string }) => void;
  isLoading: boolean;
  exampleQueries: Array<{ text: string; dates: string }>;
}

const TravelForm: React.FC<TravelFormProps> = ({ onSubmit, isLoading, exampleQueries }) => {
  const [formData, setFormData] = useState({
    query: '',
    email: '',
    name: '',
    priceTracking: false,
    frequency: 'weekly'
  });

  const [errors, setErrors] = useState({
    query: '',
    email: '',
    name: ''
  });

  // --- Unsubscribe modal state ---
  const [showUnsubscribe, setShowUnsubscribe] = useState(false);
  const [unsubEmail, setUnsubEmail] = useState('');
  const [unsubQuery, setUnsubQuery] = useState('');
  const [unsubStatus, setUnsubStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const SUBSCRIBE_WEBHOOK = 'https://n8n.srv874091.hstgr.cloud/webhook/airbnb-subscribe';
  const UNSUBSCRIBE_WEBHOOK = 'https://n8n.srv874091.hstgr.cloud/webhook/airbnb-unsubscribe';

  const validateForm = () => {
    const newErrors = { query: '', email: '', name: '' };
    if (!formData.query.trim()) newErrors.query = 'Please describe your ideal Airbnb';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    setErrors(newErrors);
    return !Object.values(newErrors).some(e => e !== '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    // If price tracking enabled, call subscribe webhook separately
    if (formData.priceTracking) {
      try {
        const subUrl = new URL(SUBSCRIBE_WEBHOOK);
        subUrl.searchParams.append('email', formData.email);
        subUrl.searchParams.append('name', formData.name);
        subUrl.searchParams.append('query', formData.query);
        subUrl.searchParams.append('frequency', formData.frequency);
        await fetch(subUrl.toString(), { method: 'GET' });
      } catch (err) {
        console.warn('Subscribe webhook failed (non-blocking):', err);
      }
    }

    onSubmit(formData);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (field in errors && errors[field as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleExampleClick = (example: { text: string; dates: string }) => {
    const fullQuery = `${example.text} from ${example.dates}`;
    setFormData(prev => ({ ...prev, query: fullQuery }));
    setErrors(prev => ({ ...prev, query: '' }));
  };

  useEffect(() => {
    const handleExampleSelect = (event: CustomEvent) => handleExampleClick(event.detail);
    window.addEventListener('exampleSelected', handleExampleSelect as EventListener);
    return () => window.removeEventListener('exampleSelected', handleExampleSelect as EventListener);
  }, []);

  // --- Unsubscribe handler ---
  const handleUnsubscribe = async () => {
    if (!unsubEmail || !unsubQuery) return;
    setUnsubStatus('loading');
    try {
      const url = new URL(UNSUBSCRIBE_WEBHOOK);
      url.searchParams.append('email', unsubEmail);
      url.searchParams.append('query', unsubQuery);
      const res = await fetch(url.toString(), { method: 'GET' });
      setUnsubStatus(res.ok ? 'success' : 'error');
    } catch {
      setUnsubStatus('error');
    }
  };

  const frequencyLabels: Record<string, string> = {
    daily: '📅 Daily',
    weekly: '📆 Weekly',
    monthly: '🗓️ Monthly',
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Query */}
        <div>
          <label htmlFor="query" className="block text-sm font-medium text-gray-700 mb-2">
            Where would you like to stay?
          </label>
          <textarea
            id="query"
            rows={4}
            className="w-full p-4 rounded-xl border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all text-gray-900 placeholder-gray-400 resize-none focus:outline-none bg-white"
            placeholder="e.g., 'Oceanfront villa in Santorini with infinity pool and sunset views for 4 guests from 21st July to 23rd July 2025'"
            value={formData.query}
            onChange={(e) => handleInputChange('query', e.target.value)}
            disabled={isLoading}
          />
          {errors.query && <p className="mt-1 text-sm text-red-600">{errors.query}</p>}
        </div>

        {/* Name + Email */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">Your Name</label>
            <Input
              id="name"
              type="text"
              className="rounded-xl border-gray-300 focus:border-red-500 focus:ring-red-200 text-gray-900 placeholder-gray-400 bg-white"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              disabled={isLoading}
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
            <Input
              id="email"
              type="email"
              className="rounded-xl border-gray-300 focus:border-red-500 focus:ring-red-200 text-gray-900 placeholder-gray-400 bg-white"
              placeholder="your.email@example.com"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              disabled={isLoading}
            />
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
          </div>
        </div>

        {/* Price Tracking Section */}
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <div
              onClick={() => !isLoading && handleInputChange('priceTracking', !formData.priceTracking)}
              className={`w-10 h-6 rounded-full transition-colors duration-200 flex items-center px-1 cursor-pointer ${
                formData.priceTracking ? 'bg-red-500' : 'bg-gray-300'
              }`}
            >
              <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${
                formData.priceTracking ? 'translate-x-4' : 'translate-x-0'
              }`} />
            </div>
            <div>
              <span className="text-sm font-medium text-gray-800">🔔 Enable Price Tracking</span>
              <p className="text-xs text-gray-500 mt-0.5">Get notified when prices change for your search</p>
            </div>
          </label>

          {formData.priceTracking && (
            <div className="pt-2 border-t border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">Update Frequency</label>
              <div className="grid grid-cols-3 gap-2">
                {(['daily', 'weekly', 'monthly'] as const).map((freq) => (
                  <button
                    key={freq}
                    type="button"
                    onClick={() => handleInputChange('frequency', freq)}
                    disabled={isLoading}
                    className={`py-2 px-3 rounded-lg text-sm font-medium transition-all border ${
                      formData.frequency === freq
                        ? 'bg-red-500 text-white border-red-500 shadow-sm'
                        : 'bg-white text-gray-600 border-gray-300 hover:border-red-300 hover:text-red-500'
                    }`}
                  >
                    {frequencyLabels[freq]}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-2">
                ✉️ You'll receive {formData.frequency} price updates to your email. Unsubscribe anytime.
              </p>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-4 text-base rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-white border-opacity-20 rounded-full animate-spin mr-2" />
              Searching...
            </span>
          ) : (
            <>🔍 Search Airbnb</>
          )}
        </Button>

        <p className="text-xs text-gray-500 text-center">
          Your personalized Airbnb listings will be sent to your email within minutes
        </p>

        {/* Unsubscribe Link */}
        <p className="text-xs text-center text-gray-400">
          Already subscribed?{' '}
          <button
            type="button"
            onClick={() => { setShowUnsubscribe(true); setUnsubStatus('idle'); }}
            className="text-red-400 hover:text-red-600 underline"
          >
            Unsubscribe from price tracking
          </button>
        </p>
      </form>

      {/* Unsubscribe Modal */}
      {showUnsubscribe && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Unsubscribe from Price Tracking</h3>
            <p className="text-sm text-gray-500 mb-4">Enter your email and the search query you subscribed with.</p>

            {unsubStatus === 'success' ? (
              <div className="text-center py-4">
                <div className="text-4xl mb-2">✅</div>
                <p className="text-green-600 font-medium">Successfully unsubscribed!</p>
                <p className="text-sm text-gray-500 mt-1">You won't receive any more price tracking emails.</p>
                <button
                  onClick={() => setShowUnsubscribe(false)}
                  className="mt-4 px-4 py-2 bg-gray-100 rounded-lg text-sm text-gray-700 hover:bg-gray-200"
                >
                  Close
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    className="w-full p-3 rounded-xl border border-gray-300 focus:border-red-400 focus:outline-none text-sm"
                    placeholder="your.email@example.com"
                    value={unsubEmail}
                    onChange={(e) => setUnsubEmail(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Original Search Query</label>
                  <input
                    type="text"
                    className="w-full p-3 rounded-xl border border-gray-300 focus:border-red-400 focus:outline-none text-sm"
                    placeholder="e.g., Beachfront villa in Bali..."
                    value={unsubQuery}
                    onChange={(e) => setUnsubQuery(e.target.value)}
                  />
                </div>

                {unsubStatus === 'error' && (
                  <p className="text-sm text-red-500">Something went wrong. Please try again.</p>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setShowUnsubscribe(false)}
                    className="flex-1 py-2 rounded-xl border border-gray-300 text-sm text-gray-600 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUnsubscribe}
                    disabled={unsubStatus === 'loading' || !unsubEmail || !unsubQuery}
                    className="flex-1 py-2 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 disabled:opacity-50"
                  >
                    {unsubStatus === 'loading' ? 'Processing...' : 'Unsubscribe'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default TravelForm;
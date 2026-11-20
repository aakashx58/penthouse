import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { NavSection } from './Navbar';

interface HeroOverlayProps {
  activeSection: NavSection;
  enquireOpen: boolean;
  onClose: () => void;
  onOpenEnquire: () => void;
}

const SECTION_COPY: Record<
  Exclude<NavSection, 'Home'>,
  {
    eyebrow: string;
    title: string;
    body: string;
    details: { label: string; value: string }[];
  }
> = {
  'The Firm': {
    eyebrow: 'Harborlux Private Realty',
    title: 'Architecture above the harbour line',
    body: 'Founded for principals seeking rare sky-level residences, Harborlux represents fewer than twelve trophy penthouses each year across Victoria Harbour and the Pacific Rim.',
    details: [
      { label: 'Portfolio Focus', value: 'Full-floor & triplex sky residences' },
      { label: 'Advisory', value: 'Discreet off-market acquisition' },
      { label: 'Terraces', value: 'Private heated infinity pools & helipads' },
    ],
  },
  'Skyline Homes': {
    eyebrow: 'Signature Collection',
    title: 'Three summits currently open to private viewing',
    body: 'Each residence commands uninterrupted 270-degree harbour and mountain horizons with acoustic triple-glazing, direct lift foyers, and custom stone terraces.',
    details: [
      { label: 'Level 88 — West Pier', value: '9,400 sq ft · 4 Bedrooms · Rooftop Lap Pool' },
      { label: 'Level 92 — Crown East', value: '11,200 sq ft · Duplex · Private Sky Lounge' },
      { label: 'Level 96 — The Apex', value: '14,800 sq ft · Triplex · 360° Harbour Deck' },
    ],
  },
  'Talk To Us': {
    eyebrow: 'Private Desk',
    title: 'Arrange a confidential harbour preview',
    body: 'Viewings are conducted strictly by appointment after dusk so prospective owners experience the skyline lighting and acoustic sanctuary first-hand.',
    details: [
      { label: 'Private Office', value: 'Suite 6401, Two Harbour Exchange' },
      { label: 'Direct Line', value: '+852 3901 8840' },
      { label: 'Concierge Hours', value: 'Daily, 09:00 – 23:00 HKT' },
    ],
  },
};

export const HeroOverlay: React.FC<HeroOverlayProps> = ({
  activeSection,
  enquireOpen,
  onClose,
  onOpenEnquire,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [residence, setResidence] = useState('Level 96 — The Apex');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const isVisible = enquireOpen || activeSection !== 'Home';

  useEffect(() => {
    if (!isVisible) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter your name.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }
    setError('');
    setSubmitted(true);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={enquireOpen ? 'Private Enquiry' : activeSection}
      className="fixed inset-0 z-20 flex items-center justify-center p-4 bg-[#0D0A22]/60 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-lg rounded-2xl bg-[#0D0A22]/90 backdrop-blur-xl p-7 sm:p-8 text-white shadow-2xl ring-1 ring-white/15">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-5 top-5 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white/80 hover:bg-white/20 hover:text-white transition-colors cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        {enquireOpen ? (
          submitted ? (
            <div className="py-4">
              <p className="text-xs font-light tracking-[0.18em] uppercase text-[#F2B8C0]">
                Enquiry Received
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                Your private viewing request is confirmed.
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-white/75">
                A senior Harborlux advisor will reach out to <span className="text-white">{email}</span> with confidential dossier details for <span className="text-white">{residence}</span>.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSubmitted(false);
                  setName('');
                  setEmail('');
                  onClose();
                }}
                className="mt-6 h-11 px-7 rounded-full bg-[#F2B8C0] text-[#180F3C] text-sm font-semibold hover:bg-[#F7C9D0] transition-colors cursor-pointer"
              >
                Return to Summit
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              <p className="text-xs font-light tracking-[0.18em] uppercase text-[#F2B8C0]">
                Private Dossier
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                Request a twilight viewing
              </h2>
              <p className="mt-2 text-sm text-white/75">
                Receive floor plans and arrange a chauffeur-assisted private tour.
              </p>

              <div className="mt-6 space-y-4">
                <div>
                  <label htmlFor="hl-name" className="block text-xs text-white/70 mb-1.5">
                    Full Name
                  </label>
                  <input
                    id="hl-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Alexandra Chen"
                    className="w-full h-11 rounded-xl bg-white/10 px-4 text-sm text-white placeholder:text-white/40 ring-1 ring-white/15 focus:outline-none focus:ring-2 focus:ring-[#F2B8C0]"
                  />
                </div>

                <div>
                  <label htmlFor="hl-email" className="block text-xs text-white/70 mb-1.5">
                    Private Email
                  </label>
                  <input
                    id="hl-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alexandra@private-office.hk"
                    className="w-full h-11 rounded-xl bg-white/10 px-4 text-sm text-white placeholder:text-white/40 ring-1 ring-white/15 focus:outline-none focus:ring-2 focus:ring-[#F2B8C0]"
                  />
                </div>

                <div>
                  <label htmlFor="hl-residence" className="block text-xs text-white/70 mb-1.5">
                    Residence of Interest
                  </label>
                  <select
                    id="hl-residence"
                    value={residence}
                    onChange={(e) => setResidence(e.target.value)}
                    className="w-full h-11 rounded-xl bg-[#181336] px-4 text-sm text-white ring-1 ring-white/15 focus:outline-none focus:ring-2 focus:ring-[#F2B8C0]"
                  >
                    <option value="Level 88 — West Pier">Level 88 — West Pier</option>
                    <option value="Level 92 — Crown East">Level 92 — Crown East</option>
                    <option value="Level 96 — The Apex">Level 96 — The Apex</option>
                  </select>
                </div>
              </div>

              {error && (
                <p role="alert" className="mt-3 text-xs text-[#F2B8C0]">
                  {error}
                </p>
              )}

              <div className="mt-6 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="h-11 px-5 rounded-full text-sm text-white/80 hover:bg-white/10 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-11 px-7 rounded-full bg-[#F2B8C0] text-[#180F3C] text-sm font-semibold hover:bg-[#F7C9D0] transition-colors cursor-pointer"
                >
                  Send Request
                </button>
              </div>
            </form>
          )
        ) : (
          activeSection !== 'Home' && (
            <div>
              <p className="text-xs font-light tracking-[0.18em] uppercase text-[#F2B8C0]">
                {SECTION_COPY[activeSection].eyebrow}
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                {SECTION_COPY[activeSection].title}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-white/80">
                {SECTION_COPY[activeSection].body}
              </p>

              <div className="mt-6 divide-y divide-white/10 border-t border-b border-white/10">
                {SECTION_COPY[activeSection].details.map((item) => (
                  <div
                    key={item.label}
                    className="py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-sm"
                  >
                    <span className="text-white/60">{item.label}</span>
                    <span className="font-medium text-white">{item.value}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="h-10 px-5 rounded-full text-sm text-white/80 hover:bg-white/10 transition-colors cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={onOpenEnquire}
                  className="h-10 px-6 rounded-full bg-[#F2B8C0] text-[#180F3C] text-sm font-semibold hover:bg-[#F7C9D0] transition-colors cursor-pointer"
                >
                  Enquire
                </button>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
};

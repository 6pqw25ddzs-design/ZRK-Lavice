'use client';
import { useState } from 'react';
import { CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { clsx } from 'clsx';

const steps = ['Dijete', 'Roditelj', 'Potvrda'];

const currentYear = new Date().getFullYear();
const birthYears = Array.from({ length: 8 }, (_, i) => currentYear - 7 - i);

export default function RegistracijaPage() {
  const [step, setStep] = useState(0);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    childName: '',
    birthYear: '',
    parentName: '',
    parentPhone: '',
    parentEmail: '',
  });

  function update(field: string, val: string) {
    setForm(f => ({ ...f, [field]: val }));
  }

  async function submit() {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/registrations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, birthYear: parseInt(form.birthYear) }),
      });
      if (res.ok) setSent(true);
    } catch {
      alert('Greška pri slanju. Pokušajte ponovo ili nas kontaktirajte direktno.');
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <CheckCircle size={64} className="text-green-500 mx-auto mb-6" />
          <h2 className="font-display text-3xl font-bold text-dark mb-4">Registracija primljena!</h2>
          <p className="text-gray-500 mb-6">
            Kontaktiraćemo vas u roku od 48 sati na broj <strong>{form.parentPhone}</strong> i email <strong>{form.parentEmail}</strong>.
          </p>
          <p className="text-sm text-gray-400">Tim ZRK Lavice jedva čeka upoznati vašu malu sportiskinju.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-20">
      <div className="red-accent" />
      <h1 className="section-title mb-2">Registracija igračice</h1>
      <p className="text-gray-500 mb-10">Tri brza koraka i gotovo. Nema dugih formi.</p>

      {/* Progress */}
      <div className="flex items-center gap-2 mb-10">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={clsx(
              'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors',
              i < step ? 'bg-green-500 text-white' : i === step ? 'bg-primary text-white' : 'bg-gray-200 text-gray-400'
            )}>
              {i < step ? '✓' : i + 1}
            </div>
            <span className={clsx('text-sm font-medium', i === step ? 'text-dark' : 'text-gray-400')}>{s}</span>
            {i < steps.length - 1 && <div className="h-px bg-gray-200 w-8" />}
          </div>
        ))}
      </div>

      <div className="card p-8">
        {step === 0 && (
          <div className="space-y-5">
            <h2 className="font-bold text-xl text-dark mb-6">Podaci o djetetu</h2>
            <div>
              <label className="block text-sm font-semibold text-dark mb-2">Ime i prezime djeteta *</label>
              <input
                type="text"
                value={form.childName}
                onChange={e => update('childName', e.target.value)}
                placeholder="npr. Ana Nikolić"
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-dark mb-2">Godina rođenja *</label>
              <select
                value={form.birthYear}
                onChange={e => update('birthYear', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary"
              >
                <option value="">Odaberi godinu</option>
                {birthYears.map(y => <option key={y} value={y}>{y}.</option>)}
              </select>
            </div>
            {form.birthYear && (
              <div className="bg-red-50 border border-primary/20 rounded-lg p-4 text-sm">
                <strong>Ekipa:</strong>{' '}
                {parseInt(form.birthYear) >= 2014 ? 'Mini rukomet'
                  : parseInt(form.birthYear) >= 2012 ? 'Pionirska liga'
                  : 'Prva liga'}
              </div>
            )}
          </div>
        )}

        {step === 1 && (
          <div className="space-y-5">
            <h2 className="font-bold text-xl text-dark mb-6">Kontakt roditelja</h2>
            <div>
              <label className="block text-sm font-semibold text-dark mb-2">Vaše ime i prezime *</label>
              <input
                type="text"
                value={form.parentName}
                onChange={e => update('parentName', e.target.value)}
                placeholder="npr. Marija Nikolić"
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-dark mb-2">Broj telefona *</label>
              <input
                type="tel"
                value={form.parentPhone}
                onChange={e => update('parentPhone', e.target.value)}
                placeholder="+382 67 123 456"
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-dark mb-2">Email adresa *</label>
              <input
                type="email"
                value={form.parentEmail}
                onChange={e => update('parentEmail', e.target.value)}
                placeholder="marija@email.com"
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary"
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="font-bold text-xl text-dark mb-6">Provjeri podatke</h2>
            <div className="space-y-3 text-sm">
              {[
                { label: 'Dijete', val: form.childName },
                { label: 'Godina rođenja', val: `${form.birthYear}.` },
                { label: 'Roditelj', val: form.parentName },
                { label: 'Telefon', val: form.parentPhone },
                { label: 'Email', val: form.parentEmail },
              ].map(r => (
                <div key={r.label} className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">{r.label}</span>
                  <span className="font-semibold text-dark">{r.val}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-6">
              Slanjem registracije saglasni ste da klub kontaktira vaše podatke isključivo u svrhu registracije igračice.
            </p>
          </div>
        )}

        <div className="flex justify-between mt-8">
          {step > 0 ? (
            <button onClick={() => setStep(s => s - 1)} className="flex items-center gap-2 text-gray-500 hover:text-dark transition-colors text-sm font-semibold">
              <ArrowLeft size={16} /> Nazad
            </button>
          ) : <div />}

          {step < 2 ? (
            <button
              onClick={() => setStep(s => s + 1)}
              disabled={step === 0 ? !form.childName || !form.birthYear : !form.parentName || !form.parentPhone || !form.parentEmail}
              className="btn-primary flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Nastavi <ArrowRight size={16} />
            </button>
          ) : (
            <button
              onClick={submit}
              disabled={loading}
              className="btn-primary flex items-center gap-2 disabled:opacity-40"
            >
              {loading ? 'Slanje...' : 'Pošalji registraciju'} <ArrowRight size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

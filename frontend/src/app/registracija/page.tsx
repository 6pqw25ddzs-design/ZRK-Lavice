'use client';
import { useState } from 'react';
import { CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';

const steps = ['Dijete', 'Roditelj', 'Potvrda'];
const currentYear = new Date().getFullYear();
const birthYears = Array.from({ length: 8 }, (_, i) => currentYear - 7 - i);

const inputCls = "w-full bg-[#1A1A1A] border border-[#333] rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#C41230]";
const labelCls = "block text-sm font-semibold text-gray-300 mb-2";

export default function RegistracijaPage() {
  const [step, setStep] = useState(0);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ childName: '', birthYear: '', parentName: '', parentPhone: '', parentEmail: '' });

  function update(field: string, val: string) { setForm(f => ({ ...f, [field]: val })); }

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
    } finally { setLoading(false); }
  }

  if (sent) {
    return (
      <div className="min-h-screen bg-[#1A1A1A] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <CheckCircle size={64} className="text-green-500 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-white mb-4">Registracija primljena!</h2>
          <p className="text-gray-400 mb-6">
            Kontaktiraćemo vas u roku od 48 sati na broj <strong className="text-white">{form.parentPhone}</strong> i email <strong className="text-white">{form.parentEmail}</strong>.
          </p>
          <p className="text-sm text-gray-500">Tim ZRK Lavice jedva čeka upoznati vašu malu sportiskinju.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1A1A1A] text-white pt-24 pb-16 px-4">
      <div className="max-w-xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">Registracija <span className="text-[#C41230]">Igračice</span></h1>
        <p className="text-gray-400 mb-10">Tri brza koraka i gotovo. Nema dugih formi.</p>

        <div className="flex items-center gap-2 mb-10">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${i < step ? 'bg-green-500 text-white' : i === step ? 'bg-[#C41230] text-white' : 'bg-[#333] text-gray-400'}`}>
                {i < step ? '✓' : i + 1}
              </div>
              <span className={`text-sm font-medium ${i === step ? 'text-white' : 'text-gray-500'}`}>{s}</span>
              {i < steps.length - 1 && <div className="h-px bg-[#333] w-8" />}
            </div>
          ))}
        </div>

        <div className="bg-[#2A2A2A] rounded-xl p-8">
          {step === 0 && (
            <div className="space-y-5">
              <h2 className="font-bold text-xl mb-6">Podaci o djetetu</h2>
              <div>
                <label className={labelCls}>Ime i prezime djeteta *</label>
                <input type="text" value={form.childName} onChange={e => update('childName', e.target.value)} placeholder="npr. Ana Nikolić" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Godina rođenja *</label>
                <select value={form.birthYear} onChange={e => update('birthYear', e.target.value)} className={inputCls}>
                  <option value="">Odaberi godinu</option>
                  {birthYears.map(y => <option key={y} value={y}>{y}.</option>)}
                </select>
              </div>
              {form.birthYear && (
                <div className="bg-[#C41230]/10 border border-[#C41230]/20 rounded-lg p-4 text-sm text-gray-300">
                  <strong className="text-white">Ekipa:</strong>{' '}
                  {parseInt(form.birthYear) >= 2014 ? 'Mini rukomet' : parseInt(form.birthYear) >= 2012 ? 'Pionirska liga' : 'Prva liga'}
                </div>
              )}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-5">
              <h2 className="font-bold text-xl mb-6">Kontakt roditelja</h2>
              <div>
                <label className={labelCls}>Vaše ime i prezime *</label>
                <input type="text" value={form.parentName} onChange={e => update('parentName', e.target.value)} placeholder="npr. Marija Nikolić" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Broj telefona *</label>
                <input type="tel" value={form.parentPhone} onChange={e => update('parentPhone', e.target.value)} placeholder="+382 67 123 456" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Email adresa *</label>
                <input type="email" value={form.parentEmail} onChange={e => update('parentEmail', e.target.value)} placeholder="marija@email.com" className={inputCls} />
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="font-bold text-xl mb-6">Provjeri podatke</h2>
              <div className="space-y-3 text-sm">
                {[
                  { label: 'Dijete', val: form.childName },
                  { label: 'Godina rođenja', val: `${form.birthYear}.` },
                  { label: 'Roditelj', val: form.parentName },
                  { label: 'Telefon', val: form.parentPhone },
                  { label: 'Email', val: form.parentEmail },
                ].map(r => (
                  <div key={r.label} className="flex justify-between py-2 border-b border-[#333]">
                    <span className="text-gray-400">{r.label}</span>
                    <span className="font-semibold text-white">{r.val}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-6">Slanjem registracije saglasni ste da klub kontaktira vaše podatke isključivo u svrhu registracije igračice.</p>
            </div>
          )}

          <div className="flex justify-between mt-8">
            {step > 0 ? (
              <button onClick={() => setStep(s => s - 1)} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm font-semibold">
                <ArrowLeft size={16} /> Nazad
              </button>
            ) : <div />}
            {step < 2 ? (
              <button onClick={() => setStep(s => s + 1)}
                disabled={step === 0 ? !form.childName || !form.birthYear : !form.parentName || !form.parentPhone || !form.parentEmail}
                className="bg-[#C41230] hover:bg-[#a00f28] text-white px-6 py-2.5 rounded-lg font-semibold flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                Nastavi <ArrowRight size={16} />
              </button>
            ) : (
              <button onClick={submit} disabled={loading}
                className="bg-[#C41230] hover:bg-[#a00f28] text-white px-6 py-2.5 rounded-lg font-semibold flex items-center gap-2 disabled:opacity-40 transition-colors">
                {loading ? 'Slanje...' : 'Pošalji registraciju'} <ArrowRight size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

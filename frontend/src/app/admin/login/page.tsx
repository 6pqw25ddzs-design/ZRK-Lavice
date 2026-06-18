'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { authLogin } from '@/lib/api';
import { Lock, Mail, AlertCircle } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const login = useAuthStore(s => s.login);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await authLogin(email, password);
      if (!['admin', 'coach'].includes(data.user.role)) {
        setError('Nemate pristup admin panelu.');
        return;
      }
      login(data.user, data.token);
      router.push('/admin');
    } catch {
      setError('Pogrešni podaci za prijavu.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-3xl mx-auto mb-4">🦁</div>
          <h1 className="text-white font-bold text-2xl">ZRK Lavice</h1>
          <p className="text-gray-400 text-sm mt-1">Admin panel</p>
        </div>

        <form onSubmit={submit} className="bg-white rounded-2xl p-8 shadow-2xl">
          <h2 className="font-bold text-xl text-dark mb-6">Prijava</h2>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-primary/30 text-primary rounded-lg px-4 py-3 mb-5 text-sm">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-dark mb-1.5">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-3.5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="admin@zrklavice.me"
                  className="w-full pl-9 pr-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-dark mb-1.5">Lozinka</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-3.5 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary"
                  required
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full bg-primary text-white py-3 rounded-lg font-bold text-sm hover:bg-primary-dark transition-colors disabled:opacity-50"
          >
            {loading ? 'Prijava...' : 'Prijavi se'}
          </button>

          <p className="text-center text-xs text-gray-400 mt-4">
            Test: admin@zrklavice.me / Admin1234!
          </p>
        </form>
      </div>
    </div>
  );
}

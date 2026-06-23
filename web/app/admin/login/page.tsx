'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminLogin } from '@/lib/auth';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { token, user } = await adminLogin(email, password);
      if (user.role !== 'admin') throw new Error('Nemate admin pristup');
      localStorage.setItem('admin_token', token);
      localStorage.setItem('admin_user', JSON.stringify(user));
      router.push('/admin');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: 'var(--background)' }}>
      <div style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }} className="rounded-2xl p-8 w-full max-w-sm">
        <div className="text-center mb-8">
          <div style={{ color: 'var(--primary)' }} className="text-3xl font-black">ŽRK</div>
          <div className="text-white font-bold text-xl">Lavice Admin</div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label style={{ color: 'var(--text-muted)' }} className="text-sm block mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              style={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
              className="w-full px-4 py-2 rounded-lg outline-none focus:border-red-600"
            />
          </div>
          <div>
            <label style={{ color: 'var(--text-muted)' }} className="text-sm block mb-1">Lozinka</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              style={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
              className="w-full px-4 py-2 rounded-lg outline-none focus:border-red-600"
            />
          </div>

          {error && <p style={{ color: 'var(--primary)' }} className="text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            style={{ backgroundColor: 'var(--primary)' }}
            className="w-full py-3 text-white font-bold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 mt-2">
            {loading ? 'Prijava...' : 'Prijavi se'}
          </button>
        </form>
      </div>
    </div>
  );
}

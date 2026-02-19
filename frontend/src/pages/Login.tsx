import { useState } from 'react';
import { apiRequest } from '../api';

interface Props {
  onLogin: (token: string) => void;
}

export default function Login({ onLogin }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [error, setError] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    try {
      const data = await apiRequest<{ token: string }>(`/${mode}`, {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      onLogin(data.token);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="card w-full max-w-md p-8">
        <div className="mb-6">
          <h1 className="text-4xl font-display font-bold text-plum dark:text-lilac">Flowstate</h1>
          <p className="text-slate-500 text-lg dark:text-slate-300">Entre para organizar seus dias com clareza.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-slate-600">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-lilac/60 px-4 py-3"
              required
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-600">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-lilac/60 px-4 py-3"
              required
            />
          </div>

          {error && <p className="text-rose text-sm">{error}</p>}

          <button type="submit" className="btn-primary w-full">
            {mode === 'login' ? 'Entrar' : 'Criar conta'}
          </button>
        </form>

        <button
          type="button"
          className="btn-ghost w-full mt-4"
          onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
        >
          {mode === 'login' ? 'Precisa de conta? Cadastre-se' : 'Já tem conta? Entrar'}
        </button>
      </div>
    </div>
  );
}

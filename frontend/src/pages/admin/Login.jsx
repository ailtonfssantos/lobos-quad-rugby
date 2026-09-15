import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const emailInputRef = useRef(null);

  useEffect(() => {
    emailInputRef.current?.focus();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    setError('');
    setLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/login`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: email.trim(),
            password,
          }),
        }
      );

      let data = {};

      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (!response.ok) {
        throw new Error(
          data.error ||
          data.message ||
          'No se ha podido iniciar sesión.'
        );
      }

      if (!data.token) {
        throw new Error(
          'El servidor no ha devuelto un token de autenticación.'
        );
      }

      localStorage.setItem('token', data.token);

      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }

      navigate('/admin/dashboard', { replace: true });
    } catch (err) {
      console.error('Error de login:', err);

      setError(
        err.message ||
        'Ha ocurrido un error al iniciar sesión. Inténtalo de nuevo.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-white flex items-center justify-center px-4 py-12 relative overflow-hidden">

      {/* Ambientación */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
      >
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-900/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-zinc-800/10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">

        {/* Marca */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-6">
            <img
              src="/assets/logo1.png"
              alt="Lobos Quad Rugby"
              className="h-16 w-auto object-contain grayscale opacity-90"
            />
          </div>

          <p className="text-red-500 text-[9px] font-bold uppercase tracking-[0.3em] mb-3">
            Administración
          </p>

          <h1 className="font-display text-4xl sm:text-5xl text-white tracking-wide">
            PANEL DE CONTROL
          </h1>

          <p className="mt-3 text-xs uppercase tracking-[0.2em] text-zinc-600">
            Lobos Quad Rugby · Valencia
          </p>
        </div>

        {/* Formulario */}
        <form
          onSubmit={handleSubmit}
          className="bg-zinc-900/80 border border-white/10 p-7 sm:p-8 backdrop-blur-xl"
        >

          {/* Error */}
          {error && (
            <div
              role="alert"
              aria-live="assertive"
              className="mb-6 border border-red-900/80 bg-red-950/30 px-4 py-4"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center border border-red-700 text-red-500 text-xs">
                  !
                </div>

                <p className="text-sm leading-6 text-red-400">
                  {error}
                </p>
              </div>
            </div>
          )}

          <div className="space-y-6">

            {/* Email */}
            <div>
              <label
                htmlFor="admin-email"
                className="block mb-2 text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-500"
              >
                Correo electrónico
              </label>

              <input
                ref={emailInputRef}
                id="admin-email"
                type="email"
                name="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError('');
                }}
                autoComplete="username"
                required
                disabled={loading}
                placeholder="admin@lobosquadrugby.com"
                className="w-full bg-zinc-950 border border-zinc-800 px-4 py-3.5 text-sm text-white placeholder:text-zinc-700 outline-none transition-colors duration-300 focus:border-red-600 disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="admin-password"
                className="block mb-2 text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-500"
              >
                Contraseña
              </label>

              <div className="relative">
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError('');
                  }}
                  autoComplete="current-password"
                  required
                  disabled={loading}
                  placeholder="••••••••"
                  className="w-full bg-zinc-950 border border-zinc-800 px-4 py-3.5 pr-14 text-sm text-white placeholder:text-zinc-700 outline-none transition-colors duration-300 focus:border-red-600 disabled:cursor-not-allowed disabled:opacity-60"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  disabled={loading}
                  aria-label={
                    showPassword
                      ? 'Ocultar contraseña'
                      : 'Mostrar contraseña'
                  }
                  className="absolute right-0 top-0 h-full w-12 flex items-center justify-center text-zinc-600 hover:text-white transition-colors disabled:opacity-40"
                >
                  {showPassword ? (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3.98 8.98A10.477 10.477 0 001.5 12s3.5 6 10.5 6c1.89 0 3.53-.47 4.91-1.17M6.23 6.23C7.83 5.45 9.8 5 12 5c7 0 10.5 7 10.5 7a18.5 18.5 0 01-4.02 4.98M6.23 6.23L3 3m3.23 3.23l11.54 11.54M14.12 14.12a3 3 0 01-4.24-4.24"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.25 12s3.75-6.75 9.75-6.75S21.75 12 21.75 12 18 18.75 12 18.75 2.25 12 2.25 12z"
                      />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full min-h-[52px] flex items-center justify-center gap-3 bg-red-600 px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-white transition-all duration-300 hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <>
                  <span
                    className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"
                    aria-hidden="true"
                  />
                  Accediendo...
                </>
              ) : (
                <>
                  Acceder al panel

                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 12h14M13 6l6 6-6 6"
                    />
                  </svg>
                </>
              )}
            </button>
          </div>

          <div className="mt-7 pt-5 border-t border-white/5">
            <p className="text-center text-[8px] uppercase tracking-[0.18em] text-zinc-700">
              Acceso restringido · Lobos Quad Rugby
            </p>
          </div>
        </form>

        <p className="mt-6 text-center text-[8px] uppercase tracking-[0.15em] text-zinc-800">
          Panel de administración
        </p>
      </div>
    </main>
  );
}
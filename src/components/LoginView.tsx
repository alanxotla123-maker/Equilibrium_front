import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, Scale } from 'lucide-react';

interface LoginViewProps {
  onLogin: (email: string, keepLoggedIn: boolean) => void;
}

export default function LoginView({ onLogin }: LoginViewProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);
  const [error, setError] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isRegister) {
      if (!name.trim() || !email.trim() || !password) {
        setError('Por favor, completa todos los campos.');
        return;
      }
      // Save user to localStorage
      const users = JSON.parse(localStorage.getItem('equilibrium_users') || '[]');
      const userExists = users.some((u: any) => u.email.toLowerCase() === email.trim().toLowerCase());
      if (userExists || email.trim().toLowerCase() === 'alanxotla123@gmail.com') {
        setError('El correo electrónico ya está registrado.');
        return;
      }
      users.push({ name: name.trim(), email: email.trim().toLowerCase(), password });
      localStorage.setItem('equilibrium_users', JSON.stringify(users));
      
      // Auto login
      onLogin(email.trim().toLowerCase(), keepLoggedIn);
    } else {
      const sanitizedEmail = email.trim().toLowerCase();
      // Check default credentials
      if (sanitizedEmail === 'alanxotla123@gmail.com' && password === 'Salinas978') {
        onLogin(sanitizedEmail, keepLoggedIn);
        return;
      }
      // Check registered users
      const users = JSON.parse(localStorage.getItem('equilibrium_users') || '[]');
      const user = users.find((u: any) => u.email === sanitizedEmail && u.password === password);
      if (user) {
        onLogin(sanitizedEmail, keepLoggedIn);
      } else {
        setError('Credenciales incorrectas. Por favor, verifica tu correo y contraseña.');
      }
    }
  };

  const handleGoogleLogin = () => {
    onLogin('alanxotla123@gmail.com', keepLoggedIn);
  };

  return (
    <div className="flex h-screen w-screen bg-slate-50 overflow-hidden font-sans select-none">
      {/* Left Banner Section */}
      <div className="hidden lg:flex w-1/2 bg-indigo-700 text-white flex-col justify-between p-12 relative overflow-hidden">
        {/* Subtle decorative grid/circles */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.08),transparent_50%)]" />
        
        {/* Logo and Brand */}
        <div className="flex items-center gap-3 z-10">
          <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
            <Scale className="w-5 h-5 text-white" />
          </div>
          <h1 className="font-bold text-2xl tracking-tight">Equilibrium</h1>
        </div>

        {/* Marketing Slogan and Description */}
        <div className="my-auto max-w-lg z-10 space-y-6">
          <h2 className="text-4xl font-extrabold leading-tight">
            Domina tu tiempo y capital con precisión absoluta.
          </h2>
          <p className="text-base text-indigo-100 font-medium leading-relaxed">
            La plataforma definitiva para individuos de alto rendimiento que buscan claridad cognitiva y organización financiera en un solo ecosistema funcional.
          </p>
          
          {/* Laptop Mockup Image */}
          <div className="pt-4 drop-shadow-2xl">
            <img 
              src="/dashboard_mockup.png" 
              alt="Dashboard Preview" 
              className="w-full h-auto rounded-2xl border border-white/10 shadow-2xl object-cover transform hover:scale-[1.02] transition-transform duration-500"
            />
          </div>
        </div>

        {/* Footer info */}
        <div className="flex items-center gap-4 z-10 mt-auto">
          {/* Avatars Stack */}
          <div className="flex -space-x-2">
            <div className="w-8 h-8 rounded-full border-2 border-indigo-700 bg-slate-400 flex items-center justify-center text-[10px] font-bold">AR</div>
            <div className="w-8 h-8 rounded-full border-2 border-indigo-700 bg-emerald-500 flex items-center justify-center text-[10px] font-bold">JD</div>
            <div className="w-8 h-8 rounded-full border-2 border-indigo-700 bg-indigo-500 flex items-center justify-center text-[10px] font-bold">LC</div>
          </div>
          <p className="text-xs text-indigo-200 font-semibold">
            Únete a más de 10,000 profesionales.
          </p>
        </div>
      </div>

      {/* Right Form Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white md:p-16 relative">
        <div className="w-full max-w-md space-y-8">
          
          {/* Title Headers */}
          <div>
            <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">
              {isRegister ? 'Crear una cuenta gratis' : 'Bienvenido de nuevo'}
            </h2>
            <p className="text-sm text-slate-500 font-semibold mt-2">
              {isRegister 
                ? 'Introduce tus datos para registrarte y acceder a tu panel.' 
                : 'Introduce tus credenciales para acceder a tu panel.'}
            </p>
          </div>

          {/* Error Alert Banner */}
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-600 rounded-xl p-3.5 text-xs font-bold flex items-center gap-2.5 animate-headShake">
              <span className="w-2 h-2 rounded-full bg-rose-500 flex-shrink-0 animate-pulse" />
              <span>{error}</span>
            </div>
          )}

          {/* Google SSO Button */}
          <button
            onClick={handleGoogleLogin}
            type="button"
            className="w-full flex items-center justify-center gap-3 px-4 py-3.5 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-sm transition-all shadow-sm"
          >
            {/* Google Icon SVG */}
            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M12 5.04c1.74 0 3.3.6 4.53 1.77l3.39-3.39C17.84 1.5 15.15 0 12 0 7.31 0 3.29 2.69 1.34 6.61l3.96 3.07C6.23 6.94 8.89 5.04 12 5.04z"
              />
              <path
                fill="#4285F4"
                d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.51h6.46c-.28 1.48-1.12 2.73-2.38 3.58l3.7 2.87c2.16-2 3.41-4.93 3.41-8.6z"
              />
              <path
                fill="#FBBC05"
                d="M5.3 14.52A7.16 7.16 0 0 1 4.91 12c0-.87.15-1.72.43-2.52L1.38 6.41A11.95 11.95 0 0 0 0 12c0 2.05.52 4 1.43 5.72l3.87-3.2z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.97-1.08 7.96-2.91l-3.7-2.87c-1.03.69-2.34 1.1-4.26 1.1-3.11 0-5.77-1.9-6.7-4.64L1.34 17.75C3.29 21.31 7.31 24 12 24z"
              />
            </svg>
            Continuar con Google
          </button>

          {/* Divider line */}
          <div className="flex items-center my-6">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
              o vía correo electrónico
            </span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Field (Register Mode Only) */}
            {isRegister && (
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Nombre completo
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="Tu nombre completo"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-sm font-semibold text-slate-800"
                  />
                </div>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Correo electrónico
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
                  <Mail className="w-5 h-5" />
                </span>
                <input
                  type="email"
                  required
                  placeholder="nombre@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-sm font-semibold text-slate-800"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Contraseña
                </label>
                {!isRegister && (
                  <a
                    href="#"
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-700 hover:underline"
                  >
                    ¿Olvidaste tu contraseña?
                  </a>
                )}
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
                  <Lock className="w-5 h-5" />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-sm font-semibold text-slate-800"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-650 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Remember me checkbox */}
            <div className="flex items-center">
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={keepLoggedIn}
                  onChange={(e) => setKeepLoggedIn(e.target.checked)}
                  className="rounded border-slate-350 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                <span className="text-xs font-bold text-slate-500">Mantener sesión iniciada</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm rounded-xl transition-all shadow-md shadow-indigo-600/10 mt-6"
            >
              {isRegister ? 'Crear Cuenta' : 'Iniciar Sesión'}
            </button>
          </form>

          {/* Toggle Register link */}
          <div className="text-center pt-4">
            <p className="text-xs text-slate-500 font-bold">
              {isRegister ? '¿Ya tienes una cuenta? ' : '¿No tienes una cuenta? '}
              <button
                type="button"
                onClick={() => {
                  setIsRegister(!isRegister);
                  setError('');
                }}
                className="text-indigo-600 hover:underline font-bold"
              >
                {isRegister ? 'Iniciar Sesión' : 'Crear cuenta gratis'}
              </button>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, User, Building2, ArrowRight, AlertCircle, Loader2, Check, X } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { useAuth } from '@/contexts/AuthContext';

export default function RegisterPage() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    organization: '',
    password: '',
    agree: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Password rule requirements from PDF:
  // "more than eight characters, with an uppercase letter, a lowercase letter and a special character"
  const passwordCriteria = {
    length: formData.password.length > 8,
    hasUpper: /[A-Z]/.test(formData.password),
    hasLower: /[a-z]/.test(formData.password),
    hasSpecial: /[^A-Za-z0-9]/.test(formData.password),
  };
  const isPasswordValid = Object.values(passwordCriteria).every(Boolean);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isPasswordValid) {
      setError('Password must be more than 8 characters and include uppercase, lowercase, and a special character.');
      return;
    }

    setLoading(true);

    const { error } = await signUp(formData.email, formData.password, {
      full_name: formData.name,
      organization: formData.organization,
      role: 'admin',
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push('/dashboard');
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Link href="/dashboard">
            <Logo variant="light" size="lg" showTagline={true} />
          </Link>
        </div>

        <h2 className="mt-6 text-center text-2xl font-bold tracking-tight text-slate-900">
          Create an administrator account
        </h2>
        <p className="mt-1 text-center text-xs text-slate-500">
          Get started with Brightloop Hub subscription operations
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-sm border border-slate-200/90 rounded-2xl sm:px-10">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
            <div>
              <label className="block text-xs font-semibold text-slate-700">Full Name</label>
              <div className="mt-1 relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="full-name"
                  type="text"
                  required
                  autoComplete="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="John Doe"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Company / Organization</label>
              <div className="mt-1 relative">
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={formData.organization}
                  onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                  placeholder="Acme Corp"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Work Email</label>
              <div className="mt-1 relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="admin@company.com"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800"
                />
              </div>
            </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Password</label>
                <div className="mt-1 relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Create a strong password"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800"
                  />
                </div>

                {/* Password Criteria Checklist per PDF Scene 1 */}
                {formData.password && (
                  <div className="mt-2.5 p-2.5 bg-slate-50 border border-slate-200/80 rounded-lg space-y-1.5 text-[11px]">
                    <p className="font-semibold text-slate-600 text-[10px] uppercase tracking-wider">Password Requirements</p>
                    <div className="grid grid-cols-2 gap-1.5">
                      <span className={`inline-flex items-center gap-1 ${passwordCriteria.length ? 'text-emerald-700 font-medium' : 'text-slate-500'}`}>
                        {passwordCriteria.length ? <Check className="w-3 h-3 text-emerald-600" /> : <X className="w-3 h-3 text-slate-400" />}
                        &gt; 8 characters ({formData.password.length})
                      </span>
                      <span className={`inline-flex items-center gap-1 ${passwordCriteria.hasUpper ? 'text-emerald-700 font-medium' : 'text-slate-500'}`}>
                        {passwordCriteria.hasUpper ? <Check className="w-3 h-3 text-emerald-600" /> : <X className="w-3 h-3 text-slate-400" />}
                        Uppercase letter
                      </span>
                      <span className={`inline-flex items-center gap-1 ${passwordCriteria.hasLower ? 'text-emerald-700 font-medium' : 'text-slate-500'}`}>
                        {passwordCriteria.hasLower ? <Check className="w-3 h-3 text-emerald-600" /> : <X className="w-3 h-3 text-slate-400" />}
                        Lowercase letter
                      </span>
                      <span className={`inline-flex items-center gap-1 ${passwordCriteria.hasSpecial ? 'text-emerald-700 font-medium' : 'text-slate-500'}`}>
                        {passwordCriteria.hasSpecial ? <Check className="w-3 h-3 text-emerald-600" /> : <X className="w-3 h-3 text-slate-400" />}
                        Special character
                      </span>
                    </div>
                  </div>
                )}
              </div>

            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                required
                checked={formData.agree}
                onChange={(e) => setFormData({ ...formData, agree: e.target.checked })}
                className="mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
              />
              <span className="text-[11px] text-slate-600 leading-normal">
                I agree to the <a href="#" className="text-indigo-600 underline">Terms of Service</a> and{' '}
                <a href="#" className="text-indigo-600 underline">Privacy Policy</a>.
              </span>
            </div>

            <button
              id="register-btn"
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-semibold rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed shadow-xs transition-colors"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /><span>Creating Account…</span></>
              ) : (
                <><span>Create Account</span><ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Already have an account?</span>
            <Link
              href="/auth/login"
              className="font-semibold text-indigo-600 hover:text-indigo-700"
            >
              Sign In &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

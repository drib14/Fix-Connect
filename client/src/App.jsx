import { useState } from 'react';
import { Mail, Lock, User, ArrowRight } from 'lucide-react';

function App() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute top-[20%] right-[-10%] w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-[-20%] left-[20%] w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>

      <div className="w-full max-w-md z-10 animate-fade-in">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white shadow-xl shadow-primary-500/20 mb-6 transform transition hover:scale-105 duration-300">
            <img src="/favicon.svg" alt="Fix-Connect Logo" className="w-10 h-10" />
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Fix-Connect</h1>
          <p className="text-slate-500 mt-2 font-medium">Your platform for local service workers</p>
        </div>

        <div className="glass-card p-8 sm:p-10">
          <h2 className="text-2xl font-bold mb-6 text-center">
            {isLogin ? 'Welcome back' : 'Create an account'}
          </h2>

          <form className="space-y-5 animate-slide-up">
            {!isLogin && (
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  className="input-field pl-11"
                  placeholder="Full Name"
                />
              </div>
            )}
            
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="email"
                className="input-field pl-11"
                placeholder="Email address"
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="password"
                className="input-field pl-11"
                placeholder="Password"
              />
            </div>

            {isLogin && (
              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500" />
                  <span className="ml-2 text-sm text-slate-600">Remember me</span>
                </label>
                <a href="#" className="text-sm font-semibold text-primary-600 hover:text-primary-500">
                  Forgot password?
                </a>
              </div>
            )}

            <button type="button" className="btn-primary group flex items-center justify-center mt-2">
              <span>{isLogin ? 'Sign in' : 'Sign up'}</span>
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-600">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="font-semibold text-primary-600 hover:text-primary-500 hover:underline transition-all"
            >
              {isLogin ? 'Sign up' : 'Log in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;

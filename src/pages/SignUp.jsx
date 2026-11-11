import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const SignUp = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      setIsLoading(false);
      return;
    }

    try {
      await new Promise((res) => setTimeout(res, 800));
      register(name, email, password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError('Could not create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="flex justify-center items-center gap-2 mb-6">
          <div className="w-10 h-10 rounded-full bg-brand flex items-center justify-center text-white font-bold text-xl">W</div>
          <span className="text-2xl font-bold text-darktext">warren<span className="text-brand">site</span></span>
        </Link>
        <h2 className="text-center text-3xl font-extrabold text-darktext">Create your account</h2>
        <p className="mt-2 text-center text-sm text-gray-500">Already have an account? <Link to="/login" className="font-medium text-brand hover:text-brand-dark">Sign in</Link></p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-2xl sm:px-10 border border-gray-100">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-darktext">Full Name</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><User size={18} className="text-gray-400" /></div>
                <input 
                  type="text" 
                  required 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-brand focus:border-brand sm:text-sm outline-none" 
                  placeholder="Warren Dev" 
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-darktext">Email address</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Mail size={18} className="text-gray-400" /></div>
                <input 
                  type="email" 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-brand focus:border-brand sm:text-sm outline-none" 
                  placeholder="you@example.com" 
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-darktext">Password</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Lock size={18} className="text-gray-400" /></div>
                <input 
                  type="password" 
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-brand focus:border-brand sm:text-sm outline-none" 
                  placeholder="••••••••" 
                />
              </div>
              <p className="text-[10px] text-gray-500 mt-1">Minimum 6 characters.</p>
            </div>

            {error && <p className="text-xs font-medium text-red-500">{error}</p>}

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-brand hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand transition-colors disabled:opacity-70"
            >
              {isLoading ? <><Loader2 size={16} className="animate-spin" /> Creating account...</> : 'Create Account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignUp;

import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';

const ForgotPassword = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/login" className="flex items-center gap-2 text-sm text-graytext hover:text-brand mb-6 transition-colors">
          <ArrowLeft size={16} /> Back to login
        </Link>
        <h2 className="text-center text-3xl font-extrabold text-darktext">Reset your password</h2>
        <p className="mt-2 text-center text-sm text-graytext">Enter your email and we'll send you a link to reset your password.</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-2xl sm:px-10 border border-gray-100">
          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label className="block text-sm font-medium text-darktext">Email address</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Mail size={18} className="text-gray-400" /></div>
                <input type="email" required className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-brand focus:border-brand sm:text-sm outline-none" placeholder="you@example.com" />
              </div>
            </div>

            <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-brand hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand transition-colors">
              Send Reset Link
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;

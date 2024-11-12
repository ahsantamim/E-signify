import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import Cookies from 'js-cookie';
import { BACKEND_URL } from '@/utils/const';
import { useUser } from '../context/userContext';
import toast from 'react-hot-toast';
import Loader from '../loader/Loader';

interface FormData {
  email: string;
  password: string;
}

interface FormErrors {
  email?: string;
  password?: string;
}

const LoginForm: React.FC = () => {
  const { setUser } = useUser();
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors: FormErrors = {};
    if (!formData.email) newErrors.email = 'Email required.';
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = 'Invalid email address.';
    if (!formData.password) newErrors.password = 'Password required.';
    return newErrors;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setErrors({
      ...errors,
      [e.target.name]: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const formErrors = validateForm();
    setErrors(formErrors);
    if (Object.keys(formErrors).length === 0) {
      try {
        const response = await axios.post(
          `${BACKEND_URL}/api/users/login`,
          formData
        );
        if (response.data && response.data.token) {
          localStorage.setItem('token', response.data.token);
          Cookies.set('user', JSON.stringify(response.data.user));
          Cookies.set('token', response.data.token);
          setUser(response.data.user);
          toast.success('Login successful');
          router.push('/dashboard');
          setLoading(false);
        }
      } catch (error: any) {
        setErrors({
          ...errors,
          email: error.response?.data?.message || 'Login failed',
        });
        setLoading(false);
      }
    }
  };

  return (
    <>
      {loading && <Loader isVisible={loading} message="Logging in ..." />}
      <form className="space-y-4" onSubmit={handleSubmit}>
        <h1 className="m-0 font-sans text-[24px] font-semibold leading-[1.25]">
          Log in to E-Signify
        </h1>
        <p className="text-sm">Enter your email and password to log in.</p>
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="Enter email"
            value={formData.email}
            onChange={handleChange}
            className={`mt-1 block w-full px-3 py-2 border ${
              errors.email ? 'border-red-500' : 'border-gray-300'
            } rounded-sm shadow-sm focus:outline-none focus:ring-[var(--button-login-color)] focus:border-[var(--button-color)] sm:text-sm`}
            required
          />
          {errors.email && (
            <p className="text-red-500 text-xs">{errors.email}</p>
          )}
        </div>
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700"
          >
            Password <span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            id="password"
            name="password"
            placeholder="Enter password"
            value={formData.password}
            onChange={handleChange}
            className={`mt-1 block w-full px-3 py-2 border ${
              errors.password ? 'border-red-500' : 'border-gray-300'
            } rounded-sm shadow-sm focus:outline-none focus:ring-[var(--button-color)] focus:border-[var(--button-color)] sm:text-sm`}
            required
          />
          {errors.password && (
            <p className="text-red-500 text-xs">{errors.password}</p>
          )}
        </div>
        <button
          type="submit"
          className="w-full py-2 px-4 bg-[var(--button-login-color)] text-white font-medium rounded-sm hover:bg-[var(--button-login-hover-color)]"
          disabled={loading}
        >
          {loading ? 'LOGGING IN...' : 'NEXT'}
        </button>
        <div className="text-center">
          <Link href="/auth/register">
            <span className="inline-block w-full py-2 px-4 hover:bg-gray-100 font-medium hover:rounded-sm">
              Sign Up for Free
            </span>
          </Link>
        </div>
      </form>
    </>
  );
};

export default LoginForm;

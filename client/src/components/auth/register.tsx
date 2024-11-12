import { BACKEND_URL } from "@/utils/const";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Loader from "../loader/Loader";

interface RegisterFormProps {
  initialEmail: string;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ initialEmail }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: initialEmail || "",
    password: "",
  });

  const [errors, setErrors] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  useEffect(() => {
    // Set initial email if it exists
    if (initialEmail) {
      setFormData((prev) => ({ ...prev, email: initialEmail }));
    }
  }, [initialEmail]);

  const validateForm = () => {
    const newErrors: any = {};
    if (!formData.firstName) newErrors.firstName = "First name required.";
    if (!formData.lastName) newErrors.lastName = "Last name required.";
    if (!formData.email) newErrors.email = "Email required.";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Invalid email address.";
    if (!formData.password) newErrors.password = "Password required.";
    return newErrors;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setErrors({
      ...errors,
      [e.target.name]: "",
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
          `${BACKEND_URL}/api/users/register`,
          formData
        );
        if (response.data) {
          setLoading(false);
          toast.success("Registration successful");
          router.push("/auth/login");
        }
      } catch (error: any) {
        setErrors({
          ...errors,
          email: error.response?.data?.message || "Registration failed",
        });
        setLoading(false);
      }
    }
  };

  return (
    <>
      {loading && <Loader isVisible={loading} message="Registering..." />}
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div>
          <h1 className="mt-2 font-sans text-3xl font-semibold leading-[1.25]">
            Let’s start!
          </h1>
          <p className="text-sm text-gray-600">
            Let’s get the basics. Enter your info below.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="firstName"
              className="block text-sm font-medium text-gray-700"
            >
              First name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              placeholder="First name"
              value={formData.firstName}
              onChange={handleChange}
              className={`mt-1 block w-full px-3 py-2 border ${
                errors.firstName ? "border-red-500" : "border-gray-300"
              } rounded-sm shadow-sm focus:outline-none sm:text-sm`}
              required
            />
            {errors.firstName && (
              <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>
            )}
          </div>
          <div>
            <label
              htmlFor="lastName"
              className="block text-sm font-medium text-gray-700"
            >
              Last name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              placeholder="Last name"
              value={formData.lastName}
              onChange={handleChange}
              className={`mt-1 block w-full px-3 py-2 border ${
                errors.lastName ? "border-red-500" : "border-gray-300"
              } rounded-sm shadow-sm focus:outline-none sm:text-sm`}
              required
            />
            {errors.lastName && (
              <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>
            )}
          </div>
        </div>
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
              errors.email ? "border-red-500" : "border-gray-300"
            } rounded-sm shadow-sm focus:outline-none sm:text-sm`}
            required
          />
          {errors.email && (
            <p className="text-red-500 text-xs mt-1">{errors.email}</p>
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
              errors.password ? "border-red-500" : "border-gray-300"
            } rounded-sm shadow-sm focus:outline-none sm:text-sm`}
            required
          />
          {errors.password && (
            <p className="text-red-500 text-xs mt-1">{errors.password}</p>
          )}
        </div>
        <button
          type="submit"
          className="w-full py-2 px-4 bg-[var(--button-login-color)] text-white font-medium rounded-sm hover:bg-[var(--button-login-hover-color)]"
          disabled={loading}
        >
          {loading ? "REGISTERING..." : "NEXT"}
        </button>
        <div className="text-center">
          <Link
            href="/auth/login"
            className="inline-block w-full py-2 px-4 hover:bg-gray-100 font-medium hover:rounded-sm hover:min-h-[40px] hover:min-w-[80px]"
          >
            Have an account? Log in
          </Link>
        </div>
      </form>
    </>
  );
};

export default RegisterForm;

'use client';
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/shared/PasswordInput";
import { useLogin } from "../api/useAuth";
import { errorToast, successToast } from "@/components/shared/tost";
import { fetchCsrfToken } from "@/lib/apiClient";
import { AxiosError, AxiosResponse } from "axios";
import { useRouter } from "next/navigation";
import PageLoader from "@/components/shared/PageLoader";
import { Mail, Lock, Plane } from "lucide-react";

interface LoginForm {
  email: string;
  password: string;
}

interface LoginResponse {
  message: string;
}

export function Login() {
  const [form, setForm] = useState<LoginForm>({ email: "", password: "" });
  const [errors, setErrors] = useState<Partial<LoginForm>>({});
  const { isloading, loginAuthUser } = useLogin();
  const router = useRouter();

  const handleLogin = async (e?: React.MouseEvent) => {
    e?.preventDefault();
    const validationErrors: Partial<LoginForm> = {};
    if (!form.email) {
      validationErrors.email = "Email is required";
    } else if (!/^\S+@\S+$/.test(form.email)) {
      validationErrors.email = "Invalid email format";
    }
    if (!form.password) {
      validationErrors.password = "Password is required";
    } else if (form.password.length < 8) {
      validationErrors.password = "Password must be at least 8 characters";
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});

    loginAuthUser(form, {
      onSuccess: async (e: AxiosResponse<LoginResponse>) => {
        successToast(e.data.message);
        // Login regenerates the session id – the old CSRF token is bound to
        // the previous session and would fail validation. Mint a fresh one.
        await fetchCsrfToken();
        router.push("/dashboard");
      },
      onError: (e) => {
        errorToast(e.response?.data?.message || "Something went wrong");
      },
    });
  };

  return (
    <div>
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-14 h-14 bg-brand-navy rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Plane size={24} className="text-brand-gold" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">Welcome Back</h2>
        <p className="text-sm text-slate-500 mt-1">Sign in to manage your travel dashboard</p>
      </div>

      {/* Form */}
      <div className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Email</label>
          <div className="relative">
            <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              type="email"
              name="email"
              className="pl-10 bg-slate-50 border-slate-200 rounded-xl h-12 focus:border-brand-primary focus:ring-brand-primary/20"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => {
                setForm({ ...form, email: e.target.value });
                setErrors((prev) => ({ ...prev, email: undefined }));
              }}
            />
          </div>
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Password</label>
          <div className="relative">
            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 z-10" />
            <PasswordInput
              name="password"
              className="pl-10 bg-slate-50 border-slate-200 rounded-xl h-12 focus:border-brand-primary focus:ring-brand-primary/20"
              placeholder="Enter your password"
              value={form.password}
              onChange={(e) => {
                setForm({ ...form, password: e.target.value });
                setErrors((prev) => ({ ...prev, password: undefined }));
              }}
            />
          </div>
          {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
        </div>

        <button
          type="button"
          className="w-full h-12 btn-primary flex items-center justify-center gap-2 mt-6"
          onClick={handleLogin}
          disabled={isloading}
        >
          {isloading ? (
            <>
              <PageLoader size="inline" />
              <span>Signing in...</span>
            </>
          ) : (
            <>
              <Plane size={16} />
              <span>Sign In to Dashboard</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

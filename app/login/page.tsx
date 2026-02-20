"use client";

import { useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Mail, Lock, User, Eye, EyeOff, GraduationCap, Sparkles,
  Phone, Github, Chrome, ArrowRight, ChevronLeft
} from "lucide-react";

type AuthMode = "email" | "phone" | "verify";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [mode, setMode] = useState<AuthMode>("email");
  
  const { 
    signIn, 
    signUp, 
    user, 
    signInWithProvider,
    signInWithPhone,
    verifyPhoneOtp
  } = useAuth();
  const router = useRouter();

  if (user) {
    router.push("/");
    return null;
  }

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    
    try {
      if (isSignUp) {
        await signUp(email, password, fullName);
      } else {
        await signIn(email, password);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    
    try {
      await signInWithPhone(phone);
      setMode("verify");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    
    try {
      await verifyPhoneOtp(phone, otp);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid code");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: "google" | "github") => {
    try {
      await signInWithProvider(provider);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F5F0] dark:bg-[#1A1A1A] p-4 transition-colors">
      <div className="w-full max-w-md">
        {/* Logo */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-[#E8D5C4] to-[#F5E6D3] dark:from-[#3D3530] dark:to-[#2A2520] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <GraduationCap className="w-8 h-8 text-[#2D2D2D] dark:text-[#E8D5C4]" />
          </div>
          <h1 className="text-2xl font-bold text-[#2D2D2D] dark:text-white">Sandstone</h1>
          <p className="text-[#8A8A8A] dark:text-[#A0A0A0] text-sm">AI-Powered Learning Platform</p>
        </motion.div>

        {/* Auth Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-[#2D2D2D] rounded-2xl border border-[#E5E5E0] dark:border-[#3D3D3D] shadow-card-hover p-8"
        >
          <AnimatePresence mode="wait">
            {mode === "email" && (
              <motion.div
                key="email"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="text-center mb-6">
                  <h2 className="text-xl font-semibold text-[#2D2D2D] dark:text-white mb-1">
                    {isSignUp ? "Create Account" : "Welcome Back"}
                  </h2>
                  <p className="text-sm text-[#8A8A8A] dark:text-[#A0A0A0]">
                    {isSignUp ? "Start your learning journey" : "Sign in to continue learning"}
                  </p>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#D4A8A8]/20 border border-[#D4A8A8] text-[#8B5A5A] px-4 py-3 rounded-xl mb-4 text-sm"
                  >
                    {error}
                  </motion.div>
                )}

                {/* Social Login */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <button
                    type="button"
                    onClick={() => handleSocialLogin("google")}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 border border-[#E5E5E0] dark:border-[#3D3D3D] rounded-xl hover:bg-[#F5F5F0] dark:hover:bg-[#3D3D3D] transition-colors"
                  >
                    <Chrome className="w-5 h-5 text-[#EA4335]" />
                    <span className="text-sm text-[#2D2D2D] dark:text-white">Google</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSocialLogin("github")}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 border border-[#E5E5E0] dark:border-[#3D3D3D] rounded-xl hover:bg-[#F5F5F0] dark:hover:bg-[#3D3D3D] transition-colors"
                  >
                    <Github className="w-5 h-5 text-[#2D2D2D] dark:text-white" />
                    <span className="text-sm text-[#2D2D2D] dark:text-white">GitHub</span>
                  </button>
                </div>

                <div className="relative mb-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[#E5E5E0] dark:border-[#3D3D3D]"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white dark:bg-[#2D2D2D] text-[#8A8A8A]">Or continue with</span>
                  </div>
                </div>

                <form onSubmit={handleEmailSubmit} className="space-y-4">
                  <AnimatePresence>
                    {isSignUp && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        <label className="block text-sm font-medium text-[#2D2D2D] dark:text-white mb-1.5">
                          Full Name
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8A8A8A]" />
                          <input
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-[#E5E5E0] dark:border-[#3D3D3D] dark:bg-[#1A1A1A] dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E8D5C4] focus:border-transparent transition-all bg-[#FAFAF8] dark:bg-[#252525]"
                            placeholder="Enter your name"
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div>
                    <label className="block text-sm font-medium text-[#2D2D2D] dark:text-white mb-1.5">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8A8A8A]" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-[#E5E5E0] dark:border-[#3D3D3D] dark:bg-[#1A1A1A] dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E8D5C4] focus:border-transparent transition-all bg-[#FAFAF8] dark:bg-[#252525]"
                        placeholder="you@example.com"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#2D2D2D] dark:text-white mb-1.5">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8A8A8A]" />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-10 pr-12 py-3 border border-[#E5E5E0] dark:border-[#3D3D3D] dark:bg-[#1A1A1A] dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E8D5C4] focus:border-transparent transition-all bg-[#FAFAF8] dark:bg-[#252525]"
                        placeholder="••••••••"
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A8A8A] hover:text-[#5A5A5A] transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-[#2D2D2D] dark:bg-[#E8D5C4] text-white dark:text-[#2D2D2D] py-3 rounded-xl hover:bg-[#1A1A1A] dark:hover:bg-[#D4C4B0] transition-all duration-200 font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                      />
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        {isSignUp ? "Create Account" : "Sign In"}
                      </>
                    )}
                  </button>
                </form>

                {/* Phone Login Option */}
                <button
                  onClick={() => setMode("phone")}
                  className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2.5 border border-[#E5E5E0] dark:border-[#3D3D3D] rounded-xl hover:bg-[#F5F5F0] dark:hover:bg-[#3D3D3D] transition-colors"
                >
                  <Phone className="w-4 h-4 text-[#8A8A8A]" />
                  <span className="text-sm text-[#5A5A5A] dark:text-[#A0A0A0]">Continue with Phone</span>
                </button>

                <div className="mt-6 text-center">
                  <p className="text-sm text-[#8A8A8A] dark:text-[#A0A0A0]">
                    {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setIsSignUp(!isSignUp);
                        setError("");
                      }}
                      className="text-[#2D2D2D] dark:text-[#E8D5C4] font-medium hover:underline"
                    >
                      {isSignUp ? "Sign In" : "Sign Up"}
                    </button>
                  </p>
                </div>
              </motion.div>
            )}

            {mode === "phone" && (
              <motion.div
                key="phone"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <button
                  onClick={() => setMode("email")}
                  className="flex items-center gap-2 text-[#8A8A8A] hover:text-[#2D2D2D] dark:hover:text-white mb-6"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </button>

                <div className="text-center mb-6">
                  <h2 className="text-xl font-semibold text-[#2D2D2D] dark:text-white mb-1">
                    Phone Login
                  </h2>
                  <p className="text-sm text-[#8A8A8A] dark:text-[#A0A0A0]">
                    Enter your phone number to receive a code
                  </p>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#D4A8A8]/20 border border-[#D4A8A8] text-[#8B5A5A] px-4 py-3 rounded-xl mb-4 text-sm"
                  >
                    {error}
                  </motion.div>
                )}

                <form onSubmit={handlePhoneSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#2D2D2D] dark:text-white mb-1.5">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8A8A8A]" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-[#E5E5E0] dark:border-[#3D3D3D] dark:bg-[#1A1A1A] dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E8D5C4] focus:border-transparent transition-all bg-[#FAFAF8] dark:bg-[#252525]"
                        placeholder="+1 (555) 000-0000"
                        required
                      />
                    </div>
                    <p className="text-xs text-[#8A8A8A] mt-1.5">
                      Include country code (e.g., +1 for US)
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-[#2D2D2D] dark:bg-[#E8D5C4] text-white dark:text-[#2D2D2D] py-3 rounded-xl hover:bg-[#1A1A1A] dark:hover:bg-[#D4C4B0] transition-all duration-200 font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isLoading ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                      />
                    ) : (
                      <>
                        <ArrowRight className="w-4 h-4" />
                        Send Code
                      </>
                    )}
                  </button>
                </form>
              </motion.div>
            )}

            {mode === "verify" && (
              <motion.div
                key="verify"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <button
                  onClick={() => setMode("phone")}
                  className="flex items-center gap-2 text-[#8A8A8A] hover:text-[#2D2D2D] dark:hover:text-white mb-6"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </button>

                <div className="text-center mb-6">
                  <h2 className="text-xl font-semibold text-[#2D2D2D] dark:text-white mb-1">
                    Verify Code
                  </h2>
                  <p className="text-sm text-[#8A8A8A] dark:text-[#A0A0A0]">
                    Enter the 6-digit code sent to {phone}
                  </p>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#D4A8A8]/20 border border-[#D4A8A8] text-[#8B5A5A] px-4 py-3 rounded-xl mb-4 text-sm"
                  >
                    {error}
                  </motion.div>
                )}

                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#2D2D2D] dark:text-white mb-1.5">
                      Verification Code
                    </label>
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="w-full px-4 py-3 border border-[#E5E5E0] dark:border-[#3D3D3D] dark:bg-[#1A1A1A] dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E8D5C4] focus:border-transparent transition-all bg-[#FAFAF8] dark:bg-[#252525] text-center text-2xl tracking-widest"
                      placeholder="000000"
                      maxLength={6}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || otp.length !== 6}
                    className="w-full bg-[#2D2D2D] dark:bg-[#E8D5C4] text-white dark:text-[#2D2D2D] py-3 rounded-xl hover:bg-[#1A1A1A] dark:hover:bg-[#D4C4B0] transition-all duration-200 font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isLoading ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                      />
                    ) : (
                      "Verify"
                    )}
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center text-xs text-[#8A8A8A] dark:text-[#A0A0A0] mt-6"
        >
          By continuing, you agree to our Terms of Service and Privacy Policy
        </motion.p>
      </div>
    </div>
  );
}

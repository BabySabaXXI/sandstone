"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useAuth } from "@/components/auth-provider";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { 
  Mail, Lock, User, Eye, EyeOff, GraduationCap, Sparkles,
  Phone, Github, Chrome, ArrowRight, ChevronLeft, CheckCircle2, AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

type AuthMode = "email" | "phone" | "verify";

interface FormErrors {
  email?: string;
  password?: string;
  fullName?: string;
  phone?: string;
  otp?: string;
  general?: string;
}

interface FormTouched {
  email?: boolean;
  password?: boolean;
  fullName?: boolean;
  phone?: boolean;
  otp?: boolean;
}

// Validation utilities
const validateEmail = (email: string): string | undefined => {
  if (!email.trim()) return "Email is required";
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return "Please enter a valid email address";
  return undefined;
};

const validatePassword = (password: string, isSignUp: boolean): string | undefined => {
  if (!password) return "Password is required";
  if (password.length < 6) return "Password must be at least 6 characters";
  if (isSignUp) {
    if (password.length < 8) return "Password must be at least 8 characters";
    if (!/[A-Z]/.test(password)) return "Password must contain at least one uppercase letter";
    if (!/[a-z]/.test(password)) return "Password must contain at least one lowercase letter";
    if (!/[0-9]/.test(password)) return "Password must contain at least one number";
  }
  return undefined;
};

const validateFullName = (name: string): string | undefined => {
  if (!name.trim()) return "Full name is required";
  if (name.trim().length < 2) return "Name must be at least 2 characters";
  if (!/^[a-zA-Z\s'-]+$/.test(name)) return "Name can only contain letters, spaces, hyphens and apostrophes";
  return undefined;
};

const validatePhone = (phone: string): string | undefined => {
  if (!phone.trim()) return "Phone number is required";
  // Allow formats: +1234567890, +1 (234) 567-890, 123-456-7890, etc.
  const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
  if (!phoneRegex.test(phone)) return "Please enter a valid phone number";
  const digitsOnly = phone.replace(/\D/g, '');
  if (digitsOnly.length < 10) return "Phone number must have at least 10 digits";
  if (digitsOnly.length > 15) return "Phone number is too long";
  return undefined;
};

const validateOtp = (otp: string): string | undefined => {
  if (!otp.trim()) return "Verification code is required";
  if (!/^\d{6}$/.test(otp)) return "Please enter a valid 6-digit code";
  return undefined;
};

export default function LoginPage() {
  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<AuthMode>("email");
  
  // Error and touched state
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<FormTouched>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  
  // Refs for focus management
  const emailInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);
  const fullNameInputRef = useRef<HTMLInputElement>(null);
  const phoneInputRef = useRef<HTMLInputElement>(null);
  const otpInputRef = useRef<HTMLInputElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);
  
  const { 
    signIn, 
    signUp, 
    user, 
    error: authError,
    signInWithProvider,
    signInWithPhone,
    verifyPhoneOtp
  } = useAuth();
  const router = useRouter();

  // Redirect if already logged in
  if (user) {
    router.push("/");
    return null;
  }

  // Reset form when switching modes
  const resetForm = useCallback(() => {
    setErrors({});
    setTouched({});
    setSubmitAttempted(false);
  }, []);

  // Handle mode changes
  const handleModeChange = useCallback((newMode: AuthMode) => {
    setMode(newMode);
    resetForm();
  }, [resetForm]);

  // Handle sign up toggle
  const handleSignUpToggle = useCallback(() => {
    setIsSignUp(prev => !prev);
    resetForm();
  }, [resetForm]);

  // Real-time validation
  useEffect(() => {
    const newErrors: FormErrors = {};
    
    if (touched.email || submitAttempted) {
      newErrors.email = validateEmail(email);
    }
    if (touched.password || submitAttempted) {
      newErrors.password = validatePassword(password, isSignUp);
    }
    if ((touched.fullName || submitAttempted) && isSignUp) {
      newErrors.fullName = validateFullName(fullName);
    }
    if (touched.phone || submitAttempted) {
      newErrors.phone = validatePhone(phone);
    }
    if (touched.otp || submitAttempted) {
      newErrors.otp = validateOtp(otp);
    }
    
    setErrors(prev => ({ ...prev, ...newErrors }));
  }, [email, password, fullName, phone, otp, touched, submitAttempted, isSignUp]);

  // Focus on first error after submission
  const focusFirstError = useCallback(() => {
    setTimeout(() => {
      if (errors.email) emailInputRef.current?.focus();
      else if (errors.fullName && isSignUp) fullNameInputRef.current?.focus();
      else if (errors.password) passwordInputRef.current?.focus();
      else if (errors.phone) phoneInputRef.current?.focus();
      else if (errors.otp) otpInputRef.current?.focus();
      else if (errors.general) errorRef.current?.focus();
    }, 100);
  }, [errors, isSignUp]);

  // Email form submission
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitAttempted(true);
    
    // Validate all fields
    const newErrors: FormErrors = {
      email: validateEmail(email),
      password: validatePassword(password, isSignUp),
    };
    
    if (isSignUp) {
      newErrors.fullName = validateFullName(fullName);
    }
    
    setErrors(newErrors);
    
    // Check if there are any errors
    const hasErrors = Object.values(newErrors).some(error => error !== undefined);
    
    if (hasErrors) {
      focusFirstError();
      return;
    }
    
    setIsLoading(true);
    
    try {
      if (isSignUp) {
        await signUp(email, password, fullName);
        toast.success("Account created successfully!");
      } else {
        await signIn(email, password);
        toast.success("Signed in successfully!");
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      let errorMessage = "An error occurred. Please try again.";
      
      if (err.message?.includes("fetch") || err.message?.includes("network")) {
        errorMessage = "Connection error. Please check your internet connection and try again.";
      } else if (err.message?.includes("Invalid login")) {
        errorMessage = "Invalid email or password. Please try again.";
      } else if (err.message?.includes("Email not confirmed")) {
        errorMessage = "Please confirm your email address before signing in.";
      } else if (err.message?.includes("User already registered")) {
        errorMessage = "An account with this email already exists. Please sign in instead.";
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setErrors(prev => ({ ...prev, general: errorMessage }));
      focusFirstError();
    } finally {
      setIsLoading(false);
    }
  };

  // Phone form submission
  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitAttempted(true);
    
    const phoneError = validatePhone(phone);
    setErrors(prev => ({ ...prev, phone: phoneError }));
    
    if (phoneError) {
      phoneInputRef.current?.focus();
      return;
    }
    
    setIsLoading(true);
    
    try {
      await signInWithPhone(phone);
      toast.success("Verification code sent!");
      handleModeChange("verify");
    } catch (err: any) {
      console.error("Phone auth error:", err);
      const errorMessage = err.message || "Failed to send verification code. Please try again.";
      setErrors(prev => ({ ...prev, general: errorMessage }));
    } finally {
      setIsLoading(false);
    }
  };

  // OTP verification submission
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitAttempted(true);
    
    const otpError = validateOtp(otp);
    setErrors(prev => ({ ...prev, otp: otpError }));
    
    if (otpError) {
      otpInputRef.current?.focus();
      return;
    }
    
    setIsLoading(true);
    
    try {
      await verifyPhoneOtp(phone, otp);
      toast.success("Phone verified successfully!");
    } catch (err: any) {
      console.error("OTP verification error:", err);
      const errorMessage = err.message || "Invalid verification code. Please try again.";
      setErrors(prev => ({ ...prev, general: errorMessage, otp: "Invalid code" }));
      otpInputRef.current?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  // Social login handler
  const handleSocialLogin = async (provider: "google" | "github") => {
    try {
      await signInWithProvider(provider);
    } catch (err: any) {
      console.error("Social login error:", err);
      const errorMessage = err.message || `Failed to sign in with ${provider}. Please try again.`;
      setErrors(prev => ({ ...prev, general: errorMessage }));
    }
  };

  // Input change handlers with touch tracking
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setTouched(prev => ({ ...prev, email: true }));
    if (errors.general) setErrors(prev => ({ ...prev, general: undefined }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setTouched(prev => ({ ...prev, password: true }));
    if (errors.general) setErrors(prev => ({ ...prev, general: undefined }));
  };

  const handleFullNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFullName(e.target.value);
    setTouched(prev => ({ ...prev, fullName: true }));
    if (errors.general) setErrors(prev => ({ ...prev, general: undefined }));
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow digits, spaces, +, -, (, )
    const value = e.target.value.replace(/[^\d\s\+\-\(\)]/g, '');
    setPhone(value);
    setTouched(prev => ({ ...prev, phone: true }));
    if (errors.general) setErrors(prev => ({ ...prev, general: undefined }));
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow digits
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setOtp(value);
    setTouched(prev => ({ ...prev, otp: true }));
    if (errors.general) setErrors(prev => ({ ...prev, general: undefined }));
  };

  // Password strength indicator
  const getPasswordStrength = (password: string): { strength: number; label: string } => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    
    const labels = ["Very Weak", "Weak", "Fair", "Good", "Strong", "Very Strong"];
    return { strength, label: labels[strength] };
  };

  const passwordStrength = isSignUp ? getPasswordStrength(password) : null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-soft">
            <GraduationCap className="w-8 h-8 text-accent-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Sandstone</h1>
          <p className="text-muted-foreground text-sm">AI-Powered Learning Platform</p>
        </motion.div>

        {/* Auth Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card border border-border rounded-2xl shadow-soft p-8"
        >
          {/* Config Error Banner */}
          {authError && (
            <div 
              role="alert"
              className="mb-6 p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl"
            >
              <p className="text-sm text-amber-800 dark:text-amber-200">
                <strong>Configuration Issue:</strong> {authError}
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                Please check the ENV_SETUP.md file for configuration instructions.
              </p>
            </div>
          )}

          {/* General Error Display */}
          <AnimatePresence>
            {errors.general && (
              <motion.div
                ref={errorRef}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                role="alert"
                aria-live="assertive"
                tabIndex={-1}
                className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-xl mb-4 text-sm flex items-start gap-2"
              >
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" aria-hidden="true" />
                <span>{errors.general}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {mode === "email" && (
              <motion.div
                key="email"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="text-center mb-6">
                  <h2 className="text-xl font-semibold text-foreground mb-1">
                    {isSignUp ? "Create Account" : "Welcome Back"}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {isSignUp ? "Start your learning journey" : "Sign in to continue learning"}
                  </p>
                </div>

                {/* Social Login */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <button
                    type="button"
                    onClick={() => handleSocialLogin("google")}
                    disabled={isLoading}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 border border-border rounded-xl hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Sign in with Google"
                  >
                    <Chrome className="w-5 h-5 text-[#EA4335]" aria-hidden="true" />
                    <span className="text-sm text-foreground">Google</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSocialLogin("github")}
                    disabled={isLoading}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 border border-border rounded-xl hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Sign in with GitHub"
                  >
                    <Github className="w-5 h-5 text-foreground" aria-hidden="true" />
                    <span className="text-sm text-foreground">GitHub</span>
                  </button>
                </div>

                <div className="relative mb-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-card text-muted-foreground">Or continue with</span>
                  </div>
                </div>

                <form onSubmit={handleEmailSubmit} className="space-y-4" noValidate>
                  <AnimatePresence>
                    {isSignUp && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        <label 
                          htmlFor="fullName"
                          className="block text-sm font-medium text-foreground mb-1.5"
                        >
                          Full Name <span className="text-destructive" aria-hidden="true">*</span>
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" aria-hidden="true" />
                          <input
                            ref={fullNameInputRef}
                            id="fullName"
                            name="fullName"
                            type="text"
                            value={fullName}
                            onChange={handleFullNameChange}
                            onBlur={() => setTouched(prev => ({ ...prev, fullName: true }))}
                            className={cn(
                              "w-full pl-10 pr-4 py-3 border rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all",
                              errors.fullName && touched.fullName ? "border-destructive" : "border-border"
                            )}
                            placeholder="Enter your name"
                            aria-required="true"
                            aria-invalid={errors.fullName && touched.fullName ? "true" : "false"}
                            aria-describedby={errors.fullName && touched.fullName ? "fullName-error" : undefined}
                            autoComplete="name"
                          />
                        </div>
                        <AnimatePresence>
                          {errors.fullName && touched.fullName && (
                            <motion.p
                              initial={{ opacity: 0, y: -5 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -5 }}
                              id="fullName-error"
                              role="alert"
                              className="text-sm text-destructive mt-1.5 flex items-center gap-1"
                            >
                              <AlertCircle className="w-3 h-3" aria-hidden="true" />
                              {errors.fullName}
                            </motion.p>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div>
                    <label 
                      htmlFor="email"
                      className="block text-sm font-medium text-foreground mb-1.5"
                    >
                      Email Address <span className="text-destructive" aria-hidden="true">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" aria-hidden="true" />
                      <input
                        ref={emailInputRef}
                        id="email"
                        name="email"
                        type="email"
                        value={email}
                        onChange={handleEmailChange}
                        onBlur={() => setTouched(prev => ({ ...prev, email: true }))}
                        className={cn(
                          "w-full pl-10 pr-4 py-3 border rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all",
                          errors.email && touched.email ? "border-destructive" : "border-border"
                        )}
                        placeholder="you@example.com"
                        aria-required="true"
                        aria-invalid={errors.email && touched.email ? "true" : "false"}
                        aria-describedby={errors.email && touched.email ? "email-error" : undefined}
                        autoComplete="email"
                      />
                    </div>
                    <AnimatePresence>
                      {errors.email && touched.email && (
                        <motion.p
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          id="email-error"
                          role="alert"
                          className="text-sm text-destructive mt-1.5 flex items-center gap-1"
                        >
                          <AlertCircle className="w-3 h-3" aria-hidden="true" />
                          {errors.email}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  <div>
                    <label 
                      htmlFor="password"
                      className="block text-sm font-medium text-foreground mb-1.5"
                    >
                      Password <span className="text-destructive" aria-hidden="true">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" aria-hidden="true" />
                      <input
                        ref={passwordInputRef}
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={handlePasswordChange}
                        onBlur={() => setTouched(prev => ({ ...prev, password: true }))}
                        className={cn(
                          "w-full pl-10 pr-12 py-3 border rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all",
                          errors.password && touched.password ? "border-destructive" : "border-border"
                        )}
                        placeholder="••••••••"
                        aria-required="true"
                        aria-invalid={errors.password && touched.password ? "true" : "false"}
                        aria-describedby={errors.password && touched.password ? "password-error" : isSignUp && password ? "password-strength" : undefined}
                        autoComplete={isSignUp ? "new-password" : "current-password"}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        aria-pressed={showPassword}
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" aria-hidden="true" /> : <Eye className="w-5 h-5" aria-hidden="true" />}
                      </button>
                    </div>
                    <AnimatePresence>
                      {errors.password && touched.password && (
                        <motion.p
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          id="password-error"
                          role="alert"
                          className="text-sm text-destructive mt-1.5 flex items-center gap-1"
                        >
                          <AlertCircle className="w-3 h-3" aria-hidden="true" />
                          {errors.password}
                        </motion.p>
                      )}
                    </AnimatePresence>
                    
                    {/* Password Strength Indicator */}
                    <AnimatePresence>
                      {isSignUp && password && !errors.password && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          id="password-strength"
                          className="mt-2"
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${(passwordStrength!.strength / 5) * 100}%` }}
                                className={cn(
                                  "h-full transition-colors duration-300",
                                  passwordStrength!.strength <= 1 ? "bg-destructive" :
                                  passwordStrength!.strength <= 3 ? "bg-yellow-500" :
                                  "bg-green-500"
                                )}
                              />
                            </div>
                            <span className={cn(
                              "text-xs font-medium",
                              passwordStrength!.strength <= 1 ? "text-destructive" :
                              passwordStrength!.strength <= 3 ? "text-yellow-500" :
                              "text-green-500"
                            )}>
                              {passwordStrength!.label}
                            </span>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-primary text-primary-foreground py-3 rounded-xl hover:bg-primary/90 transition-all duration-200 font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-busy={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                          aria-hidden="true"
                        />
                        <span>{isSignUp ? "Creating Account..." : "Signing In..."}</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" aria-hidden="true" />
                        <span>{isSignUp ? "Create Account" : "Sign In"}</span>
                      </>
                    )}
                  </button>
                </form>

                {/* Phone Login Option */}
                <button
                  type="button"
                  onClick={() => handleModeChange("phone")}
                  disabled={isLoading}
                  className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2.5 border border-border rounded-xl hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Phone className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
                  <span className="text-sm text-muted-foreground">Continue with Phone</span>
                </button>

                <div className="mt-6 text-center">
                  <p className="text-sm text-muted-foreground">
                    {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
                    <button
                      type="button"
                      onClick={handleSignUpToggle}
                      disabled={isLoading}
                      className="text-foreground font-medium hover:underline disabled:opacity-50"
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
                  type="button"
                  onClick={() => handleModeChange("email")}
                  disabled={isLoading}
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 disabled:opacity-50"
                >
                  <ChevronLeft className="w-4 h-4" aria-hidden="true" />
                  Back
                </button>

                <div className="text-center mb-6">
                  <h2 className="text-xl font-semibold text-foreground mb-1">
                    Phone Login
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Enter your phone number to receive a code
                  </p>
                </div>

                <form onSubmit={handlePhoneSubmit} className="space-y-4" noValidate>
                  <div>
                    <label 
                      htmlFor="phone"
                      className="block text-sm font-medium text-foreground mb-1.5"
                    >
                      Phone Number <span className="text-destructive" aria-hidden="true">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" aria-hidden="true" />
                      <input
                        ref={phoneInputRef}
                        id="phone"
                        name="phone"
                        type="tel"
                        value={phone}
                        onChange={handlePhoneChange}
                        onBlur={() => setTouched(prev => ({ ...prev, phone: true }))}
                        className={cn(
                          "w-full pl-10 pr-4 py-3 border rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all",
                          errors.phone && touched.phone ? "border-destructive" : "border-border"
                        )}
                        placeholder="+1 (555) 000-0000"
                        aria-required="true"
                        aria-invalid={errors.phone && touched.phone ? "true" : "false"}
                        aria-describedby={errors.phone && touched.phone ? "phone-error" : "phone-hint"}
                        autoComplete="tel"
                      />
                    </div>
                    <AnimatePresence>
                      {errors.phone && touched.phone ? (
                        <motion.p
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          id="phone-error"
                          role="alert"
                          className="text-sm text-destructive mt-1.5 flex items-center gap-1"
                        >
                          <AlertCircle className="w-3 h-3" aria-hidden="true" />
                          {errors.phone}
                        </motion.p>
                      ) : (
                        <p id="phone-hint" className="text-xs text-muted-foreground mt-1.5">
                          Include country code (e.g., +1 for US)
                        </p>
                      )}
                    </AnimatePresence>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-primary text-primary-foreground py-3 rounded-xl hover:bg-primary/90 transition-all duration-200 font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                    aria-busy={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                          aria-hidden="true"
                        />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <ArrowRight className="w-4 h-4" aria-hidden="true" />
                        <span>Send Code</span>
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
                  type="button"
                  onClick={() => handleModeChange("phone")}
                  disabled={isLoading}
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 disabled:opacity-50"
                >
                  <ChevronLeft className="w-4 h-4" aria-hidden="true" />
                  Back
                </button>

                <div className="text-center mb-6">
                  <h2 className="text-xl font-semibold text-foreground mb-1">
                    Verify Code
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Enter the 6-digit code sent to <span className="font-medium text-foreground">{phone}</span>
                  </p>
                </div>

                <form onSubmit={handleVerifyOtp} className="space-y-4" noValidate>
                  <div>
                    <label 
                      htmlFor="otp"
                      className="block text-sm font-medium text-foreground mb-1.5"
                    >
                      Verification Code <span className="text-destructive" aria-hidden="true">*</span>
                    </label>
                    <input
                      ref={otpInputRef}
                      id="otp"
                      name="otp"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={otp}
                      onChange={handleOtpChange}
                      onBlur={() => setTouched(prev => ({ ...prev, otp: true }))}
                      className={cn(
                        "w-full px-4 py-3 border rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all text-center text-2xl tracking-widest",
                        errors.otp && touched.otp ? "border-destructive" : "border-border"
                      )}
                      placeholder="000000"
                      maxLength={6}
                      aria-required="true"
                      aria-invalid={errors.otp && touched.otp ? "true" : "false"}
                      aria-describedby={errors.otp && touched.otp ? "otp-error" : "otp-hint"}
                      autoComplete="one-time-code"
                    />
                    <AnimatePresence>
                      {errors.otp && touched.otp ? (
                        <motion.p
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          id="otp-error"
                          role="alert"
                          className="text-sm text-destructive mt-1.5 flex items-center gap-1 justify-center"
                        >
                          <AlertCircle className="w-3 h-3" aria-hidden="true" />
                          {errors.otp}
                        </motion.p>
                      ) : (
                        <p id="otp-hint" className="text-xs text-muted-foreground mt-1.5 text-center">
                          Enter the 6-digit code
                        </p>
                      )}
                    </AnimatePresence>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || otp.length !== 6}
                    className="w-full bg-primary text-primary-foreground py-3 rounded-xl hover:bg-primary/90 transition-all duration-200 font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                    aria-busy={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                          aria-hidden="true"
                        />
                        <span>Verifying...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                        <span>Verify</span>
                      </>
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
          className="text-center text-xs text-muted-foreground mt-6"
        >
          By continuing, you agree to our{" "}
          <a href="#" className="underline hover:text-foreground transition-colors">Terms of Service</a>
          {" "}and{" "}
          <a href="#" className="underline hover:text-foreground transition-colors">Privacy Policy</a>
        </motion.p>
      </div>
    </div>
  );
}

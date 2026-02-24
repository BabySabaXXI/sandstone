"use client";

import { useCallback, useRef } from "react";
import { useAuth } from "@/components/auth-provider";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { 
  Mail, Lock, User, GraduationCap, Sparkles,
  Phone, Github, Chrome, ArrowRight, ChevronLeft, CheckCircle2, AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { FormInput } from "@/components/ui/form-input";
import { useForm } from "@/hooks/use-form";
import { validators, calculatePasswordStrength } from "@/lib/validation";

type AuthMode = "email" | "phone" | "verify";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  },
  exit: { opacity: 0 }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

export default function LoginPage() {
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
  const modeRef = useRef<AuthMode>("email");

  // Redirect if already logged in
  if (user) {
    router.push("/");
    return null;
  }

  // Email/Password Form
  const emailForm = useForm({
    initialValues: {
      email: "",
      password: "",
      fullName: "",
    },
    validators: {
      email: [validators.email],
      password: [validators.password],
      fullName: [validators.name],
    },
    validateOnChange: true,
    validateOnBlur: true,
  });

  // Phone Form
  const phoneForm = useForm({
    initialValues: { phone: "" },
    validators: {
      phone: [validators.phone],
    },
    validateOnChange: true,
    validateOnBlur: true,
  });

  // OTP Form
  const otpForm = useForm({
    initialValues: { otp: "" },
    validators: {
      otp: [validators.otp(6)],
    },
    validateOnChange: true,
    validateOnBlur: true,
  });

  // Handle mode change
  const handleModeChange = useCallback((newMode: AuthMode) => {
    modeRef.current = newMode;
    // Reset all forms when changing modes
    emailForm.reset();
    phoneForm.reset();
    otpForm.reset();
  }, [emailForm, phoneForm, otpForm]);

  // Email form submission
  const handleEmailSubmit = async (e: React.FormEvent, isSignUp: boolean) => {
    e.preventDefault();
    
    // Validate all fields
    const isValid = emailForm.validateAll();
    if (!isValid) return;

    emailForm.setSubmitting(true);
    
    try {
      if (isSignUp) {
        await signUp(emailForm.values.email, emailForm.values.password, emailForm.values.fullName);
        toast.success("Account created successfully!");
      } else {
        await signIn(emailForm.values.email, emailForm.values.password);
        toast.success("Signed in successfully!");
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      handleAuthError(err, emailForm.setError);
    } finally {
      emailForm.setSubmitting(false);
    }
  };

  // Phone form submission
  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const isValid = phoneForm.validateAll();
    if (!isValid) return;

    phoneForm.setSubmitting(true);
    
    try {
      await signInWithPhone(phoneForm.values.phone);
      toast.success("Verification code sent!");
      handleModeChange("verify");
    } catch (err: any) {
      console.error("Phone auth error:", err);
      handleAuthError(err, phoneForm.setError);
    } finally {
      phoneForm.setSubmitting(false);
    }
  };

  // OTP verification submission
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const isValid = otpForm.validateAll();
    if (!isValid) return;

    otpForm.setSubmitting(true);
    
    try {
      await verifyPhoneOtp(phoneForm.values.phone, otpForm.values.otp);
      toast.success("Phone verified successfully!");
    } catch (err: any) {
      console.error("OTP verification error:", err);
      handleAuthError(err, otpForm.setError);
      otpForm.setError("otp", "Invalid code");
    } finally {
      otpForm.setSubmitting(false);
    }
  };

  // Social login handler
  const handleSocialLogin = async (provider: "google" | "github") => {
    try {
      await signInWithProvider(provider);
    } catch (err: any) {
      console.error("Social login error:", err);
      emailForm.setError("email", err.message || `Failed to sign in with ${provider}`);
    }
  };

  // Handle auth errors
  const handleAuthError = (err: any, setError: (field: any, error: string) => void) => {
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
    
    setError("email" as any, errorMessage);
  };

  // Password strength
  const passwordStrength = calculatePasswordStrength(emailForm.values.password);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div 
        className="w-full max-w-md"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Logo */}
        <motion.div variants={itemVariants} className="text-center mb-8">
          <div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-soft">
            <GraduationCap className="w-8 h-8 text-accent-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Sandstone</h1>
          <p className="text-muted-foreground text-sm">AI-Powered Learning Platform</p>
        </motion.div>

        {/* Auth Card */}
        <motion.div
          variants={itemVariants}
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
            {(emailForm.errors.email || phoneForm.errors.phone || otpForm.errors.otp) && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                role="alert"
                aria-live="assertive"
                className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-xl mb-4 text-sm flex items-start gap-2"
              >
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" aria-hidden="true" />
                <span>
                  {emailForm.errors.email || phoneForm.errors.phone || otpForm.errors.otp}
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {modeRef.current === "email" && (
              <EmailForm
                key="email"
                form={emailForm}
                onSubmit={handleEmailSubmit}
                onSocialLogin={handleSocialLogin}
                onModeChange={() => handleModeChange("phone")}
                passwordStrength={passwordStrength}
              />
            )}

            {modeRef.current === "phone" && (
              <PhoneForm
                key="phone"
                form={phoneForm}
                onSubmit={handlePhoneSubmit}
                onBack={() => handleModeChange("email")}
              />
            )}

            {modeRef.current === "verify" && (
              <VerifyForm
                key="verify"
                form={otpForm}
                phone={phoneForm.values.phone}
                onSubmit={handleVerifyOtp}
                onBack={() => handleModeChange("phone")}
              />
            )}
          </AnimatePresence>
        </motion.div>

        {/* Footer */}
        <motion.p
          variants={itemVariants}
          className="text-center text-xs text-muted-foreground mt-6"
        >
          By continuing, you agree to our{" "}
          <a href="#" className="underline hover:text-foreground transition-colors">Terms of Service</a>
          {" "}and{" "}
          <a href="#" className="underline hover:text-foreground transition-colors">Privacy Policy</a>
        </motion.p>
      </motion.div>
    </div>
  );
}

// Email Form Component
interface EmailFormProps {
  form: ReturnType<typeof useForm>;
  onSubmit: (e: React.FormEvent, isSignUp: boolean) => void;
  onSocialLogin: (provider: "google" | "github") => void;
  onModeChange: () => void;
  passwordStrength: ReturnType<typeof calculatePasswordStrength>;
}

function EmailForm({ form, onSubmit, onSocialLogin, onModeChange, passwordStrength }: EmailFormProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const emailField = form.getFieldProps("email");
  const passwordField = form.getFieldProps("password");
  const fullNameField = form.getFieldProps("fullName");

  const toggleSignUp = () => {
    setIsSignUp(!isSignUp);
    form.reset();
  };

  return (
    <motion.div
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
        <SocialButton provider="google" onClick={() => onSocialLogin("google")} disabled={form.isSubmitting} />
        <SocialButton provider="github" onClick={() => onSocialLogin("github")} disabled={form.isSubmitting} />
      </div>

      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-card text-muted-foreground">Or continue with</span>
        </div>
      </div>

      <form onSubmit={(e) => onSubmit(e, isSignUp)} className="space-y-4" noValidate>
        <AnimatePresence>
          {isSignUp && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <FormInput
                label="Full Name"
                icon={User}
                placeholder="Enter your name"
                requiredIndicator
                autoComplete="name"
                {...fullNameField}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <FormInput
          label="Email Address"
          type="email"
          icon={Mail}
          placeholder="you@example.com"
          requiredIndicator
          autoComplete="email"
          {...emailField}
        />

        <div>
          <FormInput
            label="Password"
            type="password"
            icon={Lock}
            placeholder="••••••••"
            requiredIndicator
            showPasswordToggle
            autoComplete={isSignUp ? "new-password" : "current-password"}
            {...passwordField}
          />
          
          {/* Password Strength Indicator */}
          <AnimatePresence>
            {isSignUp && form.values.password && !form.errors.password && (
              <PasswordStrengthIndicator strength={passwordStrength} />
            )}
          </AnimatePresence>
        </div>

        <SubmitButton
          isLoading={form.isSubmitting}
          loadingText={isSignUp ? "Creating Account..." : "Signing In..."}
          text={isSignUp ? "Create Account" : "Sign In"}
        />
      </form>

      {/* Phone Login Option */}
      <button
        type="button"
        onClick={onModeChange}
        disabled={form.isSubmitting}
        className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2.5 border border-border rounded-xl hover:bg-secondary transition-colors disabled:opacity-50"
      >
        <Phone className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
        <span className="text-sm text-muted-foreground">Continue with Phone</span>
      </button>

      <div className="mt-6 text-center">
        <p className="text-sm text-muted-foreground">
          {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
          <button
            type="button"
            onClick={toggleSignUp}
            disabled={form.isSubmitting}
            className="text-foreground font-medium hover:underline disabled:opacity-50"
          >
            {isSignUp ? "Sign In" : "Sign Up"}
          </button>
        </p>
      </div>
    </motion.div>
  );
}

// Phone Form Component
interface PhoneFormProps {
  form: ReturnType<typeof useForm>;
  onSubmit: (e: React.FormEvent) => void;
  onBack: () => void;
}

function PhoneForm({ form, onSubmit, onBack }: PhoneFormProps) {
  const phoneField = form.getFieldProps("phone");

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <button
        type="button"
        onClick={onBack}
        disabled={form.isSubmitting}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 disabled:opacity-50"
      >
        <ChevronLeft className="w-4 h-4" aria-hidden="true" />
        Back
      </button>

      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold text-foreground mb-1">Phone Login</h2>
        <p className="text-sm text-muted-foreground">Enter your phone number to receive a code</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <FormInput
          label="Phone Number"
          type="tel"
          icon={Phone}
          placeholder="+1 (555) 000-0000"
          requiredIndicator
          helperText="Include country code (e.g., +1 for US)"
          autoComplete="tel"
          {...phoneField}
        />

        <SubmitButton
          isLoading={form.isSubmitting}
          loadingText="Sending..."
          text="Send Code"
          icon={ArrowRight}
        />
      </form>
    </motion.div>
  );
}

// Verify Form Component
interface VerifyFormProps {
  form: ReturnType<typeof useForm>;
  phone: string;
  onSubmit: (e: React.FormEvent) => void;
  onBack: () => void;
}

function VerifyForm({ form, phone, onSubmit, onBack }: VerifyFormProps) {
  const otpField = form.getFieldProps("otp");

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <button
        type="button"
        onClick={onBack}
        disabled={form.isSubmitting}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 disabled:opacity-50"
      >
        <ChevronLeft className="w-4 h-4" aria-hidden="true" />
        Back
      </button>

      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold text-foreground mb-1">Verify Code</h2>
        <p className="text-sm text-muted-foreground">
          Enter the 6-digit code sent to <span className="font-medium text-foreground">{phone}</span>
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <FormInput
          label="Verification Code"
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          placeholder="000000"
          requiredIndicator
          helperText="Enter the 6-digit code"
          maxLength={6}
          autoComplete="one-time-code"
          {...otpField}
        />

        <SubmitButton
          isLoading={form.isSubmitting}
          loadingText="Verifying..."
          text="Verify"
          icon={CheckCircle2}
          disabled={form.values.otp.length !== 6}
        />
      </form>
    </motion.div>
  );
}

// Helper Components

function SocialButton({ 
  provider, 
  onClick, 
  disabled 
}: { 
  provider: "google" | "github"; 
  onClick: () => void; 
  disabled: boolean;
}) {
  const Icon = provider === "google" ? Chrome : Github;
  const colorClass = provider === "google" ? "text-[#EA4335]" : "text-foreground";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex items-center justify-center gap-2 px-4 py-2.5 border border-border rounded-xl hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      aria-label={`Sign in with ${provider}`}
    >
      <Icon className={cn("w-5 h-5", colorClass)} aria-hidden="true" />
      <span className="text-sm text-foreground capitalize">{provider}</span>
    </button>
  );
}

function SubmitButton({ 
  isLoading, 
  loadingText, 
  text, 
  icon: Icon = Sparkles,
  disabled = false
}: { 
  isLoading: boolean; 
  loadingText: string; 
  text: string;
  icon?: React.ElementType;
  disabled?: boolean;
}) {
  return (
    <button
      type="submit"
      disabled={isLoading || disabled}
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
          <span>{loadingText}</span>
        </>
      ) : (
        <>
          <Icon className="w-4 h-4" aria-hidden="true" />
          <span>{text}</span>
        </>
      )}
    </button>
  );
}

function PasswordStrengthIndicator({ 
  strength 
}: { 
  strength: ReturnType<typeof calculatePasswordStrength>;
}) {
  const colors = [
    "bg-destructive",
    "bg-destructive",
    "bg-yellow-500",
    "bg-yellow-500",
    "bg-green-500",
    "bg-green-500",
  ];

  const textColors = [
    "text-destructive",
    "text-destructive",
    "text-yellow-500",
    "text-yellow-500",
    "text-green-500",
    "text-green-500",
  ];

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="mt-2"
    >
      <div className="flex items-center gap-2 mb-1">
        <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(strength.score / 5) * 100}%` }}
            className={cn("h-full transition-colors duration-300", colors[strength.score])}
          />
        </div>
        <span className={cn("text-xs font-medium", textColors[strength.score])}>
          {strength.label}
        </span>
      </div>
    </motion.div>
  );
}

// Import useState at the top
import { useState } from "react";

"use client";

import { useState, FormEvent, ChangeEvent } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, collection } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { useRouter } from 'next/navigation';
import { 
  Mail, Lock, Terminal, Loader2, Eye, EyeOff, 
  Briefcase, Building2, Users, ChevronRight, ChevronLeft, CheckCircle2 
} from 'lucide-react';

interface FormErrors {
  businessName?: string;
  industry?: string;
  companySize?: string;
  email?: string;
  password?: string;
}

export default function SignupForm() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  
  // Form Field States
  const [businessName, setBusinessName] = useState<string>('');
  const [industry, setIndustry] = useState<string>('');
  const [companySize, setCompanySize] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  
  // UI States
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [validationErrors, setValidationErrors] = useState<FormErrors>({});

  // 1. Real-time Password Strength Calculator
  const calculatePasswordStrength = (pass: string): { score: number; label: string; color: string } => {
    if (!pass) return { score: 0, label: 'Not Entered', color: 'bg-slate-700' };
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    switch (score) {
      case 1: return { score: 25, label: 'Weak', color: 'bg-red-500' };
      case 2: return { score: 50, label: 'Fair', color: 'bg-orange-500' };
      case 3: return { score: 75, label: 'Good', color: 'bg-yellow-500' };
      case 4: return { score: 100, label: 'Strong', color: 'bg-emerald-500' };
      default: return { score: 0, label: 'Too Short', color: 'bg-red-600' };
    }
  };

  const passwordStrength = calculatePasswordStrength(password);

  // 2. Client-Side Step Validators
  const validateStep = (step: number): boolean => {
    const errors: FormErrors = {};
    
    if (step === 1) {
      if (!businessName.trim()) errors.businessName = 'Company name identifier is required.';
      if (!industry) errors.industry = 'Operational industry selection is required.';
      if (!companySize) errors.companySize = 'Node capacity/company size is required.';
    }
    
    if (step === 2) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email.trim()) errors.email = 'Work email address is required.';
      else if (!emailRegex.test(email)) errors.email = 'Invalid operational email syntax.';
      
      if (!password) errors.password = 'Security keyphrase is required.';
      else if (password.length < 6) errors.password = 'Keyphrase must contain at least 6 characters.';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrevStep = () => {
    setError('');
    setCurrentStep((prev) => prev - 1);
  };

  // 3. Final Form Submission Handle with Verification Logging
  const handleSignup = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateStep(2)) return;
    
    setError('');
    setSubmitting(true);
    console.log("LOG: Multi-tenant signup sequence initialized.");

    try {
      // 1. Register User inside Firebase Authentication
      console.log("LOG: Requesting Firebase Auth user creation...");
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log("LOG: Firebase Auth registration success. User UID:", user.uid);

      // 2. Initialize the Business Document Reference
      const newBusinessRef = doc(collection(db, 'businesses'));
      const businessId = newBusinessRef.id;
      console.log("LOG: Generated Tenant Business ID reference:", businessId);
      
      console.log("LOG: Pushing write stream to /businesses collection...");
      await setDoc(newBusinessRef, {
        name: businessName,
        slug: businessName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        industry,
        companySize,
        createdAt: new Date(),
      });
      console.log("LOG: /businesses write verified successfully.");

      // 3. Create User Document mapped directly to this new business tenant
      console.log("LOG: Pushing write stream to /users collection...");
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        activeBusinessId: businessId,
        businesses: [businessId],
        createdAt: new Date(),
      });
      console.log("LOG: /users identity reference mapping complete.");

      // 4. Fire router navigation to client environment layout
      console.log("LOG: Executing dashboard route redirect handshake...");
      router.refresh();
      router.push('/dashboard');
    } catch (err: any) {
      console.error("CRITICAL BACKEND OPERATION FAULT:", err);
      
      if (err.code === 'auth/email-already-in-use') {
        setError('This email cluster identifier is already allocated.');
      } else if (err.code === 'permission-denied') {
        setError('Database deployment constraint violation. Your Security Rules rejected the initialization write.');
      } else {
        setError(err.message || 'An error occurred during multi-tenant deployment processing.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative max-w-md w-full mx-auto">
      {/* Structural ambient styling points */}
      <div className="absolute -top-12 -left-12 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-12 -right-12 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative p-8 bg-slate-900/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-800 ring-1 ring-slate-700/20">
        
        {/* Workspace Hub Icon Title Header */}
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl mb-4 text-blue-500 shadow-inner">
            <Terminal className="w-6 h-6 animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Launch AgentStack</h2>
          <p className="text-slate-400 text-sm mt-1">Initialize your multi-tenant AI cluster ecosystem.</p>
        </div>

        {/* Dynamic Process Progress Bar */}
        <div className="mb-8 flex items-center justify-between text-xs font-mono text-slate-500 px-1">
          <div className={`flex items-center gap-1.5 ${currentStep >= 1 ? 'text-blue-400 font-medium' : ''}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center border text-[10px] ${currentStep > 1 ? 'bg-blue-500/20 border-blue-500 text-blue-400' : 'border-slate-700'}`}>1</span>
            Tenant Config
          </div>
          <div className="flex-1 mx-3 h-[1px] bg-slate-800" />
          <div className={`flex items-center gap-1.5 ${currentStep === 2 ? 'text-blue-400 font-medium' : ''}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center border text-[10px] ${currentStep === 2 ? 'border-blue-500 text-blue-400' : 'border-slate-700'}`}>2</span>
            Root Security
          </div>
        </div>

        {/* Global Error Handshake Box */}
        {error && (
          <div className="text-red-400 text-xs mb-5 bg-red-950/30 px-4 py-3 rounded-xl border border-red-900/50 flex items-start gap-2 backdrop-blur-sm animate-fade-in">
            <span className="font-mono text-red-500 font-bold">[ERROR]</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-4">
          
          {/* STEP 1: Tenant Information Configurations */}
          {currentStep === 1 && (
            <div className="space-y-4 transition-all duration-300">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Company / Tenant Name</label>
                <div className="relative group">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500 group-focus-within:text-blue-500 transition-colors"><Building2 className="w-4 h-4" /></span>
                  <input
                    type="text"
                    className={`w-full pl-10 pr-4 py-2.5 bg-slate-950/60 border ${validationErrors.businessName ? 'border-red-500/50 focus:ring-red-500/20' : 'border-slate-800 focus:ring-blue-500/20'} rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-slate-700 focus:ring-2 transition-all`}
                    placeholder="e.g., Acme Corporations"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                  />
                </div>
                {validationErrors.businessName && <p className="text-red-400 font-mono text-[11px] mt-1 pl-1">{validationErrors.businessName}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Industry Segment</label>
                <div className="relative group">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500 group-focus-within:text-blue-500 transition-colors"><Briefcase className="w-4 h-4" /></span>
                  <select
                    className={`w-full pl-10 pr-4 py-2.5 bg-slate-950 border ${validationErrors.industry ? 'border-red-500/50' : 'border-slate-800'} rounded-xl text-sm text-slate-300 focus:outline-none focus:border-slate-700 focus:ring-2 focus:ring-blue-500/20 appearance-none`}
                    value={industry}
                    onChange={(e: ChangeEvent<HTMLSelectElement>) => setIndustry(e.target.value)}
                  >
                    <option value="" disabled hidden>Select business division</option>
                    <option value="artificial-intelligence">AI & Automation Hub</option>
                    <option value="fintech">Fintech & Decentralized Web3</option>
                    <option value="saas">SaaS Providers</option>
                    <option value="e-commerce">E-Commerce Enterprises</option>
                    <option value="healthcare">Healthcare Logistics</option>
                  </select>
                </div>
                {validationErrors.industry && <p className="text-red-400 font-mono text-[11px] mt-1 pl-1">{validationErrors.industry}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Workspace Node Size</label>
                <div className="relative group">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500 group-focus-within:text-blue-500 transition-colors"><Users className="w-4 h-4" /></span>
                  <select
                    className={`w-full pl-10 pr-4 py-2.5 bg-slate-950 border ${validationErrors.companySize ? 'border-red-500/50' : 'border-slate-800'} rounded-xl text-sm text-slate-300 focus:outline-none focus:border-slate-700 focus:ring-2 focus:ring-blue-500/20 appearance-none`}
                    value={companySize}
                    onChange={(e: ChangeEvent<HTMLSelectElement>) => setCompanySize(e.target.value)}
                  >
                    <option value="" disabled hidden>Select corporate cluster capacity</option>
                    <option value="1-10">1 - 10 nodes (Early Node Startup)</option>
                    <option value="11-50">11 - 50 nodes (Mid Scale Workspace)</option>
                    <option value="51-200">51 - 200 nodes (Scaling Architecture)</option>
                    <option value="200+">200+ nodes (Enterprise Backbone)</option>
                  </select>
                </div>
                {validationErrors.companySize && <p className="text-red-400 font-mono text-[11px] mt-1 pl-1">{validationErrors.companySize}</p>}
              </div>

              <button
                type="button"
                onClick={handleNextStep}
                className="w-full mt-4 py-2.5 px-4 bg-slate-950 border border-slate-800 hover:bg-slate-900 hover:border-slate-700 text-white font-medium rounded-xl transition-all flex items-center justify-center gap-2 text-sm shadow-md"
              >
                <span>Continue Configuration</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* STEP 2: Core Admin Authentication Parameters */}
          {currentStep === 2 && (
            <div className="space-y-4 transition-all duration-300">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Root Operator Email</label>
                <div className="relative group">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500 group-focus-within:text-blue-500 transition-colors"><Mail className="w-4 h-4" /></span>
                  <input
                    type="email"
                    className={`w-full pl-10 pr-4 py-2.5 bg-slate-950/60 border ${validationErrors.email ? 'border-red-500/50 focus:ring-red-500/20' : 'border-slate-800 focus:ring-blue-500/20'} rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-slate-700 focus:ring-2 transition-all font-mono`}
                    placeholder="operator@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                {validationErrors.email && <p className="text-red-400 font-mono text-[11px] mt-1 pl-1">{validationErrors.email}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Security Access Keyphrase</label>
                <div className="relative group">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500 group-focus-within:text-blue-500 transition-colors"><Lock className="w-4 h-4" /></span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className={`w-full pl-10 pr-12 py-2.5 bg-slate-950/60 border ${validationErrors.password ? 'border-red-500/50 focus:ring-red-500/20' : 'border-slate-800 focus:ring-blue-500/20'} rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-slate-700 focus:ring-2 transition-all font-mono`}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {validationErrors.password && <p className="text-red-400 font-mono text-[11px] mt-1 pl-1">{validationErrors.password}</p>}

                {/* Password Strength Meter Monitor Container */}
                {password.length > 0 && (
                  <div className="mt-2.5 bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/80 animate-fade-in">
                    <div className="flex justify-between items-center mb-1 text-[10px] font-mono tracking-wider uppercase">
                      <span className="text-slate-500">Keyphrase Integrity:</span>
                      <span className={
                        passwordStrength.score <= 50 ? 'text-orange-400' : 'text-emerald-400'
                      }>{passwordStrength.label}</span>
                    </div>
                    <div className="w-full bg-slate-950 h-1 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                        style={{ width: `${passwordStrength.score}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Action Operations Control Split Footer Panel */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handlePrevStep}
                  disabled={submitting}
                  className="w-1/3 py-2.5 px-3 bg-slate-950 border border-slate-800 hover:bg-slate-900 text-slate-400 rounded-xl transition-all flex items-center justify-center gap-1 text-sm disabled:opacity-50"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 px-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 active:scale-[0.99] text-white font-medium rounded-xl transition-all disabled:opacity-60 text-sm shadow-lg shadow-blue-950/50 flex items-center justify-center gap-2 border border-blue-500/20"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Deploying Instance...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Assemble Stack</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </form>

        {/* Dynamic Workspace Redirection Links */}
        <div className="mt-8 pt-5 border-t border-slate-800/60 text-center text-xs text-slate-500">
          Already running an architecture instance?{' '}
          <span 
            className="text-blue-400 hover:text-blue-300 font-medium cursor-pointer underline underline-offset-4 decoration-blue-500/30" 
            onClick={() => router.push('/login')}
          >
            Access Cluster Gateway
          </span>
        </div>
      </div>
    </div>
  );
}
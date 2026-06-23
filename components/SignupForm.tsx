// components/SignupForm.tsx
"use client";

import { useState, FormEvent } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, collection } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { useRouter } from 'next/navigation';

export default function SignupForm() {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [businessName, setBusinessName] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const router = useRouter();

  const handleSignup = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      // 1. Register User inside Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Initialize the Business Document (Generate random ID)
      const newBusinessRef = doc(collection(db, 'businesses'));
      const businessId = newBusinessRef.id;
      
      await setDoc(newBusinessRef, {
        name: businessName,
        slug: businessName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        createdAt: new Date(),
      });

      // 3. Create User Document mapped to this business
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        activeBusinessId: businessId,
        businesses: [businessId],
        createdAt: new Date(),
      });

      // Success! Redirect straight to the dashboard workspace shell
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'An error occurred during system deployment.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md w-full mx-auto p-8 bg-slate-800 rounded-xl shadow-xl border border-slate-700">
      <h2 className="text-2xl font-bold mb-2 text-white">Launch Your AgentStack Workspace</h2>
      <p className="text-slate-400 text-sm mb-6">Initialize your multi-tenant AI operational engine.</p>
      
      {error && <p className="text-red-400 text-sm mb-4 bg-red-950/50 p-3 rounded border border-red-900">{error}</p>}
      
      <form onSubmit={handleSignup} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300">Company / Business Name</label>
          <input
            type="text"
            required
            className="mt-1 block w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            placeholder="e.g., Acme Corporation"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300">Work Email</label>
          <input
            type="email"
            required
            className="mt-1 block w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300">Password</label>
          <input
            type="password"
            required
            className="mt-1 block w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full mt-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition duration-150 disabled:opacity-50 text-sm shadow-md"
        >
          {submitting ? 'Assembling Cloud Infrastructure...' : 'Deploy Core Workspace'}
        </button>
      </form>
    </div>
  );
}
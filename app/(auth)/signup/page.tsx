// app/(auth)/signup/page.tsx
import SignupForm from '../../../components/SignupForm';

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 px-6">
      <SignupForm />
    </div>
  );
}
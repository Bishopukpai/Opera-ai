// app/(auth)/login/page.tsx
import LoginForm from '../../../components/LoginForm';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 px-6">
      <LoginForm />
    </div>
  );
}
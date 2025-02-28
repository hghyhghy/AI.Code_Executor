import AuthForm from '../../components/Authform';




export default function RegisterPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <AuthForm type="register" />
    </div>
  );
}

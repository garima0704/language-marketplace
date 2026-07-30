import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <>
      <h1 className="text-3xl font-bold">
        Welcome back
      </h1>

      <p className="mt-2 text-gray-500">
        Sign in to continue learning on NiceConvo.
      </p>

      <LoginForm />
    </>
  );
}
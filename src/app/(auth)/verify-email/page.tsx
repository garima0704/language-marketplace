export default function VerifyEmailPage() {
  return (
    <div className="rounded-xl border bg-white p-8 text-center shadow">
      <h1 className="text-3xl font-bold">
        Check your email
      </h1>

      <p className="mt-4 text-gray-600">
        We've sent you a verification email.
      </p>

      <p className="mt-2 text-gray-500">
        Click the link in your inbox to activate your account.
      </p>
    </div>
  );
}
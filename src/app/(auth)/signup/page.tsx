import SignupForm from "@/components/auth/SignupForm";

export default function SignupPage() {
  return (
    <>
      <h1 className="text-3xl font-bold">
        Create your account
      </h1>

      <p className="mt-2 text-gray-500">
        Start learning languages on NiceConvo.
      </p>

      <SignupForm />
    </>
  );
}
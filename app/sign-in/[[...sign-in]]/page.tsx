import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="container grid min-h-[calc(100vh-80px)] place-items-center py-10">
      <SignIn />
    </div>
  );
}

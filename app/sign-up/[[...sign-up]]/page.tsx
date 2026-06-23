import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="container grid min-h-[calc(100vh-80px)] place-items-center py-10">
      <SignUp />
    </div>
  );
}

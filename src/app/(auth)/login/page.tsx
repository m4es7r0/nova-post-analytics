import { LoginForm } from "@/features/auth/ui/login-form";
import { IconPackage } from "@tabler/icons-react";

export default function LoginPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col items-center gap-6">
        <a href="/" className="flex items-center gap-2 font-semibold text-lg">
          <div className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <IconPackage className="size-5" />
          </div>
          Nova Post Analytics
        </a>
        <LoginForm />
      </div>
    </div>
  );
}

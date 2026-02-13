import { SiteHeader } from "@/widgets/site-header";
import { getSession } from "@/shared/lib/auth-guard";
import { ApiKeyForm } from "@/features/settings/ui/api-key-form";

export default async function SettingsPage() {
  const session = await getSession();
  const user = session?.user as {
    id: string;
    name: string;
    email: string;
    novaPostApiKey?: string | null;
  } | undefined;

  return (
    <>
      <SiteHeader title="Налаштування" />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-6 py-4 px-4 md:gap-8 md:py-6 lg:px-6 max-w-3xl">
            {/* User info */}
            <div>
              <h2 className="text-lg font-semibold">Профіль</h2>
              <p className="text-sm text-muted-foreground mt-1">
                {user?.name || "Користувач"} — {user?.email}
              </p>
            </div>

            {/* API Key management */}
            <ApiKeyForm currentKey={user?.novaPostApiKey || null} />

            {/* Info about API key usage */}
            <div className="rounded-lg border bg-muted/30 p-4">
              <h3 className="text-sm font-medium mb-2">Як це працює?</h3>
              <ul className="text-sm text-muted-foreground space-y-1.5">
                <li>
                  • Кожен користувач повинен додати свій власний API ключ Nova Poshta
                </li>
                <li>
                  • Всі запити до API виконуються від вашого імені з вашим ключем
                </li>
                <li>
                  • Без ключа доступ до аналітики неможливий
                </li>
                <li>
                  • Ваш ключ зберігається безпечно і ніколи не передається на клієнт
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

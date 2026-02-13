import { SiteHeader } from "@/widgets/site-header";
import { DivisionsView } from "@/widgets/divisions-view";
import { getDivisions } from "@/entities/division";
import { requireApiKey } from "@/shared/lib/get-api-key";

interface DivisionsPageProps {
  searchParams: Promise<{
    page?: string;
    perPage?: string;
    settlementId?: string;
    settlementName?: string;
  }>;
}

export default async function DivisionsPage({ searchParams }: DivisionsPageProps) {
  const params = await searchParams;
  const page = parseInt(params.page || "1", 10);
  const perPage = parseInt(params.perPage || "50", 10);
  const settlementId = params.settlementId ? parseInt(params.settlementId, 10) : undefined;
  const settlementName = params.settlementName || undefined;

  const apiKey = await requireApiKey();

  // Fetch from API with server-side filters
  const result = await getDivisions({
    page,
    limit: perPage,
    countryCodes: ["UA"],
    ...(settlementId ? { settlementIds: [settlementId] } : {}),
  }, apiKey);

  const divisions = result.success ? result.data.items : [];
  const total = result.success ? result.data.total : 0;
  const lastPage = result.success ? result.data.last_page : 1;

  // Extract unique settlements from current page for the combobox
  const settlementsMap = new Map<number, string>();
  for (const div of divisions) {
    if (div.settlement?.id && div.settlement?.name) {
      settlementsMap.set(div.settlement.id, div.settlement.name);
    }
  }
  const settlements = [...settlementsMap.entries()]
    .map(([id, name]) => ({ id, name }))
    .sort((a, b) => a.name.localeCompare(b.name, "uk"));

  return (
    <>
      <SiteHeader title="Відділення" />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <DivisionsView
              divisions={divisions}
              settlements={settlements}
              total={total}
              page={page}
              lastPage={lastPage}
              perPage={perPage}
              activeSettlementId={settlementId}
              activeSettlementName={settlementName}
            />
          </div>
        </div>
      </div>
    </>
  );
}

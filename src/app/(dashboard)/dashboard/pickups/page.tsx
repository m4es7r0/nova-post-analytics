import { SiteHeader } from "@/widgets/site-header";
import { getPickups } from "@/entities/pickup";
import { PickupsTable } from "@/widgets/pickups-table";
import { requireApiKey } from "@/shared/lib/get-api-key";

export default async function PickupsPage() {
  const apiKey = await requireApiKey();
  const result = await getPickups({ page: 1, limit: 50 }, apiKey);

  const pickups = result.success ? result.data.items : [];
  const total = result.success ? result.data.total : 0;

  return (
    <>
      <SiteHeader title="Виклик кур'єра" />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <div className="flex items-center justify-between px-4 lg:px-6">
              <div>
                <h2 className="text-lg font-semibold">Виклики кур&apos;єра</h2>
                <p className="text-sm text-muted-foreground">
                  {total} {total === 1 ? "виклик" : "викликів"} всього
                </p>
              </div>
            </div>
            <PickupsTable pickups={pickups} />
          </div>
        </div>
      </div>
    </>
  );
}

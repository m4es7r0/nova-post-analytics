import { SiteHeader } from "@/widgets/site-header";
import { TrackingSearch } from "@/features/tracking/ui/tracking-search";

export default function TrackingPage() {
  return (
    <>
      <SiteHeader title="Трекінг" />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <div className="px-4 lg:px-6">
              <h2 className="text-lg font-semibold">Відстеження посилок</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Введіть номери відправлень для перегляду історії трекінгу
              </p>
              <TrackingSearch />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

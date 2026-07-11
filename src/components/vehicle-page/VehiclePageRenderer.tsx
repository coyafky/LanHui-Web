import type { VehiclePageConfig } from "./vehicle-page.schema";
import { VehicleHero } from "./VehicleHero";
import { ProjectGrid } from "./ProjectGrid";
import { ScenarioMatrix } from "./ScenarioMatrix";
import { ServiceFlow } from "./ServiceFlow";
import { FaqSection } from "./FaqSection";
import { BundleList } from "./BundleList";
import { Breadcrumbs } from "@/components/Breadcrumbs";

interface Props {
  config: VehiclePageConfig;
}

export function VehiclePageRenderer({ config }: Props) {
  return (
    <>
      {config.breadcrumbs && config.breadcrumbs.length > 0 && (
        <div className="pt-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <Breadcrumbs
            items={config.breadcrumbs.map((b) => ({
              label: b.label,
              href: b.href ?? "#",
            }))}
          />
        </div>
      )}
      <VehicleHero config={config.hero} theme={config.theme} />
      <ProjectGrid projects={config.projects} theme={config.theme} />
      <ScenarioMatrix scenarios={config.scenarios} theme={config.theme} />
      <ServiceFlow config={config.serviceFlow} theme={config.theme} />
      <FaqSection items={config.faq} theme={config.theme} />
      {config.bundles && config.bundles.length > 0 && (
        <BundleList bundles={config.bundles} theme={config.theme} />
      )}
    </>
  );
}

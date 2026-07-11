import { z } from "zod";

export const ThemeSchema = z.enum(["orange", "cyan", "amber", "blue", "green", "red", "neutral"]);
export type VehicleTheme = z.infer<typeof ThemeSchema>;

export const HeroImageSchema = z.object({
  src: z.string(),
  alt: z.string(),
  width: z.number().optional(),
  height: z.number().optional(),
});
export type HeroImage = z.infer<typeof HeroImageSchema>;

export const BreadcrumbItemSchema = z.object({
  label: z.string(),
  href: z.string().optional(),
});
export type BreadcrumbItemConfig = z.infer<typeof BreadcrumbItemSchema>;

export const HeroStatsSchema = z.object({
  totalProjects: z.number(),
  totalScenarios: z.number().optional(),
  totalModels: z.number().optional(),
});
export type HeroStats = z.infer<typeof HeroStatsSchema>;

export const HeroConfigSchema = z.object({
  badge: z.string(),
  title: z.string(),
  subtitle: z.string(),
  description: z.string(),
  heroImage: HeroImageSchema.optional(),
  stats: HeroStatsSchema.optional(),
});
export type HeroConfig = z.infer<typeof HeroConfigSchema>;

export const ProjectConfigSchema = z.object({
  id: z.string(),
  name: z.string(),
  summary: z.string(),
  suitableFor: z.array(z.string()),
  caution: z.string().optional(),
  category: z.string(),
  imageStatus: z.enum(["matched", "product-preview", "pending-review", "missing"]).optional(),
  imagePublicPath: z.string().nullable().optional(),
  imageAlt: z.string().optional(),
  imageWidth: z.number().nullable().optional(),
  imageHeight: z.number().nullable().optional(),
});
export type ProjectConfig = z.infer<typeof ProjectConfigSchema>;

export const ScenarioConfigSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  projectIds: z.array(z.string()),
});
export type ScenarioConfig = z.infer<typeof ScenarioConfigSchema>;

export const ServiceFlowStepSchema = z.object({
  order: z.number(),
  title: z.string(),
  description: z.string(),
  icon: z.string().optional(),
});
export type ServiceFlowStep = z.infer<typeof ServiceFlowStepSchema>;

export const ServiceFlowConfigSchema = z.object({
  title: z.string().optional(),
  steps: z.array(ServiceFlowStepSchema),
});
export type ServiceFlowConfig = z.infer<typeof ServiceFlowConfigSchema>;

export const FaqItemSchema = z.object({
  question: z.string(),
  answer: z.string(),
});
export type FaqItem = z.infer<typeof FaqItemSchema>;

export const BundleConfigSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  items: z.array(z.string()).optional(),
});
export type BundleConfig = z.infer<typeof BundleConfigSchema>;

export const VehiclePageConfigSchema = z.object({
  theme: ThemeSchema,
  breadcrumbs: z.array(BreadcrumbItemSchema).optional(),
  hero: HeroConfigSchema,
  projects: z.array(ProjectConfigSchema),
  scenarios: z.array(ScenarioConfigSchema),
  serviceFlow: ServiceFlowConfigSchema,
  faq: z.array(FaqItemSchema),
  bundles: z.array(BundleConfigSchema).optional(),
});
export type VehiclePageConfig = z.infer<typeof VehiclePageConfigSchema>;

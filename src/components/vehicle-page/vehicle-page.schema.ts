import { z } from "zod";

// ── Theme ──

export const ThemeSchema = z.enum(["orange", "cyan", "amber", "blue", "green", "red", "neutral"]);
export type VehicleTheme = z.infer<typeof ThemeSchema>;

// ── Hero ──

export const HeroConfigSchema = z.object({
  badge: z.string(),
  title: z.string(),
  subtitle: z.string(),
  description: z.string(),
  bgImage: z.string().optional(),
});
export type HeroConfig = z.infer<typeof HeroConfigSchema>;

// ── Project ──

export const ProjectConfigSchema = z.object({
  id: z.string(),
  name: z.string(),
  summary: z.string(),
  suitableFor: z.array(z.string()),
  caution: z.string().optional(),
  category: z.string(),
});
export type ProjectConfig = z.infer<typeof ProjectConfigSchema>;

// ── Scenario ──

export const ScenarioConfigSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  projectIds: z.array(z.string()),
});
export type ScenarioConfig = z.infer<typeof ScenarioConfigSchema>;

// ── Service Flow Step ──

export const ServiceFlowStepSchema = z.object({
  order: z.number(),
  title: z.string(),
  description: z.string(),
  icon: z.string().optional(),
});
export type ServiceFlowStep = z.infer<typeof ServiceFlowStepSchema>;

// ── Service Flow ──

export const ServiceFlowConfigSchema = z.object({
  title: z.string().optional(),
  steps: z.array(ServiceFlowStepSchema),
});
export type ServiceFlowConfig = z.infer<typeof ServiceFlowConfigSchema>;

// ── FAQ ──

export const FaqItemSchema = z.object({
  question: z.string(),
  answer: z.string(),
});
export type FaqItem = z.infer<typeof FaqItemSchema>;

// ── Bundle ──

export const BundleConfigSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  items: z.array(z.string()).optional(),
});
export type BundleConfig = z.infer<typeof BundleConfigSchema>;

// ── Vehicle Page Config ──

export const VehiclePageConfigSchema = z.object({
  theme: ThemeSchema,
  hero: HeroConfigSchema,
  projects: z.array(ProjectConfigSchema),
  scenarios: z.array(ScenarioConfigSchema),
  serviceFlow: ServiceFlowConfigSchema,
  faq: z.array(FaqItemSchema),
  bundles: z.array(BundleConfigSchema).optional(),
});
export type VehiclePageConfig = z.infer<typeof VehiclePageConfigSchema>;

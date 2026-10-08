export type PackageId = "essential" | "growth" | "advanced" | "elite";

export interface CatalogPackage {
  id: PackageId;
  name: string;
  description: string;
  price: number;
  period: string;
  flag?: string;
  highlight?: "elite";
}

export const PACKAGES: CatalogPackage[] = [
  {
    id: "essential",
    name: "Essential",
    description: "3 sessions, 1 assessment, 1 month — build the foundation",
    price: 999,
    period: "1 month",
  },
  {
    id: "growth",
    name: "Growth",
    description: "5 sessions, 2 assessments — for daily pressure & performance",
    price: 2499,
    period: "program",
  },
  {
    id: "advanced",
    name: "Advanced",
    description: "10 sessions, full year — for those carrying real weight",
    price: 7499,
    period: "1 year",
  },
  {
    id: "elite",
    name: "Elite Club",
    description: "Unlimited priority access & concierge, all year",
    price: 24999,
    period: "/ year",
    flag: "By invitation",
    highlight: "elite",
  },
];

export function findPackage(id: string | null | undefined): CatalogPackage | null {
  return PACKAGES.find((item) => item.id === id) ?? null;
}

export function recommendedPackageId(overallPercent: number): PackageId {
  if (overallPercent >= 80) return "essential";
  if (overallPercent >= 40) return "growth";
  return "advanced";
}

export function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

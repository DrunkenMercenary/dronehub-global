// Single source of truth for service / job categories.
// IDs are the canonical, lowercase values stored in the database
// (OperatorProfile.services as a comma list, JobRequest.category as a single id).
export const CATEGORIES = [
    { id: "photography", label: "Aerial Photography" },
    { id: "videography", label: "Cinematic Videography" },
    { id: "inspection", label: "Industrial Inspection" },
    { id: "surveying", label: "Mapping & Surveying" },
    { id: "search_rescue", label: "Search & Rescue" },
    { id: "agriculture", label: "Agriculture" },
] as const

export type CategoryId = (typeof CATEGORIES)[number]["id"]

export const CATEGORY_IDS = CATEGORIES.map((c) => c.id)

export function labelForCategory(id: string): string {
    return CATEGORIES.find((c) => c.id === id)?.label ?? id
}

// Normalise any stored/legacy value to a comparable token.
export function normaliseCategory(value: string): string {
    return value.trim().toLowerCase().replace(/\s+/g, "_")
}

export function parseServices(services: string): string[] {
    return services
        .split(",")
        .map((s) => normaliseCategory(s))
        .filter(Boolean)
}

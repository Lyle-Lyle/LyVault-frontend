export type CommunityLocation = {
  city: string;
  community: string;
  postalPrefix: string;
};

const POSTAL_COMMUNITIES: CommunityLocation[] = [
  {
    postalPrefix: "L4E",
    city: "Richmond Hill",
    community: "Jefferson",
  },
  {
    postalPrefix: "L4C",
    city: "Richmond Hill",
    community: "Mill Pond",
  },
  {
    postalPrefix: "L4S",
    city: "Richmond Hill",
    community: "Rouge Woods",
  },
  {
    postalPrefix: "L4B",
    city: "Richmond Hill",
    community: "Doncrest",
  },
  {
    postalPrefix: "L3R",
    city: "Markham",
    community: "Unionville",
  },
  {
    postalPrefix: "L6A",
    city: "Vaughan",
    community: "Maple",
  },
];

export function getCommunityLocationByPostalCode(postalCode?: string | null): CommunityLocation | null {
  if (!postalCode) {
    return null;
  }

  const normalized = postalCode.replace(/\s+/g, "").toUpperCase();
  return POSTAL_COMMUNITIES.find((item) => normalized.startsWith(item.postalPrefix)) ?? null;
}

"use client";

import dynamic from "next/dynamic";

export const LocationSection = dynamic(
  () => import("@/components/LocationSection").then((m) => ({ default: m.LocationSection })),
  { ssr: false }
);

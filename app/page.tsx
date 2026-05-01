"use client";

import dynamic from "next/dynamic";

const ScrollNarrative = dynamic(
  () => import("./components/ScrollNarrative"),
  { ssr: false }
);

export default function Home() {
  return <ScrollNarrative />;
}

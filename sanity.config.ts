import { defineConfig } from "sanity";
import { schemaTypes } from "./sanity/schemas";

export function createSanityConfig() {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  if (!projectId) throw new Error("NEXT_PUBLIC_SANITY_PROJECT_ID is required to open Sanity Studio.");

  return defineConfig({
    name: "spursbase-foundation",
    title: "Spursbase Foundation",
    projectId,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production",
    schema: { types: schemaTypes },
  });
}
// Wrapper tipado del diccionario maestro (datos en countries.mjs, única fuente
// de verdad compartida con scripts/translate-ics.mjs).
// @ts-ignore - módulo JS sin tipos propios
import { selecciones as _selecciones, gentilicios as _gentilicios, confederaciones as _confederaciones } from "./countries.mjs";

export type Lang = "es" | "en" | "pt";

export interface LocalizedName {
  name: string;
  slug: string;
}

export type Localized = Record<Lang, LocalizedName>;

export const selecciones: Record<string, Localized> = _selecciones;
export const gentilicios: Record<string, Localized> = _gentilicios;
export const confederaciones: Record<string, Record<Lang, string>> = _confederaciones;

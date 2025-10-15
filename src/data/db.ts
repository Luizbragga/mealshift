import Dexie, { Table } from "dexie";

/* =========
   Types
   ========= */
export type Sex = "M" | "F" | "Other";
export type Goal = "Lose" | "Maintain" | "Gain";
export type Activity = "Sedentary" | "Light" | "Moderate" | "Intense";
export type Meal = "Breakfast" | "Lunch" | "Snack" | "Dinner";
export type EntryOrigin = "catalog" | "text";

export interface User {
  id?: number;
  sex: Sex;
  age: number;
  heightCm: number;
  weightKg: number;
  goal: Goal;
  activity: Activity;
  kcalTarget: number;
}

export interface Plan {
  id?: number;
  dayIso: string; // YYYY-MM-DD
  breakfastKcal: number;
  lunchKcal: number;
  snackKcal: number;
  dinnerKcal: number;
}

export interface Entry {
  id?: number;
  dayIso: string;
  meal: Meal;
  name: string;
  kcal: number;
  origin: EntryOrigin;
  qty?: number;
}

export interface Food {
  id?: number;
  name: string;
  basePortion: string;
  kcalPerPortion: number;
  tags?: string[];
}

export interface Settings {
  id?: number;
  breakfastTime?: string; // "08:00"
  lunchTime?: string; // "12:30"
  snackTime?: string; // "16:00"
  dinnerTime?: string; // "19:30"
  proActive: boolean;
  adjustmentsToday: number;
  consentNotifications: boolean;
  lastResetDate?: string; // YYYY-MM-DD
}

/* =========
   DB
   ========= */
export class ReajustaDB extends Dexie {
  users!: Table<User>;
  plans!: Table<Plan>;
  entries!: Table<Entry>;
  foods!: Table<Food>;
  settings!: Table<Settings>;

  constructor() {
    super("ReajustaDB");

    // v1 (legacy - PT fields) kept only to support migration
    this.version(1).stores({
      users: "++id",
      plans: "++id, dayIso",
      entries: "++id, dayIso, meal",
      foods: "++id, name",
      settings: "++id",
    });

    // v2 (EN fields + new indexes)
    this.version(2)
      .stores({
        users: "++id",
        plans: "++id, dayIso",
        entries: "++id, dayIso, meal",
        foods: "++id, name",
        settings: "++id",
      })
      .upgrade(async (tx) => {
        // Plans: dayIso -> dayIso, *_kcal -> English keys
        await tx
          .table("plans")
          .toCollection()
          .modify((p: any) => {
            if (p.dayIso && !p.dayIso) p.dayIso = p.dayIso;
            if (typeof p.breakfastKcal === "number" && p.breakfastKcal == null)
              p.breakfastKcal = p.breakfastKcal;
            if (typeof p.lunchKcal === "number" && p.lunchKcal == null)
              p.lunchKcal = p.lunchKcal;
            if (typeof p.snackKcal === "number" && p.snackKcal == null)
              p.snackKcal = p.snackKcal;
            if (typeof p.dinnerKcal === "number" && p.dinnerKcal == null)
              p.dinnerKcal = p.dinnerKcal;

            delete p.dayIso;
            delete p.breakfastKcal;
            delete p.lunchKcal;
            delete p.snackKcal;
            delete p.dinnerKcal;
          });

        // Entries: dayIso -> dayIso, meal -> meal, name->name, origem->origin
        await tx
          .table("entries")
          .toCollection()
          .modify((e: any) => {
            if (e.dayIso && !e.dayIso) e.dayIso = e.dayIso;
            if (e.meal && !e.meal) {
              const map: Record<string, Meal> = {
                Breakfast: "Breakfast",
                Lunch: "Lunch",
                Snack: "Snack",
                Dinner: "Dinner",
              };
              e.meal = map[e.meal] ?? e.meal;
            }
            if (e.name && !e.name) e.name = e.name;
            if (e.origem && !e.origin) {
              e.origin = e.origem === "Catalog" ? "catalog" : e.origem;
            }
            delete e.dayIso;
            delete e.meal;
            delete e.name;
            delete e.origem;
          });

        // Foods: name -> name, basePortion -> basePortion, kcalPerPortion -> kcalPerPortion
        await tx
          .table("foods")
          .toCollection()
          .modify((f: any) => {
            if (f.name && !f.name) f.name = f.name;
            if (f.basePortion && !f.basePortion) f.basePortion = f.basePortion;
            if (
              typeof f.kcalPerPortion === "number" &&
              f.kcalPerPortion == null
            )
              f.kcalPerPortion = f.kcalPerPortion;

            delete f.name;
            delete f.basePortion;
            delete f.kcalPerPortion;
          });

        // Users: sex->sex, idade->age, altura_cm->heightCm, peso_kg->weightKg, objetivo->goal, atividade->activity, kcalTarget->kcalTarget
        await tx
          .table("users")
          .toCollection()
          .modify((u: any) => {
            if (u.sex && !u.sex) u.sex = u.sex === "Other" ? "Other" : u.sex;
            if (typeof u.idade === "number" && u.age == null) u.age = u.idade;
            if (typeof u.altura_cm === "number" && u.heightCm == null)
              u.heightCm = u.altura_cm;
            if (typeof u.peso_kg === "number" && u.weightKg == null)
              u.weightKg = u.peso_kg;

            if (u.objetivo && !u.goal) {
              const map: Record<string, Goal> = {
                Perder: "Lose",
                Manter: "Maintain",
                Ganhar: "Gain",
              };
              u.goal = map[u.objetivo] ?? u.objetivo;
            }
            if (u.atividade && !u.activity) {
              const map: Record<string, Activity> = {
                Sedentário: "Sedentary",
                Leve: "Light",
                Moderado: "Moderate",
                Intenso: "Intense",
              };
              u.activity = map[u.atividade] ?? u.atividade;
            }
            if (typeof u.kcalTarget === "number" && u.kcalTarget == null)
              u.kcalTarget = u.kcalTarget;

            delete u.sex;
            delete u.idade;
            delete u.altura_cm;
            delete u.peso_kg;
            delete u.objetivo;
            delete u.atividade;
            delete u.kcalTarget;
          });

        // Settings: *_hora -> *Time, pro_ativo -> proActive, adjustmentsToday -> adjustmentsToday, consentNotifications -> consentNotifications, last_reset_date -> lastResetDate
        await tx
          .table("settings")
          .toCollection()
          .modify((s: any) => {
            if (s.breakfastTime && !s.breakfastTime)
              s.breakfastTime = s.breakfastTime;
            if (s.lunchTime && !s.lunchTime) s.lunchTime = s.lunchTime;
            if (s.snackTime && !s.snackTime) s.snackTime = s.snackTime;
            if (s.dinnerTime && !s.dinnerTime) s.dinnerTime = s.dinnerTime;

            if (typeof s.pro_ativo === "boolean" && s.proActive == null)
              s.proActive = s.pro_ativo;
            if (
              typeof s.adjustmentsToday === "number" &&
              s.adjustmentsToday == null
            )
              s.adjustmentsToday = s.adjustmentsToday;
            if (
              typeof s.consentNotifications === "boolean" &&
              s.consentNotifications == null
            )
              s.consentNotifications = s.consentNotifications;
            if (s.last_reset_date && !s.lastResetDate)
              s.lastResetDate = s.last_reset_date;

            delete s.breakfastTime;
            delete s.lunchTime;
            delete s.snackTime;
            delete s.dinnerTime;
            delete s.pro_ativo;
            delete s.adjustmentsToday;
            delete s.consentNotifications;
            delete s.last_reset_date;
          });
      });

    // Table bindings
    this.users = this.table("users");
    this.plans = this.table("plans");
    this.entries = this.table("entries");
    this.foods = this.table("foods");
    this.settings = this.table("settings");
  }
}

export const db = new ReajustaDB();

/* =========
   Seeds & Init
   ========= */

// Prefer dynamic import when possible (bundlers handle /tree-shaking). Fallback to fetch.
export async function seedFoods(source?: Food[]) {
  const count = await db.foods.count();
  if (count > 0) return;

  try {
    const foods: Food[] =
      source ??
      // Try app alias first
      (await import("@/data/foods.json")
        .then((m) => (m as any).default)
        .catch(() => null)) ??
      // Fallback path if running as plain Vite/CRA with public asset
      (await fetch("/data/foods.json").then((r) => r.json()));

    if (Array.isArray(foods) && foods.length) {
      await db.foods.bulkAdd(foods);
    }
  } catch (e) {
    console.error("[seedFoods] failed to load foods.json", e);
  }
}

export async function initSettings(defaults?: Partial<Settings>) {
  const count = await db.settings.count();
  if (count > 0) return;

  const today = isoToday();
  await db.settings.add({
    breakfastTime: "08:00",
    lunchTime: "12:30",
    snackTime: "16:00",
    dinnerTime: "19:30",
    proActive: false,
    adjustmentsToday: 0,
    consentNotifications: false,
    lastResetDate: today,
    ...(defaults ?? {}),
  });
}

/* =========
   Helpers
   ========= */

export function isoToday(): string {
  return new Date().toISOString().split("T")[0];
}

export async function checkAndResetDailyCounter() {
  const s = await db.settings.toCollection().first();
  if (!s) return;

  const today = isoToday();
  if (s.lastResetDate !== today) {
    await db.settings.update(s.id!, {
      adjustmentsToday: 0,
      lastResetDate: today,
    });
  }
}

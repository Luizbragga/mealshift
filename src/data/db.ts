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
  breakfastTime?: string;
  lunchTime?: string;
  snackTime?: string;
  dinnerTime?: string;
  proActive: boolean;
  adjustmentsToday: number;
  consentNotifications: boolean;
  lastResetDate?: string;
}

/* =========
   DB
   ========= */
export class AppDB extends Dexie {
  users!: Table<User>;
  plans!: Table<Plan>;
  entries!: Table<Entry>;
  foods!: Table<Food>;
  settings!: Table<Settings>;

  constructor() {
    super("AppDB");

    // MVP: schema estável, tudo em EN
    this.version(1).stores({
      users: "++id",
      plans: "++id, dayIso",
      entries: "++id, dayIso, meal",
      foods: "++id, name",
      settings: "++id",
    });

    this.users = this.table("users");
    this.plans = this.table("plans");
    this.entries = this.table("entries");
    this.foods = this.table("foods");
    this.settings = this.table("settings");
  }
}

export const db = new AppDB();

/* =========
   Seeds & Init
   ========= */
export async function seedFoods(source?: Food[]) {
  const count = await db.foods.count();
  if (count > 0) return;

  try {
    const foods: Food[] =
      source ??
      (await import("@/data/foods.json")
        .then((m) => (m as any).default)
        .catch(() => null)) ??
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

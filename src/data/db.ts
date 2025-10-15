// src/data/db.ts
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
   DB (MealShift)
   ========= */
export class MealShiftDB extends Dexie {
  users!: Table<User>;
  plans!: Table<Plan>;
  entries!: Table<Entry>;
  foods!: Table<Food>;
  settings!: Table<Settings>;

  constructor() {
    super("MealShiftDB");

    this.version(1).stores({
      users: "++id",
      plans: "++id, dayIso",
      entries: "++id, dayIso, meal",
      foods: "++id, name",
      settings: "++id",
    });

    // versões futuras: this.version(2)...
    this.users = this.table("users");
    this.plans = this.table("plans");
    this.entries = this.table("entries");
    this.foods = this.table("foods");
    this.settings = this.table("settings");
  }
}

export const db = new MealShiftDB();

/* =========
   Migração: ReajustaDB -> MealShiftDB (one-shot)
   ========= */
export async function migrateFromReajustaIfNeeded() {
  const OLD_NAME = "ReajustaDB";

  // Se o banco novo já tem dados, não migrar.
  const hasAny =
    (await db.users.count()) +
      (await db.plans.count()) +
      (await db.entries.count()) +
      (await db.foods.count()) +
      (await db.settings.count()) >
    0;
  if (hasAny) return;

  // Verifica existência do DB antigo
  const oldExists = await Dexie.exists(OLD_NAME);
  if (!oldExists) return;

  // Abre o banco antigo com o mínimo de schema necessário
  const old = new Dexie(OLD_NAME);
  old.version(1).stores({
    users: "++id",
    plans: "++id, dayIso",
    entries: "++id, dayIso, meal",
    foods: "++id, name",
    settings: "++id",
  });

  await old.open();

  const [users, plans, entries, foods, settings] = await Promise.all([
    (old.table("users") as Table<any>).toArray(),
    (old.table("plans") as Table<any>).toArray(),
    (old.table("entries") as Table<any>).toArray(),
    (old.table("foods") as Table<any>).toArray(),
    (old.table("settings") as Table<any>).toArray(),
  ]);

  // Normalização básica: converter campos PT se ainda existirem
  const mapUser = (u: any): User => ({
    sex: u.sex ?? u.sexo ?? "M",
    age: u.age ?? u.idade,
    heightCm: u.heightCm ?? u.altura_cm,
    weightKg: u.weightKg ?? u.peso_kg,
    goal:
      u.goal ??
      ({ Perder: "Lose", Manter: "Maintain", Ganhar: "Gain" }[
        u.objetivo
      ] as Goal) ??
      "Maintain",
    activity:
      u.activity ??
      ({
        Sedentário: "Sedentary",
        Leve: "Light",
        Moderado: "Moderate",
        Intenso: "Intense",
      }[u.atividade] as Activity) ??
      "Light",
    kcalTarget: u.kcalTarget ?? u.kcalTarget ?? 0,
  });

  const mapPlan = (p: any): Plan => ({
    dayIso: p.dayIso ?? p.dia_iso ?? p.dia ?? p.day,
    breakfastKcal: p.breakfastKcal ?? p.cafe_kcal ?? p.cafe ?? 0,
    lunchKcal: p.lunchKcal ?? p.almoco_kcal ?? p.almoco ?? 0,
    snackKcal: p.snackKcal ?? p.lanche_kcal ?? p.lanche ?? 0,
    dinnerKcal: p.dinnerKcal ?? p.jantar_kcal ?? p.jantar ?? 0,
  });

  const mapEntry = (e: any): Entry => ({
    dayIso: e.dayIso ?? e.dia_iso ?? e.dia,
    meal:
      e.meal ??
      {
        Café: "Breakfast",
        Breakfast: "Breakfast",
        Almoço: "Lunch",
        Lunch: "Lunch",
        Lanche: "Snack",
        Snack: "Snack",
        Jantar: "Dinner",
        Dinner: "Dinner",
      }[e.meal || e.refeicao] ??
      "Breakfast",
    name: e.name ?? e.nome ?? "",
    kcal: e.kcal ?? e.calorias ?? 0,
    origin:
      e.origin ?? (e.origem === "Catalog" ? "catalog" : e.origem) ?? "text",
    qty: e.qty ?? e.quantidade,
  });

  const mapFood = (f: any): Food => ({
    name: f.name ?? f.nome ?? "",
    basePortion: f.basePortion ?? f.porcao_base ?? "1 unit",
    kcalPerPortion: f.kcalPerPortion ?? f.kcal_por_porcao ?? 0,
    tags: f.tags ?? [],
  });

  const mapSettings = (s: any): Settings => ({
    breakfastTime: s.breakfastTime ?? s.cafe_hora,
    lunchTime: s.lunchTime ?? s.almoco_hora,
    snackTime: s.snackTime ?? s.lanche_hora,
    dinnerTime: s.dinnerTime ?? s.jantar_hora,
    proActive: s.proActive ?? s.pro_ativo ?? false,
    adjustmentsToday: s.adjustmentsToday ?? 0,
    consentNotifications: s.consentNotifications ?? false,
    lastResetDate: s.lastResetDate ?? s.last_reset_date,
  });

  if (users.length) await db.users.bulkAdd(users.map(mapUser));
  if (plans.length) await db.plans.bulkAdd(plans.map(mapPlan));
  if (entries.length) await db.entries.bulkAdd(entries.map(mapEntry));
  if (foods.length) await db.foods.bulkAdd(foods.map(mapFood));
  if (settings.length) await db.settings.bulkAdd(settings.map(mapSettings));

  await old.close();
}

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

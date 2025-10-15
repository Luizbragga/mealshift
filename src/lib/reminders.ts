import { Capacitor } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";

export async function requestNotificationPermission(): Promise<boolean> {
  if (Capacitor.isNativePlatform()) {
    const permission = await LocalNotifications.requestPermissions();
    return permission.display === "granted";
  }
  if ("Notification" in window) {
    const permission = await Notification.requestPermission();
    return permission === "granted";
  }
  return false;
}

export async function checkNotificationPermission(): Promise<boolean> {
  if (Capacitor.isNativePlatform()) {
    const permission = await LocalNotifications.checkPermissions();
    return permission.display === "granted";
  }
  if ("Notification" in window) return Notification.permission === "granted";
  return false;
}

interface ReminderSchedule {
  breakfastTime?: string; // Breakfast
  lunchTime?: string; // Lunch
  snackTime?: string; // Snack
  dinnerTime?: string; // Dinner
}

export async function scheduleReminders(
  schedule: ReminderSchedule
): Promise<void> {
  const hasPermission = await checkNotificationPermission();
  if (!hasPermission) return;

  const meals = [
    { name: "Breakfast", hora: schedule.breakfastTime, id: 1 },
    { name: "Lunch", hora: schedule.lunchTime, id: 2 },
    { name: "Snack", hora: schedule.snackTime, id: 3 },
    { name: "Dinner", hora: schedule.dinnerTime, id: 4 },
  ];

  if (Capacitor.isNativePlatform()) {
    await LocalNotifications.cancel({
      notifications: meals.map((m) => ({ id: m.id })),
    });

    const notifications = meals
      .filter((m) => m.hora)
      .map((meal) => {
        const [hours, minutes] = meal.hora!.split(":").map(Number);
        const now = new Date();
        const at = new Date();
        at.setHours(hours, minutes, 0, 0);
        if (at < now) at.setDate(at.getDate() + 1);

        return {
          id: meal.id,
          title: `${meal.name} time`,
          body: `Don't forget to log your ${meal.name.toLowerCase()}.`,
          schedule: { at, repeats: true, every: "day" as const },
        };
      });

    if (notifications.length) {
      await LocalNotifications.schedule({ notifications });
    }
  } else {
    // Web: recurring scheduling needs a Service Worker/alarms approach.
    console.info(
      "Web notifications: recurring scheduling not supported without SW."
    );
  }
}

export async function cancelAllReminders(): Promise<void> {
  if (Capacitor.isNativePlatform()) {
    await LocalNotifications.cancel({
      notifications: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }],
    });
  }
}

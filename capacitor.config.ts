import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "app.mealshift",
  appName: "MealShift",
  webDir: "dist",
  // Em produção, normalmente removemos "server".
  // Mantém só em dev para live reload via Vite.
  server:
    process.env.NODE_ENV === "development"
      ? {
          url: "http://localhost:5174",
          cleartext: true,
        }
      : undefined,
  plugins: {
    LocalNotifications: {
      smallIcon: "ic_stat_icon",
      iconColor: "#2ECC71",
    },
  },
};

export default config;

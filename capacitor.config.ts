import { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "app.lovable.643fa8df585c4cf7af576234160720c9",
  appName: "Reajusta",
  webDir: "dist",
  server: {
    url: "https://643fa8df-585c-4cf7-af57-6234160720c9.lovableproject.com?forceHideBadge=true",
    cleartext: true,
  },
  plugins: {
    LocalNotifications: {
      smallIcon: "ic_stat_icon_config_sample",
      iconColor: "#2ECC71",
    },
  },
};

export default config;

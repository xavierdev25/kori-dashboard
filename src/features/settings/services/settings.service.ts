import { apiRequest } from "@/shared/lib/api-client";
import type { AppSettings } from "@/features/settings/types/settings.types";

export const settingsService = {
  getSettings() {
    return apiRequest<AppSettings>("/admin/settings");
  },

  updateSettings(settings: { albumUrl?: string; countdownTarget?: string }) {
    return apiRequest<AppSettings>("/admin/settings", {
      body: settings,
      method: "PATCH",
    });
  },
};

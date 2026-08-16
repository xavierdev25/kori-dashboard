import { apiRequest } from "@/shared/lib/api-client";
import type { AppSettings } from "@/features/settings/types/settings.types";

export const settingsService = {
  getSettings(signal?: AbortSignal) {
    return apiRequest<AppSettings>("/admin/settings", { signal });
  },

  updateSettings(settings: { albumUrl?: string; countdownTarget?: string }) {
    return apiRequest<AppSettings>("/admin/settings", {
      body: settings,
      method: "PATCH",
    });
  },
};

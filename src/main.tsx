import { createRoot } from "react-dom/client";
import { ThemeProvider } from "@/components/ThemeProvider";
import { HelmetProvider } from "react-helmet-async";
import "./index.css";
import { getSupabaseEnvStatus } from "@/lib/supabaseEnv";
import { SupabaseEnvErrorScreen } from "@/components/SupabaseEnvErrorScreen";

const envStatus = getSupabaseEnvStatus();

// Register Service Worker for PWA updates and offline shell.
if ("serviceWorker" in navigator) {
  const notifyUpdateReady = (registration: ServiceWorkerRegistration) => {
    window.dispatchEvent(
      new CustomEvent("microdao:pwa-update-ready", {
        detail: { registration },
      }),
    );
  };

  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        if (import.meta.env.DEV) {
          console.info("Service Worker registered:", registration.scope);
        }

        if (registration.waiting) {
          notifyUpdateReady(registration);
        }

        registration.addEventListener("updatefound", () => {
          const installingWorker = registration.installing;
          if (!installingWorker) return;

          installingWorker.addEventListener("statechange", () => {
            if (installingWorker.state === "installed" && navigator.serviceWorker.controller) {
              notifyUpdateReady(registration);
            }
          });
        });
      })
      .catch((error) => {
        if (import.meta.env.DEV) {
          console.warn("Service Worker registration failed:", error);
        }
      });
  });
}

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </HelmetProvider>
);

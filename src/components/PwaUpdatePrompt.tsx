import { useEffect, useState } from "react";
import { RefreshCw, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Language, useTranslation } from "@/lib/i18n";

const pwaUpdateCopy: Record<
  Language,
  { title: string; description: string; reload: string; dismiss: string }
> = {
  uk: {
    title: "Доступне оновлення",
    description: "Перезавантажте застосунок, щоб відкрити найновішу версію MicroDAO.",
    reload: "Оновити",
    dismiss: "Пізніше",
  },
  en: {
    title: "Update available",
    description: "Reload the app to open the latest MicroDAO version.",
    reload: "Reload",
    dismiss: "Later",
  },
  ru: {
    title: "Доступно обновление",
    description: "Перезагрузите приложение, чтобы открыть последнюю версию MicroDAO.",
    reload: "Обновить",
    dismiss: "Позже",
  },
  es: {
    title: "Actualización disponible",
    description: "Recarga la app para abrir la última versión de MicroDAO.",
    reload: "Recargar",
    dismiss: "Luego",
  },
};

type ServiceWorkerUpdateEvent = CustomEvent<{
  registration?: ServiceWorkerRegistration;
}>;

export function PwaUpdatePrompt() {
  const { language } = useTranslation();
  const copy = pwaUpdateCopy[language] ?? pwaUpdateCopy.en;
  const [visible, setVisible] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    const handleUpdateReady = (event: Event) => {
      const updateEvent = event as ServiceWorkerUpdateEvent;
      setRegistration(updateEvent.detail?.registration ?? null);
      setVisible(true);
    };

    window.addEventListener("microdao:pwa-update-ready", handleUpdateReady);
    return () => window.removeEventListener("microdao:pwa-update-ready", handleUpdateReady);
  }, []);

  if (!visible) return null;

  const reload = () => {
    const waitingWorker = registration?.waiting;

    if (!waitingWorker || !navigator.serviceWorker.controller) {
      window.location.reload();
      return;
    }

    let hasReloaded = false;
    const reloadOnce = () => {
      if (hasReloaded) return;
      hasReloaded = true;
      window.location.reload();
    };

    navigator.serviceWorker.addEventListener("controllerchange", reloadOnce, { once: true });
    waitingWorker.postMessage({ type: "SKIP_WAITING" });
    window.setTimeout(reloadOnce, 3000);
  };

  return (
    <div className="fixed inset-x-3 bottom-[calc(5rem+env(safe-area-inset-bottom))] z-[70] rounded-xl border border-primary/20 bg-background/95 p-4 shadow-2xl backdrop-blur sm:bottom-4 sm:left-auto sm:right-4 sm:max-w-md">
      <div className="flex items-start gap-3">
        <RefreshCw className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
        <div className="min-w-0 flex-1 space-y-1">
          <p className="text-base font-semibold text-foreground">{copy.title}</p>
          <p className="text-xs leading-relaxed text-muted-foreground">{copy.description}</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setVisible(false)}
          aria-label={copy.dismiss}
          className="h-8 w-8 shrink-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="mt-4 flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={() => setVisible(false)} className="h-10 px-4">
          {copy.dismiss}
        </Button>
        <Button size="sm" onClick={reload} className="h-10 gap-1.5 px-4">
          {copy.reload}
        </Button>
      </div>
    </div>
  );
}

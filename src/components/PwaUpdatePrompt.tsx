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
    registration?.waiting?.postMessage({ type: "SKIP_WAITING" });
    window.location.reload();
  };

  return (
    <div className="fixed inset-x-3 bottom-20 z-[70] rounded-lg border border-primary/30 bg-background/95 p-3 shadow-xl backdrop-blur sm:left-auto sm:right-4 sm:max-w-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <p className="text-sm font-semibold text-foreground">{copy.title}</p>
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

      <div className="mt-3 flex justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={() => setVisible(false)} className="h-9 text-xs">
          {copy.dismiss}
        </Button>
        <Button size="sm" onClick={reload} className="h-9 gap-1.5 text-xs">
          <RefreshCw className="h-3.5 w-3.5" />
          {copy.reload}
        </Button>
      </div>
    </div>
  );
}

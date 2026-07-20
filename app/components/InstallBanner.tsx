'use client';
import { useEffect, useState } from 'react';

export default function InstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    if (isStandalone) {
      setShow(false);
      return;
    }

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // Ignore service worker registration errors; the app can still work without it.
      });
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as any);
      setShow(true);
    };

    const handleAppInstalled = () => {
      setShow(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShow(false);
      setDeferredPrompt(null);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed top-0 left-0 w-full z-40 flex justify-center pt-2 px-4 pointer-events-none">
      <div className="bg-[#00f2fe]/90 backdrop-blur-md text-black px-6 py-2 rounded-full shadow-lg flex items-center gap-3 pointer-events-auto">
        <span className="font-bold text-sm">Install App</span>
        <button
          onClick={handleInstall}
          className="bg-black text-white px-3 py-1 rounded-full text-xs font-bold"
        >
          Install
        </button>
      </div>
    </div>
  );
}
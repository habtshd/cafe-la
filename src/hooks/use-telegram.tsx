import { useEffect, useState } from "react";
import { getTelegram, initTelegram } from "@/lib/telegram";

export function useIsTelegram() {
  const [tg, setTg] = useState(false);
  useEffect(() => setTg(!!getTelegram()), []);
  return tg;
}

export function useTelegramInit() {
  useEffect(() => {
    initTelegram();
  }, []);
}

/** Shows Telegram's native bottom button while mounted (inside Telegram only). */
export function useTelegramMainButton(text: string | null, onClick: () => void) {
  useEffect(() => {
    const wa = getTelegram();
    if (!wa) return;
    if (!text) {
      wa.MainButton.hide();
      return;
    }
    wa.MainButton.setText(text);
    wa.MainButton.show();
    wa.MainButton.onClick(onClick);
    return () => {
      wa.MainButton.offClick(onClick);
      wa.MainButton.hide();
    };
  }, [text, onClick]);
}

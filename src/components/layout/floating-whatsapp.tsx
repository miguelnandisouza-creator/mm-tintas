import { MessageCircle } from "lucide-react";

import { WhatsAppLink } from "@/components/shared/whatsapp-link";
import { getPublicSettings } from "@/lib/repositories/public-settings";

export async function FloatingWhatsApp() {
  const settings = await getPublicSettings();
  if (!settings.whatsappEnabled) return null;

  return (
    <WhatsAppLink
      message="Olá! Gostaria de falar com a equipe da MM Tintas."
      phone={settings.whatsapp}
      aria-label="Falar com a MM Tintas pelo WhatsApp"
      className="fixed bottom-5 right-5 z-40 grid size-13 place-items-center rounded-2xl bg-emerald-600 text-white shadow-xl shadow-emerald-950/20 transition hover:-translate-y-0.5 hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-emerald-500/40 sm:bottom-7 sm:right-7"
    >
      <MessageCircle aria-hidden="true" className="size-6" />
    </WhatsAppLink>
  );
}

import type { AnchorHTMLAttributes } from "react";

import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

type WhatsAppLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  message: string;
  phone?: string;
};

export function getWhatsAppUrl(message: string, phone = siteConfig.whatsapp) {
  const normalizedPhone = phone.replace(/\D/g, "");
  const target = normalizedPhone
    ? `https://wa.me/${normalizedPhone}`
    : "https://wa.me/";

  return `${target}?text=${encodeURIComponent(message)}`;
}

export function WhatsAppLink({
  message,
  phone,
  className,
  children,
  ...props
}: WhatsAppLinkProps) {
  return (
    <a
      href={getWhatsAppUrl(message, phone)}
      target="_blank"
      rel="noreferrer"
      className={cn(className)}
      {...props}
    >
      {children}
    </a>
  );
}

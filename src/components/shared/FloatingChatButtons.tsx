import { MessageCircle, Phone } from "lucide-react";

const ZALO_PHONE = "0906866262";
const MESSENGER_PAGE = "https://www.facebook.com/messages/t/470099979762277";

const buildZaloLink = (phone: string) => {
  const digits = phone.replace(/[^\d]/g, "");
  if (!digits) return "";
  return `https://zalo.me/${digits}`;
};

const buildMessengerLink = (page: string) => {
  const trimmed = page.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  return `https://m.me/${trimmed.replace(/^@/, "")}`;
};

export default function FloatingChatButtons() {
  const zaloHref = buildZaloLink(ZALO_PHONE);
  const messengerHref = buildMessengerLink(MESSENGER_PAGE);

  if (!zaloHref && !messengerHref) return null;

  const buttonClass =
    "group relative inline-flex h-14 w-14 items-center justify-center rounded-full text-white shadow-lg transition duration-300 ease-out hover:-translate-y-1 hover:scale-105 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80";

  return (
    <div className="fixed bottom-42 right-6 z-50 flex flex-col items-center gap-4 md:bottom-42 md:right-6">
      {messengerHref ? (
        <a
          href={messengerHref}
          target="_blank"
          rel="noopener noreferrer"
          className={`${buttonClass} bg-[#2BB673] shadow-emerald-500/40 hover:shadow-emerald-500/60`}
          aria-label="Chat on Messenger"
          title="Messenger"
        >
          <MessageCircle className="h-6 w-6" />
          <span className="pointer-events-none absolute right-full mr-3 whitespace-nowrap rounded-full bg-black/80 px-3 py-1 text-[11px] font-semibold text-white opacity-0 transition duration-200 group-hover:opacity-100">
            Messenger
          </span>
        </a>
      ) : null}
      {zaloHref ? (
        <a
          href={zaloHref}
          target="_blank"
          rel="noopener noreferrer"
          className={`${buttonClass} bg-[#0A7CFF] shadow-sky-500/40 hover:shadow-sky-500/60`}
          aria-label="Chat on Zalo"
          title="Zalo"
        >
          <Phone className="h-6 w-6" />
          <span className="pointer-events-none absolute right-full mr-3 whitespace-nowrap rounded-full bg-black/80 px-3 py-1 text-[11px] font-semibold text-white opacity-0 transition duration-200 group-hover:opacity-100">
            Zalo
          </span>
        </a>
      ) : null}
    </div>
  );
}

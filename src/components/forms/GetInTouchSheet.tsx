"use client";
import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { useSendContactFormMutation } from "@/services/api";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

type ErrorFields = Partial<
  Record<"name" | "phone" | "email", string>
>;

export default function GetInTouchSheet() {
  const t = useTranslations("contact");
  const locale = useLocale();
  const [mounted, setMounted] = useState(false);
  const [sendContact, { isLoading }] = useSendContactFormMutation();
  const closeRef = useRef<HTMLButtonElement>(null);
  const [errors, setErrors] = useState<ErrorFields>({});

  useEffect(() => {
    setMounted(true);
  }, []);

  const clearError = (field: keyof ErrorFields) =>
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const { [field]: _removed, ...rest } = prev;
      return rest;
    });

  const isValidPhone = (value: string) => {
    const digits = value.replace(/\D/g, "");
    return digits.length >= 9 && digits.length <= 15;
  };

  const errRequired =
    locale === "vi"
      ? "Vui lòng điền thông tin bắt buộc"
      : "Please fill the required fields";
  const errPhone =
    locale === "vi"
      ? "Số điện thoại không hợp lệ"
      : "Please enter a valid phone number";
  const errEmail =
    locale === "vi" ? "Email không hợp lệ" : "Please enter a valid email";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    const data = {
      fullName: (formData.get("name") as string) || "",
      email: (formData.get("email") as string) || "",
      phone: (formData.get("phone") as string) || "",
      message: (formData.get("message") as string) || "N/A",
      organisation: "N/A",
      city: "N/A",
      country: "viet Nam",
      address: "N/A",
    };

    const nextErrors: ErrorFields = {};
    if (!data.fullName.trim()) nextErrors.name = errRequired;
    if (
      !data.email.trim() ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())
    ) {
      nextErrors.email = errEmail;
    }
    if (!data.phone.trim() || !isValidPhone(data.phone)) {
      nextErrors.phone = errPhone;
    }

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      toast.error(
        locale === "vi"
          ? "Vui lòng kiểm tra lại các trường được đánh dấu."
          : "Please correct the highlighted fields."
      );
      return;
    }

    try {
      await sendContact(data).unwrap();
      toast.success(t("toast.success"));
      form.reset();
      setErrors({});
      setTimeout(() => closeRef.current?.click(), 500);
    } catch (err) {
      console.error(err);
      toast.error(t("toast.error"));
    }
  }

  const baseFieldClass =
    "rounded-xl border px-3 py-2.5 text-sm transition bg-white/80 backdrop-blur focus:outline-none focus:ring-2 focus:ring-sky-200 focus:border-sky-400 shadow-sm";

  const fieldErrorClass = (field: keyof ErrorFields) =>
    errors[field]
      ? "border-red-500 ring-1 ring-red-400"
      : "border-slate-200 focus:ring-sky-200 focus:border-sky-400";

  const triggerButton = (
    <Button
      type="button"
      className="bg-gradient-to-r from-[#05acfb] to-[#0fb2ff] text-white font-semibold px-3 sm:px-5 py-2.5 rounded-full shadow-lg shadow-sky-200/60 hover:brightness-110 cursor-pointer text-[11px] sm:text-sm whitespace-nowrap"
    >
      <span className="sm:hidden">
        {locale === "vi" ? "Báo giá" : "Quote"}
      </span>
      <span className="hidden sm:inline">{t("trigger")}</span>
    </Button>
  );

  if (!mounted) {
    return triggerButton;
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        {triggerButton}
      </SheetTrigger>

      <SheetContent
        side="bottom"
        className="max-h-[88vh] w-[92vw] sm:w-[80vw] md:w-[48vw] max-w-3xl left-1/2 -translate-x-1/2 rounded-t-3xl bg-transparent p-0 border-none shadow-2xl"
      >
        <div className="relative overflow-hidden rounded-t-3xl border border-slate-100 bg-gradient-to-br from-white via-slate-50 to-sky-50 shadow-2xl shadow-slate-200/60">
          {/* <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#05acfb] via-[#8fc542] to-[#05acfb]" /> */}
          <div className="absolute left-6 top-4 inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-100">
            <span className="inline-block h-2 w-2 rounded-full bg-[#05acfb] text-lg" />
            {t("title")}
          </div>

          <div className="relative z-0 px-6 pt-12 pb-9 space-y-6 hover:overflow-y-auto scrollbar-hide hover:scrollbar-default transition-all duration-300">
            <SheetHeader className="space-y-1 text-center">
              <SheetTitle className="text-transparent bg-clip-text bg-gradient-to-r from-[#05acfb] to-[#0fb2ff] font-semibold text-2xl leading-snug">
                <VisuallyHidden>
                  <h2>{t("title")}</h2>
                </VisuallyHidden>
              </SheetTitle>

              <SheetDescription className="text-gray-600 text-base mt-3">
                {t("description")}
              </SheetDescription>
            </SheetHeader>

            <form onSubmit={handleSubmit} className="grid gap-4">
              <div className="grid gap-2 md:grid-cols-2">
                <div className="grid gap-1">
                  <Label htmlFor="name">{t("name")}</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder={t("placeholder.name")}
                    required
                    aria-invalid={!!errors.name}
                    className={`${baseFieldClass} ${fieldErrorClass("name")}`}
                    onChange={() => clearError("name")}
                  />
                  {errors.name ? (
                    <p className="text-xs text-red-600">{errors.name}</p>
                  ) : null}
                </div>
                <div className="grid gap-1">
                  <Label htmlFor="phone">{t("phone")}</Label>
                  <Input
                    id="phone"
                    name="phone"
                    placeholder={t("placeholder.phone")}
                    required
                    aria-invalid={!!errors.phone}
                    className={`${baseFieldClass} ${fieldErrorClass("phone")}`}
                    onChange={() => clearError("phone")}
                  />
                  {errors.phone ? (
                    <p className="text-xs text-red-600">{errors.phone}</p>
                  ) : null}
                </div>
              </div>

              <div className="grid gap-1">
                <Label htmlFor="email">{t("email")}</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder={t("placeholder.email")}
                  required
                  aria-invalid={!!errors.email}
                  className={`${baseFieldClass} ${fieldErrorClass("email")}`}
                  onChange={() => clearError("email")}
                />
                {errors.email ? (
                  <p className="text-xs text-red-600">{errors.email}</p>
                ) : null}
              </div>

              <div className="grid gap-1">
                <Label htmlFor="message">
                  {t("message")} ({t("optional")})
                </Label>
                <Textarea
                  id="message"
                  name="message"
                  rows={4}
                  placeholder={t("placeholder.message")}
                  className={`${baseFieldClass} min-h-[120px]`}
                />
              </div>

              <p className="text-xs text-slate-500">
                {t("privacyNote")}
              </p>

              <SheetFooter className="gap-2 sm:space-x-2 justify-end mt-2">
                <SheetClose asChild>
                  <Button
                    ref={closeRef}
                    variant="outline"
                    className="cursor-pointer border-slate-200 text-slate-700 hover:bg-slate-100/80 rounded-full px-4"
                  >
                    {t("close")}
                  </Button>
                </SheetClose>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="cursor-pointer text-white bg-gradient-to-r from-[#05acfb] to-[#0fb2ff] hover:brightness-110 rounded-full px-5"
                >
                  {isLoading ? t("sending") : t("send")}
                </Button>
              </SheetFooter>
            </form>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

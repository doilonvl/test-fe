"use client";

import { useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { useSendContactFormMutation } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

type ErrorFields = Partial<
  Record<"name" | "phone" | "email", string>
>;

type InlineContactFormProps = {
  className?: string;
  heading?: string;
  description?: string;
};

export default function InlineContactForm({
  className = "",
  heading,
  description,
}: InlineContactFormProps) {
  const t = useTranslations("contact");
  const locale = useLocale();
  const [sendContact, { isLoading }] = useSendContactFormMutation();
  const [errors, setErrors] = useState<ErrorFields>({});
  const formRef = useRef<HTMLFormElement>(null);

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
      country: "Vietnam",
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
      formRef.current?.reset();
      setErrors({});
    } catch (err) {
      console.error(err);
      toast.error(t("toast.error"));
    }
  }

  const baseFieldClass =
    "rounded-xl border px-3 py-2.5 text-sm transition bg-white/90 backdrop-blur focus:outline-none focus:ring-2 focus:ring-sky-200 focus:border-sky-400 shadow-sm";

  const fieldErrorClass = (field: keyof ErrorFields) =>
    errors[field]
      ? "border-red-500 ring-1 ring-red-400"
      : "border-slate-200 focus:ring-sky-200 focus:border-sky-400";

  return (
    <div
      className={`overflow-hidden rounded-2xl border bg-white shadow-sm shadow-sky-100/70 ${className}`}
    >
      <div className="border-b bg-gradient-to-r from-[#05acfb]/10 via-[#8fc542]/10 to-[#ff8905]/10 px-5 py-4">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-600">
          {t("trigger")}
        </p>
        <h2 className="mt-1 text-xl font-semibold text-slate-900">
          {heading ?? t("title")}
        </h2>
        {description ? (
          <p className="mt-1 text-sm text-slate-600">{description}</p>
        ) : null}
      </div>

      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="grid gap-4 px-5 py-6"
      >
        <div className="grid gap-3 md:grid-cols-2">
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

        <p className="text-xs text-slate-500">{t("privacyNote")}</p>

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isLoading}
            className="cursor-pointer text-white bg-gradient-to-r from-[#05acfb] to-[#0fb2ff] hover:brightness-110 rounded-full px-6"
          >
            {isLoading ? t("sending") : t("send")}
          </Button>
        </div>
      </form>
    </div>
  );
}

"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";
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

export default function GetInTouchSheet() {
  const t = useTranslations("contact");
  const [sendContact, { isLoading }] = useSendContactFormMutation();
  const closeRef = useRef<HTMLButtonElement>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    const data = {
      fullName: formData.get("name") as string,
      email: formData.get("email") as string,
      organisation: (formData.get("organisation") as string) || "N/A",
      phone: formData.get("phone") as string,
      message: formData.get("message") as string,
      city: (formData.get("city") as string) || "N/A",
      country: "Việt Nam",
      address: (formData.get("address") as string) || "N/A",
    };

    try {
      await sendContact(data).unwrap();
      toast.success(t("toast.success"));
      form.reset();
      setTimeout(() => closeRef.current?.click(), 500);
    } catch (err) {
      console.error(err);
      toast.error(t("toast.error"));
    }
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button className="bg-[#05acfb] text-white font-semibold px-5 py-2 rounded-xl shadow-md hover:brightness-110 cursor-pointer">
          {t("trigger")}
        </Button>
      </SheetTrigger>

      <SheetContent
        side="bottom"
        // aria-label="Get in touch form"
        className="max-h-[85vh] w-[92vw] sm:w-[80vw] md:w-[45vw] max-w-3xl
        left-1/2 -translate-x-1/2 rounded-t-2xl bg-transparent p-0 border-none shadow-2xl"
      >
        <div className="relative overflow-hidden border border-gray-200 rounded-t-2xl bg-white shadow-xl">
          <div
            className="absolute top-0 left-0 w-full h-[70px] bg-white"
            style={{
              clipPath: "path('M0,70 Q80,20 160,0 L100%,0 L100%,70 Z')",
            }}
          />
          <div className="absolute top-0 left-0 z-10 bg-linear-to-r from-[#05acfb] to-[#05acfb] text-white text-2xl font-bold px-5 py-2 rounded-br-3xl shadow-md">
            {t("title")}
          </div>

          <div className="relative z-0 px-6 pt-10 pb-8 space-y-6 hover:overflow-y-auto scrollbar-hide hover:scrollbar-default transition-all duration-300">
            <SheetHeader className="space-y-1 text-center">
              <SheetTitle className="text-[#05acfb] font-semibold text-2xl leading-snug">
                <VisuallyHidden>
                  <h2>{t("title")}</h2>
                </VisuallyHidden>
              </SheetTitle>

              <SheetDescription className="text-gray-600 text-sm mt-4">
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
                  />
                </div>
                <div className="grid gap-1">
                  <Label htmlFor="phone">{t("phone")}</Label>
                  <Input
                    id="phone"
                    name="phone"
                    placeholder={t("placeholder.phone")}
                    required
                  />
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
                />
              </div>

              <div className="grid gap-1">
                <Label htmlFor="organisation">{t("organisation")}</Label>
                <Input
                  id="organisation"
                  name="organisation"
                  placeholder={t("placeholder.organisation")}
                />
              </div>

              <div className="grid gap-2 md:grid-cols-2">
                <div className="grid gap-1">
                  <Label htmlFor="city">{t("city")}</Label>
                  <Input
                    id="city"
                    name="city"
                    placeholder={t("placeholder.city")}
                  />
                </div>
                <div className="grid gap-1">
                  <Label htmlFor="address">{t("address")}</Label>
                  <Input
                    id="address"
                    name="address"
                    placeholder={t("placeholder.address")}
                  />
                </div>
              </div>

              <div className="grid gap-1">
                <Label htmlFor="message">{t("message")}</Label>
                <Textarea
                  id="message"
                  name="message"
                  rows={5}
                  placeholder={t("placeholder.message")}
                />
              </div>

              <SheetFooter className="gap-2 sm:space-x-2 justify-end mt-2">
                <SheetClose asChild>
                  <Button
                    ref={closeRef}
                    variant="outline"
                    className="cursor-pointer border-[#8fc542] text-[#8fc542] hover:bg-[#8fc542]/10"
                  >
                    {t("close")}
                  </Button>
                </SheetClose>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="cursor-pointer text-white bg-[#05acfb] hover:brightness-110"
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

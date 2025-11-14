/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

const images = [
  "/Intro_home/playground1.jpg",
  "/Intro_home/playground2.jpg",
  "/Intro_home/playground3.jpg",
  "/Intro_home/playground4.jpg",
];

export default function IntroBlocks() {
  const t = useTranslations("intro");

  // Lấy mảng block từ file ngôn ngữ
  const blocks = t.raw("blocks") as { title: string; desc: string }[];

  return (
    <section id="intro" className="relative py-16 overflow-hidden">
      <div className="container mx-auto px-4 text-center">
        <div className="flex flex-col items-center gap-1">
          {/* Hàng đầu */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">
            <FeatureCard
              block={{ ...blocks[0], image: images[0] }}
              delay={0.2}
            />
            {/* Tiêu đề giữa */}
            <div className="text-center w-[260px] md:w-[280px]">
              <h3 className="text-sm uppercase tracking-widest text-gray-500 mb-2">
                {t("middleTitle")}
              </h3>
              <h2 className="text-2xl font-bold leading-relaxed">
                {t("unique").split(" ")[0]}{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff8905] to-[#8fc542]">
                  {t("unique").split(" ").slice(1, 3).join(" ")}
                </span>{" "}
                {t("unique").split(" ")[3]} {t("brand")}
              </h2>
            </div>
            <FeatureCard
              block={{ ...blocks[1], image: images[1] }}
              delay={0.2}
            />
          </div>

          {/* Hàng thứ hai */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12 md:-mt-10">
            <FeatureCard
              block={{ ...blocks[2], image: images[2] }}
              delay={0.4}
            />
            <FeatureCard
              block={{ ...blocks[3], image: images[3] }}
              delay={0.6}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function FeatureCard({
  block,
  delay = 0,
}: {
  block: { title: string; desc: string; image: string };
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.6 }}
      viewport={{ once: true }}
      className="relative group h-[360px] w-[320px] sm:w-[340px] md:w-[360px]
        [clip-path:polygon(50%_0%,100%_25%,100%_75%,50%_100%,0%_75%,0%_25%)]
        bg-cover bg-center shadow-[0_8px_30px_-10px_rgba(0,0,0,0.95)]
        hover:shadow-[0_12px_45px_-8px_rgba(0,0,0,0.5)]
        transition-all duration-500 cursor-pointer overflow-hidden"
      style={{ backgroundImage: `url(${block.image})` }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-[#05acfb]/10 group-hover:bg-[#05acfb]/20 backdrop-blur-[2px] transition-all duration-500" />

      {/* Nội dung */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-6 text-white">
        <h3
          className="text-2xl sm:text-xl font-semibold uppercase tracking-widest
          translate-y-16 group-hover:translate-y-4 transition-all duration-500"
        >
          {block.title}
        </h3>
        <p
          className="mt-4 text-sm opacity-0 group-hover:opacity-100
          group-hover:translate-y-0 translate-y-full transition-all duration-500 text-center leading-relaxed"
        >
          {block.desc}
        </p>
      </div>

      {/* Gradient viền */}
      <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_center,#ff8905_0%,#05acfb_60%,#8fc542_100%)] mix-blend-overlay" />
    </motion.div>
  );
}

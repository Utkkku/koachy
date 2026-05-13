"use client"

import { motion } from "framer-motion"
import { ArrowRight, Star, BadgeCheck, Users, Video, ClipboardList } from "lucide-react"
import Link from "next/link"

const floatingTags = [
  { label: "TYT Matematik", color: "bg-[#FACC15]", position: "top-0 -left-4 lg:-left-12", rotate: "-rotate-6", delay: 0.5 },
  { label: "LGS Fen", color: "bg-[#22D3EE]", position: "top-16 -right-2 lg:-right-8", rotate: "rotate-3", delay: 0.6 },
  { label: "Rehberlik", color: "bg-[#EC4899] text-white", position: "bottom-32 -left-2 lg:-left-10", rotate: "rotate-6", delay: 0.7 },
  { label: "AYT Fizik", color: "bg-[#4F46E5] text-white", position: "bottom-12 -right-4 lg:-right-12", rotate: "-rotate-3", delay: 0.8 },
]

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center px-6 py-16 lg:px-8 bg-[#E0720B] overflow-hidden">
      <div className="max-w-7xl mx-auto w-full">
        <div className="grid lg:grid-cols-5 gap-12 lg:gap-16 items-center">
          {/* Left: Text Content (60%) */}
          <div className="lg:col-span-3">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-black leading-[1.05] mb-6 tracking-tight"
            >
              Hedefine Giden En Net ve Kontrollü Rotada{" "}
              <span className="relative inline-block isolate">
                {/* Sarı marker: negatif z-index sayfa arkasının altına kaçmasın */}
                <span
                  aria-hidden
                  className="absolute inset-0 -skew-x-3 bg-[#FACC15] -left-2 -right-2 top-1/4 bottom-0 z-0 pointer-events-none"
                />
                <span className="relative z-[1]">Doğru Adımı</span>
              </span>{" "}
              Bizimle At.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
              className="text-lg md:text-xl text-gray-700 max-w-xl mb-10 leading-relaxed font-medium"
            >
              Sınav süreci sadece bir ders çalışma maratonu değil, bir yönetim sürecidir. Kontrol edilmeyen emek,
              sadece yorgunluk getirir. Kişiselleştirilmiş programını oluştur ve hedefine ulaş.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
            >
              <Link href="/register" className="group inline-flex items-center gap-3 px-8 py-4 text-lg font-bold text-white bg-[#4F46E5] border-[3px] border-black rounded-full shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[3px] hover:translate-y-[3px] transition-all">
                Hemen Başla
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </div>

          {/* Right: Coach Finder Card (40%) */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
            className="lg:col-span-2 relative"
          >
            {/* Floating Topic Tags */}
            {floatingTags.map((tag) => (
              <motion.div
                key={tag.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: tag.delay, type: "spring" }}
                className={`absolute ${tag.position} ${tag.rotate} z-10 hidden sm:block`}
              >
                <div className={`${tag.color} border-[2px] border-black rounded-full px-4 py-2 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] text-sm font-bold`}>
                  {tag.label}
                </div>
              </motion.div>
            ))}

            {/* Main Coach Profile Card */}
            <div className="relative bg-white border-[3px] border-black rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
              {/* Coach Photo */}
              <div className="relative">
                <div className="w-full h-[220px] md:h-[260px] bg-gray-100 border-b-[3px] border-black overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&q=80&auto=format&fit=crop"
                    alt="Örnek koç profil fotoğrafı"
                    className="w-full h-full object-cover object-[center_20%]"
                  />
                </div>
                {/* Verified Badge */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.5, type: "spring" }}
                  className="absolute top-4 right-4 bg-white border-[2px] border-black rounded-full p-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                >
                  <BadgeCheck className="w-5 h-5 text-[#4F46E5]" />
                </motion.div>
              </div>

              {/* Coach Info */}
              <div className="p-6">
                {/* Name & Badge */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-xl font-black text-black">Ayşe Yılmaz</h3>
                    <span className="inline-block mt-1 px-3 py-1 bg-[#22D3EE] border-[2px] border-black rounded-full text-xs font-bold text-black">
                      Matematik Uzmanı
                    </span>
                  </div>
                  {/* Rating */}
                  <div className="flex items-center gap-1 px-3 py-1 bg-[#FACC15] border-[2px] border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    <Star className="w-4 h-4 text-black fill-black" />
                    <span className="font-black text-black">5.0</span>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="flex items-center gap-4 mb-5 text-sm text-gray-600 font-medium">
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>324 öğrenci</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Video className="w-4 h-4" />
                    <span>1200+ ders</span>
                  </div>
                </div>

                {/* CTA Button */}
                <Link href="/register" className="w-full flex items-center justify-center gap-2 px-6 py-4 text-base font-bold text-black bg-[#FACC15] border-[3px] border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all">
                  <ClipboardList className="w-5 h-5" />
                  Randevu Al
                </Link>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bento Stats Strip */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4, ease: "easeOut" }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-16 lg:mt-24"
        >
          {/* Card 1: Yellow */}
          <div className="bg-[#FACC15] border-[3px] border-black rounded-xl p-6 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]">
            <div className="text-4xl md:text-5xl font-black text-black">500+</div>
            <div className="text-base font-bold text-black/80 mt-1">Onaylı Koç</div>
          </div>

          {/* Card 2: Cyan */}
          <div className="bg-[#22D3EE] border-[3px] border-black rounded-xl p-6 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center gap-2">
              <Video className="w-8 h-8 md:w-10 md:h-10 text-black" />
              <div className="text-2xl md:text-3xl font-black text-black">1:1</div>
            </div>
            <div className="text-base font-bold text-black/80 mt-1">Birebir Görüşme</div>
          </div>

          {/* Card 3: Pink */}
          <div className="bg-[#EC4899] border-[3px] border-black rounded-xl p-6 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center gap-2">
              <ClipboardList className="w-8 h-8 md:w-10 md:h-10 text-white" />
            </div>
            <div className="text-base font-bold text-white/90 mt-1">Kişiye Özel Program</div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

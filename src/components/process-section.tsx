"use client"

import { motion } from "framer-motion"
import { Search, CalendarCheck, Target } from "lucide-react"

const steps = [
  {
    number: "1",
    title: "Koçunu Bul",
    description: "Hedefine uygun, deneyimli koçlar arasından seçim yap.",
    icon: Search,
    bgColor: "bg-[#FACC15]",
  },
  {
    number: "2",
    title: "Planı Yap",
    description: "Koçunla birlikte kişiselleştirilmiş çalışma planı oluştur.",
    icon: CalendarCheck,
    bgColor: "bg-[#22D3EE]",
  },
  {
    number: "3",
    title: "Hedefi Vur",
    description: "Düzenli takip ve motivasyonla sınavda fark yarat.",
    icon: Target,
    bgColor: "bg-[#4F46E5]",
    iconColor: "text-white",
  },
]

export function ProcessSection() {
  return (
    <section id="nasil-calisir" className="relative py-24 px-6 lg:px-8 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="text-center mb-16"
        >
          <span className="inline-block px-5 py-2 bg-[#22D3EE] border-[3px] border-black rounded-full text-sm font-black text-black uppercase tracking-wide shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] mb-6">
            Süreç
          </span>
          <h2 className="text-3xl md:text-5xl font-black text-black mb-4 tracking-tight">Nasıl Çalışır?</h2>
          <p className="text-gray-600 text-lg max-w-xl mx-auto font-medium">
            Sadece 3 adımda hedefine giden yolu başlat
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1, ease: "easeOut" }}
              className="relative"
            >
              <div className="bg-white border-[3px] border-black rounded-2xl p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[3px] hover:translate-y-[3px] transition-all h-full">
                {/* Step Number */}
                <div className="absolute -top-4 -left-2 w-10 h-10 bg-black rounded-lg flex items-center justify-center">
                  <span className="text-white font-black text-lg">{step.number}</span>
                </div>

                {/* Icon */}
                <div
                  className={`w-16 h-16 ${step.bgColor} border-[3px] border-black rounded-xl flex items-center justify-center mb-6 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]`}
                >
                  <step.icon className={`w-8 h-8 ${step.iconColor || "text-black"}`} />
                </div>

                <h3 className="text-xl font-black text-black mb-3">{step.title}</h3>
                <p className="text-gray-600 font-medium leading-relaxed">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

"use client"

import { motion } from "framer-motion"
import { ArrowRight, Instagram, Mail } from "lucide-react"
import Link from "next/link"
import { BRAND_EMAIL, BRAND_INSTAGRAM_URL, BRAND_NAME } from "@/src/config/brand"

export function Footer() {
  return (
    <footer className="relative py-20 px-6 lg:px-8 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        {/* CTA Banner */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="bg-[#4F46E5] border-[3px] border-black rounded-2xl p-10 md:p-14 text-center mb-16 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
        >
          <h2 className="text-2xl md:text-4xl font-black text-white mb-4 tracking-tight">Hazır mısın? Hemen Başla!</h2>
          <p className="text-white/90 mb-8 max-w-lg mx-auto font-medium">
            Üstelik ilk görüşme ücretsiz, koçlarımızla tanış ve kişiselleştirilmiş programına başla.
          </p>
          <Link href="/register" className="group inline-flex items-center gap-3 px-8 py-4 text-lg font-bold text-black bg-[#FACC15] border-[3px] border-black rounded-full shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[3px] hover:translate-y-[3px] transition-all">
            Ücretsiz Dene
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

        {/* Footer Grid */}
        <div className="grid md:grid-cols-4 gap-10 mb-12">
          <div>
            <h3 className="text-2xl font-black text-black mb-4">{BRAND_NAME}</h3>
            <p className="text-gray-600 text-sm leading-relaxed font-medium">
              Türkiye&apos;nin en büyük online sınav hazırlık platformu. Hayalindeki okul artık bir adım uzağında.
            </p>
          </div>

          <div>
            <h4 className="font-black text-black mb-4 uppercase text-sm tracking-wide">Platform</h4>
            <ul className="space-y-3 text-gray-600 text-sm font-medium">
              <li>
                <Link href="/coaches" className="hover:text-[#4F46E5] transition-colors">
                  Koçlarımız
                </Link>
              </li>
              <li>
                <Link href="/#nasil-calisir" className="hover:text-[#4F46E5] transition-colors">
                  Nasıl çalışır?
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-[#4F46E5] transition-colors">
                  Fiyatlandırma
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-[#4F46E5] transition-colors">
                  Ücretsiz kayıt
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-black text-black mb-4 uppercase text-sm tracking-wide">Destek</h4>
            <ul className="space-y-3 text-gray-600 text-sm font-medium">
              <li>
                <Link href="/yardim-merkezi" className="hover:text-[#4F46E5] transition-colors">
                  Yardım Merkezi
                </Link>
              </li>
              <li>
                <Link href="/iletisim" className="hover:text-[#4F46E5] transition-colors">
                  İletişim
                </Link>
              </li>
              <li>
                <Link href="/sss" className="hover:text-[#4F46E5] transition-colors">
                  SSS
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-[#4F46E5] transition-colors">
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-black text-black mb-4 uppercase text-sm tracking-wide">Bizi Takip Et</h4>
            <div className="flex items-center gap-3">
              <a
                href={BRAND_INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white border-[2px] border-black rounded-lg flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] hover:bg-[#FACC15] transition-all"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4 text-black" />
              </a>
              <a
                href={`mailto:${BRAND_EMAIL}`}
                className="w-10 h-10 bg-white border-[2px] border-black rounded-lg flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] hover:bg-[#FACC15] transition-all"
                aria-label="E-posta"
              >
                <Mail className="w-4 h-4 text-black" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t-[2px] border-black pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-600 font-medium">
          <p>© 2026 {BRAND_NAME}. Tüm hakları saklıdır.</p>
          <div className="flex flex-wrap items-center justify-center gap-6">
            <Link href="/legal/privacy" className="hover:text-[#4F46E5] transition-colors">
              Gizlilik Politikası
            </Link>
            <Link href="/legal/terms" className="hover:text-[#4F46E5] transition-colors">
              Kullanım Şartları
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

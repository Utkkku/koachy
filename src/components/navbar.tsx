"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Menu, X } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/src/context/AuthContext"
import { BRAND_NAME } from "@/src/config/brand"

const navLinks = [
  /** Ana sayfa dışındayken de çalışması için tam path + hash */
  { label: "Nasıl Çalışır?", href: "/#nasil-calisir" },
  { label: "Koçlarımız", href: "/coaches" },
  { label: "Fiyatlandırma", href: "/pricing" },
]

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { user, userRole } = useAuth()

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="sticky top-0 left-0 right-0 z-50 bg-white border-b-[3px] border-black"
    >
      <nav className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Brand */}
          <Link href="/" className="flex items-center">
            <span className="text-2xl md:text-3xl font-black text-black tracking-tight">{BRAND_NAME}</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-10">
            {navLinks.map((link) =>
              link.href.startsWith('/') ? (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-bold text-black hover:text-[#4F46E5] transition-colors uppercase tracking-wide"
                >
                  {link.label}
                </Link>
              ) : (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-sm font-bold text-black hover:text-[#4F46E5] transition-colors uppercase tracking-wide"
                >
                  {link.label}
                </a>
              )
            )}
          </div>

          {/* Desktop CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {user && userRole?.role ? (
              <>
                {userRole.role === 'Coach' && (
                  <Link
                    href="/coach/dashboard"
                    className="px-5 py-2.5 text-sm font-bold text-black bg-[#FACC15] border-2 border-black rounded-full shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                  >
                    Koç paneli
                  </Link>
                )}
                <Link
                  href="/profile"
                  className="px-5 py-2.5 text-sm font-bold text-black bg-white border-2 border-black rounded-full hover:bg-gray-100 transition-colors"
                >
                  Profil
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-5 py-2.5 text-sm font-bold text-black bg-white border-2 border-black rounded-full hover:bg-gray-100 transition-colors"
                >
                  Giriş Yap
                </Link>
                <Link
                  href="/register"
                  className="px-5 py-2.5 text-sm font-bold text-white bg-[#4F46E5] border-2 border-black rounded-full shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                >
                  Kayıt Ol
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-black border-2 border-black rounded-lg"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden py-6 border-t-2 border-black"
          >
            <div className="flex flex-col gap-4">
              {navLinks.map((link) =>
                link.href.startsWith('/') ? (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-sm font-bold text-black hover:text-[#4F46E5] transition-colors uppercase tracking-wide py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ) : (
                  <a
                    key={link.href}
                    href={link.href}
                    className="text-sm font-bold text-black hover:text-[#4F46E5] transition-colors uppercase tracking-wide py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </a>
                )
              )}
              <div className="flex flex-col gap-3 pt-4 border-t-2 border-black">
                {user && userRole?.role ? (
                  <>
                    {userRole.role === 'Coach' && (
                      <Link
                        href="/coach/dashboard"
                        className="px-5 py-3 text-sm font-bold text-black bg-[#FACC15] border-2 border-black rounded-full text-center shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Koç paneli
                      </Link>
                    )}
                    <Link
                      href="/profile"
                      className="px-5 py-3 text-sm font-bold text-black bg-white border-2 border-black rounded-full text-center"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Profil
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="px-5 py-3 text-sm font-bold text-black bg-white border-2 border-black rounded-full text-center"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Giriş Yap
                    </Link>
                    <Link
                      href="/register"
                      className="px-5 py-3 text-sm font-bold text-white bg-[#4F46E5] border-2 border-black rounded-full shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-center"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Kayıt Ol
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </nav>
    </motion.header>
  )
}

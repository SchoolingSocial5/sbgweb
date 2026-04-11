'use client'
import localFont from 'next/font/local'
import './globals.css'
import '../public/styles/editor.css'
import '../styles/style.css'
import '../styles/users/nav.css'
import 'swiper/css'
import 'swiper/css/effect-fade'
import 'swiper/css/navigation'
import Script from 'next/script'
import 'bootstrap-icons/font/bootstrap-icons.css'
import React from 'react'
import { useEffect, useState } from 'react'
import { ThemeProvider } from '@/context/ThemeProvider'
import { MessageStore } from '@/src/zustand/notification/Message'
import { GeneralProvider } from '@/context/GeneralContext'
import { usePathname } from 'next/navigation'
import CompanyStore from '@/src/zustand/app/Company'

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
})

const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const [isMounted, setIsMounted] = useState(false)
  const { setOnline, setBoxVisibility, setMessage } = MessageStore()
  const { getCompany } = CompanyStore()
  const pathname = usePathname()

  useEffect(() => {
    setBoxVisibility(false)
  }, [pathname])

  useEffect(() => {
    setIsMounted(true)
    getCompany('/company', setMessage)

    // Initialize Offline Sync Service
    const initSync = async () => {
      const { syncService } = await import('@/lib/syncService');
      syncService.init();
    };
    initSync();

    if (navigator.onLine) {
      setOnline('', true)
    } else {
      setOnline("Sorry, you're now offline", false)
    }

    const updateStatusOnline = () => {
      setOnline("Cool! You're now back online", true)
    }

    const updateStatusOffline = () => {
      setOnline("Sorry, you're now offline", false)
    }

    window.addEventListener('online', updateStatusOnline)
    window.addEventListener('offline', updateStatusOffline)

    return () => {
      window.removeEventListener('online', updateStatusOnline)
      window.removeEventListener('offline', updateStatusOffline)
    }
  }, [])

  //------------INITIALIZE SOUND, GET USER IP & INTERNET CONNECTION -------------//
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script id="theme-init" strategy="beforeInteractive">
          {`
            (function () {
              try {
                var savedTheme = localStorage.getItem("theme");
                var prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
                var theme = savedTheme || (prefersDark ? "dark" : "light");
                document.documentElement.classList.add(theme);
              } catch (_) {}
            })();
          `}
        </Script>

        <title>SBG Egg Farms Limited</title>

        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="format-detection" content="telephone=no" />

        <meta
          name="description"
          content="SBG Egg Farm is your trusted source for premium poultry products — from fresh eggs to healthy broilers. We’re dedicated to sustainable farming and quality you can taste."
        />

        <meta
          property="og:title"
          content="SBG Egg Farm — Fresh, Healthy Poultry You Can Trust"
        />
        <meta
          property="og:description"
          content="Experience excellence in poultry farming with SBG Egg Farm. We raise high-quality broilers and layers with care, ensuring freshness, nutrition, and sustainability."
        />
        <meta
          property="og:image"
          content="https://sbgeggfarm.com/images/og-image.jpg"
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://sbgeggfarm.com" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta
          property="twitter:title"
          content="SBG Egg Farm — Quality Poultry Farming"
        />
        <meta
          property="twitter:description"
          content="SBG Egg Farm produces premium poultry and eggs through sustainable farming practices. Fresh. Healthy. Reliable."
        />
        <meta
          property="twitter:image"
          content="https://sbgeggfarm.com/images/og-image.jpg"
        />
        <link rel="icon" href="/favicon.ico" />

        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css?family=Roboto:100,100italic,300,300italic,regular,italic,500,500italic,700,700italic,900,900italic"
          media="all"
        />
        <link
          href="https://fonts.googleapis.com/icon?family=Material+Icons"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css"
        />
        <link href="https://fonts.googleapis.com" rel="preconnect" />
        <link
          href="https://fonts.gstatic.com"
          rel="preconnect"
          crossOrigin="anonymous"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-[100vh] bg-[var(--white-gray)] text-[var(--secondaryTextColor)]`}
      >
        <GeneralProvider>
          <ThemeProvider>{isMounted && children}</ThemeProvider>
        </GeneralProvider>
      </body>
    </html>
  )
}

{
}

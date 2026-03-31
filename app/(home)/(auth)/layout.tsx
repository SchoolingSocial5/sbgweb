import Image from 'next/image'
// export const metadata: Metadata = {
//   title: 'Sign In | Archination',
//   description: 'Sign in to your Archination account to continue.',
// }

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="inset-0 z-30 flex relative items-center justify-center py-[100px]">
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute top-0 left-0 w-full h-full object-cover z-[-1]"
      >
        <source src="/videos/auth.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <div className="custom-container">
        <div className="flex w-full justify-center">
          <div className="relative flex w-full min-h-[400px] max-w-4xl rounded-xl bg-white shadow-lg md:flex-row">
            {/* Left Panel - Quote Section */}
            <div className="hidden w-1/2 flex-col justify-center bg-cover bg-center p-8  md:flex">
              <blockquote className="text-xl italic">
                “What is there more kindly than the feeling between host and
                guest?”
              </blockquote>
              <p className="mt-4 text-sm">– Aeschylus</p>
              <Image
                style={{ height: 'auto', width: 250 }}
                src="/images/logos/ParagonLogo.png"
                loading="lazy"
                sizes="100vw"
                className="my-auto"
                width={0}
                height={0}
                alt="Paragon Logo"
              />
              <div className="mt-auto text-lg font-semibold">
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </div>
            </div>

            {/* Right Panel - Form */}
            <div className="w-full sm:px-8 px-3 py-8 md:w-1/2">{children}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

import SignInClient from '@/components/Public/Auth/SignInClient'
import { generateMetadata } from '@/lib/seo'

export const metadata = generateMetadata({
  title: 'Sign In | SBG EGG',
  description: 'Sign in to your SBG EGG account to continue.',
  twitter: {
    card: 'summary',
    site: '@SBG EGG',
  },
})

export default function SignIn() {
  return (
    <>
      <SignInClient />
    </>
  )
}

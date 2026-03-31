import { generateMetadata } from '@/lib/seo'
import SignUp from '@/components/Public/Auth/SignUp'

export const metadata = generateMetadata({
  title: 'Sign Up | SBG EGG',
  description: 'Create your SBG EGG account now.',
  twitter: {
    card: 'summary',
    site: '@SBG EGG',
  },
})

export default function SignUpClient() {
  return (
    <>
      <SignUp />
    </>
  )
}

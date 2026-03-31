import SignupSuccess from '@/components/Public/Auth/SignupSuccess'
import { generateMetadata } from '@/lib/seo'

export const metadata = generateMetadata({
  title: 'Sign Up Successful | Awiza',
  description:
    'Congratulations, your Awiza account has been created successfully.',
  twitter: {
    card: 'summary',
    site: '@Awiza',
  },
})

export default function SignInClient() {
  return (
    <>
      <SignupSuccess />
    </>
  )
}

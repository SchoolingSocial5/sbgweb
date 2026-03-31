import ResetSuccessful from '@/components/Public/Auth/ResetSuccessful'
import { generateMetadata } from '@/lib/seo'

export const metadata = generateMetadata({
  title: 'Reset Password Successful | SBG EGG',
  description:
    'Congratulations, your SBG EGG account has been created successfully.',
  twitter: {
    card: 'summary',
    site: '@SBG EGG',
  },
})

export default function SignInClient() {
  return (
    <>
      <ResetSuccessful />
    </>
  )
}

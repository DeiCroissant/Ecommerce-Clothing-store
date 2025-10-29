import { redirect } from 'next/navigation'

// Redirect /account to /account/overview
export default function AccountPage() {
  redirect('/account/overview')
}

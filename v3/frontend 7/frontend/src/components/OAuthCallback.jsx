import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { setAuthenticatedUser } from '../redux/authSlice.js'

function rolePath(role) {
  if (role === 'CONTRACTOR') return '/contractor'
  if (role === 'SUPPLIER') return '/supplier'
  return '/owner'
}

export default function OAuthCallback() {
  const [searchParams] = useSearchParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()

  useEffect(() => {
    const accessToken = searchParams.get('access_token')
    const refreshToken = searchParams.get('refresh_token')
    const userText = searchParams.get('user')

    if (!accessToken || !refreshToken || !userText) {
      navigate('/login', { replace: true })
      return
    }

    const user = JSON.parse(userText)
    dispatch(setAuthenticatedUser({ accessToken, refreshToken, user }))
    const profileIsIncomplete = user.profile_complete === false || !user.phone || !user.address || !user.pincode
    navigate(profileIsIncomplete ? '/complete-profile' : rolePath(user.role), { replace: true })
  }, [dispatch, navigate, searchParams])

  return (
    <main className="grid min-h-screen place-items-center bg-cream text-center">
      <div className="rounded-2xl border border-forest-100 bg-white p-6 shadow-card">
        <p className="font-display text-lg font-extrabold text-forest-800">Signing you in...</p>
        <p className="mt-1 text-sm text-graphite/60">Please wait while we complete authentication.</p>
      </div>
    </main>
  )
}

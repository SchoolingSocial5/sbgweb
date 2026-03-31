import { useRouter } from 'next/navigation'
import { useTheme } from '@/context/ThemeProvider'
import { AuthStore } from '@/src/zustand/user/AuthStore'

const ThemeToggle: React.FC = () => {
  const router = useRouter()
  const { theme, toggleTheme } = useTheme()
  const logout = () => {
    AuthStore.getState().logout()
    router.replace('/')
  }
  return (
    <div className="theme_mode web">
      <div onClick={logout} className="circular_icon_button mode mr-2">
        <i className="bi bi-box-arrow-left common-icon "></i>
      </div>
      <span>Logout</span>
      <div onClick={toggleTheme} className="circular_icon_button mode ml-auto">
        {theme === 'light' ? (
          <i className="bi bi-moon common-icon"></i>
        ) : (
          <i className="bi bi-brightness-high common-icon"></i>
        )}
      </div>
    </div>
  )
}

export default ThemeToggle

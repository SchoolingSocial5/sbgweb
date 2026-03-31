// useAuthBootstrap.ts
import { useEffect } from 'react'
import { AuthStore } from './AuthStore'
import axios from 'axios'

export function useAuthBootstrap() {
  const token = AuthStore((s) => s.token)

  useEffect(() => {
    if (!token) return
    axios
      .get('/api/v1/users/auth', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const data = res.data
        console.log(data)
        // if (data.bioUserSchoolInfo) {
        //   AuthStore.getState().setBioUserSchoolInfo(data.bioUserSchoolInfo)
        // }
        // if (data.bioUserState) {
        //   AuthStore.getState().setBioUserState(data.bioUserState)
        // }
        // if (data.bioUserSettings) {
        //   AuthStore.getState().setAllUser(
        //     data.bioUserState,
        //     data.bioUser,
        //     data.bioUserSchoolInfo,
        //     data.bioUserSettings
        //   )
        // }
      })
      .catch((err) => {
        console.error('Failed to refresh auth data:', err)
        AuthStore.getState().logout()
      })
  }, [token])
}

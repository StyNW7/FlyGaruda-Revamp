import { useEffect, useState } from 'react'
import { useApp } from '../store/AppContext'

/** True when the browser is online and the prototype "offline" simulation is off. */
export function useOnline(): boolean {
  const { state } = useApp()
  const [online, setOnline] = useState(() => (typeof navigator === 'undefined' ? true : navigator.onLine))
  useEffect(() => {
    const on = () => setOnline(true)
    const off = () => setOnline(false)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => {
      window.removeEventListener('online', on)
      window.removeEventListener('offline', off)
    }
  }, [])
  return online && !state.offlineSim
}

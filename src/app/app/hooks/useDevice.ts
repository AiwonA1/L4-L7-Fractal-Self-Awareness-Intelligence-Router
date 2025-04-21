import { useEffect, useState } from 'react'

export type DeviceType = 'mobile' | 'tablet' | 'desktop'

export function useDevice() {
  const [deviceType, setDeviceType] = useState<DeviceType>('desktop')

  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth
      if (width < 768) {
        setDeviceType('mobile')
      } else if (width < 1024) {
        setDeviceType('tablet')
      } else {
        setDeviceType('desktop')
      }
    }

    // Initial check
    checkDevice()

    // Add event listener
    window.addEventListener('resize', checkDevice)

    // Cleanup
    return () => window.removeEventListener('resize', checkDevice)
  }, [])

  return deviceType
} 
/** Igual ao `exemplo.html`: primeira visita sem isso abre o modal de localização. */
export const USER_LOCATION_STORAGE_KEY = 'userLocation'

export type UserDeliveryTimes = { minTime: number; maxTime: number }

export type UserLocationData = {
  state: string
  stateName: string
  city: string
  deliveryTimes: UserDeliveryTimes
}

export function readUserLocation(): UserLocationData | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(USER_LOCATION_STORAGE_KEY)
    if (!raw) return null
    const o = JSON.parse(raw) as unknown
    if (!o || typeof o !== 'object') return null
    const x = o as Record<string, unknown>
    if (typeof x.state !== 'string' || typeof x.city !== 'string') return null
    const dt = x.deliveryTimes
    let deliveryTimes: UserDeliveryTimes = { minTime: 30, maxTime: 55 }
    if (dt && typeof dt === 'object' && !Array.isArray(dt)) {
      const d = dt as Record<string, unknown>
      if (typeof d.minTime === 'number' && typeof d.maxTime === 'number') {
        deliveryTimes = { minTime: d.minTime, maxTime: d.maxTime }
      }
    }
    return {
      state: x.state,
      stateName: typeof x.stateName === 'string' ? x.stateName : x.state,
      city: x.city,
      deliveryTimes,
    }
  } catch {
    return null
  }
}

export function writeUserLocation(data: UserLocationData) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(USER_LOCATION_STORAGE_KEY, JSON.stringify(data))
  } catch {
    /* quota */
  }
}

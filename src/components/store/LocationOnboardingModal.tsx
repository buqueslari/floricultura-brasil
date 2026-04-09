import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  readUserLocation,
  writeUserLocation,
  type UserDeliveryTimes,
} from '../../lib/userLocationStorage'
import '../../styles/location-onboarding.css'

const BR_STATES: Record<string, string> = {
  AC: 'Acre',
  AL: 'Alagoas',
  AP: 'Amapá',
  AM: 'Amazonas',
  BA: 'Bahia',
  CE: 'Ceará',
  DF: 'Distrito Federal',
  ES: 'Espírito Santo',
  GO: 'Goiás',
  MA: 'Maranhão',
  MT: 'Mato Grosso',
  MS: 'Mato Grosso do Sul',
  MG: 'Minas Gerais',
  PA: 'Pará',
  PB: 'Paraíba',
  PR: 'Paraná',
  PE: 'Pernambuco',
  PI: 'Piauí',
  RJ: 'Rio de Janeiro',
  RN: 'Rio Grande do Norte',
  RS: 'Rio Grande do Sul',
  RO: 'Rondônia',
  RR: 'Roraima',
  SC: 'Santa Catarina',
  SP: 'São Paulo',
  SE: 'Sergipe',
  TO: 'Tocantins',
}

const GEO_REGION_TO_UF: Record<string, string> = {
  Acre: 'AC',
  Alagoas: 'AL',
  Amapá: 'AP',
  Amazonas: 'AM',
  Bahia: 'BA',
  Ceará: 'CE',
  'Distrito Federal': 'DF',
  'Espírito Santo': 'ES',
  Goiás: 'GO',
  Maranhão: 'MA',
  'Mato Grosso': 'MT',
  'Mato Grosso do Sul': 'MS',
  'Minas Gerais': 'MG',
  Pará: 'PA',
  Paraíba: 'PB',
  Paraná: 'PR',
  Pernambuco: 'PE',
  Piauí: 'PI',
  'Rio de Janeiro': 'RJ',
  'Rio Grande do Norte': 'RN',
  'Rio Grande do Sul': 'RS',
  Rondônia: 'RO',
  Roraima: 'RR',
  'Santa Catarina': 'SC',
  'São Paulo': 'SP',
  Sergipe: 'SE',
  Tocantins: 'TO',
}

const STATE_CAPITAL: Record<string, string> = {
  AC: 'Rio Branco',
  AL: 'Maceió',
  AP: 'Macapá',
  AM: 'Manaus',
  BA: 'Salvador',
  CE: 'Fortaleza',
  DF: 'Brasília',
  ES: 'Vitória',
  GO: 'Goiânia',
  MA: 'São Luís',
  MT: 'Cuiabá',
  MS: 'Campo Grande',
  MG: 'Belo Horizonte',
  PA: 'Belém',
  PB: 'João Pessoa',
  PR: 'Curitiba',
  PE: 'Recife',
  PI: 'Teresina',
  RJ: 'Rio de Janeiro',
  RN: 'Natal',
  RS: 'Porto Alegre',
  RO: 'Porto Velho',
  RR: 'Boa Vista',
  SC: 'Florianópolis',
  SP: 'São Paulo',
  SE: 'Aracaju',
  TO: 'Palmas',
}

const SITE_LABEL = 'Floricultura Brasil - Cestas & Buquês'

async function loadCitiesDb(): Promise<Record<string, string[]>> {
  try {
    const r = await fetch('/cities-db.json')
    if (!r.ok) return {}
    const j = (await r.json()) as unknown
    if (!j || typeof j !== 'object' || Array.isArray(j)) return {}
    return j as Record<string, string[]>
  } catch {
    return {}
  }
}

async function detectGeo(): Promise<{ uf: string; city: string }> {
  try {
    const r = await fetch('https://get.geojs.io/v1/ip/geo.json')
    const data = (await r.json()) as Record<string, string>
    if (data.country_code === 'BR' && data.region) {
      const uf = GEO_REGION_TO_UF[data.region] || 'SP'
      return { uf, city: data.city || STATE_CAPITAL[uf] || 'São Paulo' }
    }
  } catch {
    /* fallback */
  }
  return { uf: 'SP', city: 'São Paulo' }
}

function citiesForState(db: Record<string, string[]>, uf: string): string[] {
  const fromDb = db[uf]
  if (Array.isArray(fromDb) && fromDb.length > 0) return fromDb
  const cap = STATE_CAPITAL[uf]
  return cap ? [cap] : ['Capital']
}

function randomDeliveryTimes(): UserDeliveryTimes {
  const minTime = Math.floor(Math.random() * (30 - 25 + 1)) + 25
  const maxTime = Math.floor(Math.random() * (49 - 39 + 1)) + 39
  return { minTime, maxTime }
}

type Step = 'state' | 'city' | 'loading' | 'result'

export function LocationOnboardingModal() {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<Step>('state')
  const [citiesDb, setCitiesDb] = useState<Record<string, string[]>>({})
  const [detectedUf, setDetectedUf] = useState('SP')
  const [detectedCity, setDetectedCity] = useState('São Paulo')
  const [selectedUf, setSelectedUf] = useState('SP')
  const [selectedCity, setSelectedCity] = useState('São Paulo')
  const [deliveryTimes, setDeliveryTimes] = useState<UserDeliveryTimes>({
    minTime: 30,
    maxTime: 55,
  })
  const [distanceKm] = useState(() =>
    (Math.floor(Math.random() * 15) / 10 + 1.5).toFixed(1),
  )

  useEffect(() => {
    if (readUserLocation()) return

    let alive = true
    void (async () => {
      const [db, geo] = await Promise.all([loadCitiesDb(), detectGeo()])
      if (!alive) return
      setCitiesDb(db)
      setDetectedUf(geo.uf)
      setDetectedCity(geo.city)
      setSelectedUf(geo.uf)
      const list = citiesForState(db, geo.uf)
      const city =
        list.includes(geo.city) ? geo.city : (list[0] ?? geo.city)
      setSelectedCity(city)
      window.setTimeout(() => {
        if (alive) setOpen(true)
      }, 500)
    })()

    return () => {
      alive = false
    }
  }, [])

  const close = useCallback(() => {
    setOpen(false)
  }, [])

  const cities = useMemo(
    () => citiesForState(citiesDb, selectedUf),
    [citiesDb, selectedUf],
  )

  const goToCity = useCallback(() => {
    const list = citiesForState(citiesDb, selectedUf)
    let city = list[0] ?? 'Capital'
    if (
      selectedUf === detectedUf &&
      detectedCity &&
      list.includes(detectedCity)
    ) {
      city = detectedCity
    }
    setSelectedCity(city)
    setStep('city')
  }, [citiesDb, selectedUf, detectedUf, detectedCity])

  const goLoading = useCallback(() => {
    setStep('loading')
    window.setTimeout(() => {
      setDeliveryTimes(randomDeliveryTimes())
      setStep('result')
    }, 2200)
  }, [])

  const finalize = useCallback(() => {
    const data = {
      state: selectedUf,
      stateName: BR_STATES[selectedUf] ?? selectedUf,
      city: selectedCity,
      deliveryTimes: deliveryTimes,
    }
    writeUserLocation(data)
    window.dispatchEvent(new CustomEvent('cesta-user-location', { detail: data }))
    setOpen(false)
  }, [selectedUf, selectedCity, deliveryTimes])

  if (!open) return null

  return (
    <div
      className="location-onboarding fixed inset-0 z-[10050] flex items-center justify-center p-5 transition-opacity duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="lon-title"
    >
      <button
        type="button"
        className="lon-backdrop absolute inset-0 cursor-default border-0 p-0"
        aria-label="Fechar"
        onClick={close}
      />
      <div className="lon-card lon-anim relative z-[1]" key={step}>
        {step === 'state' ? (
          <>
            <button
              type="button"
              className="lon-close"
              onClick={close}
              aria-label="Fechar"
            >
              <svg width={16} height={16} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="lon-icon-wrap">
              <svg width={26} height={26} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h2 id="lon-title" className="lon-title">
              Onde você está?
            </h2>
            <p className="lon-sub">
              Selecione seu estado para encontrarmos a unidade mais próxima de você.
            </p>
            <div className="lon-select-wrap">
              <svg className="lon-select-icon" width={16} height={16} fill="none" stroke="#9ca3af" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
              <select
                className="lon-select"
                value={selectedUf}
                onChange={(e) => setSelectedUf(e.target.value)}
              >
                {Object.entries(BR_STATES).map(([code, name]) => (
                  <option key={code} value={code}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
            <button type="button" className="lon-btn" onClick={goToCity}>
              Continuar
              <svg width={16} height={16} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        ) : null}

        {step === 'city' ? (
          <>
            <button type="button" className="lon-close" onClick={close} aria-label="Fechar">
              <svg width={16} height={16} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="lon-icon-wrap">
              <svg width={26} height={26} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <h2 id="lon-title" className="lon-title">
              Qual sua cidade?
            </h2>
            <p className="lon-sub">
              Estado:{' '}
              <strong>{BR_STATES[selectedUf] ?? selectedUf}</strong>
            </p>
            <div className="lon-select-wrap">
              <svg className="lon-select-icon" width={16} height={16} fill="none" stroke="#9ca3af" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
              <select
                className="lon-select"
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
              >
                {cities.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-2.5">
              <button
                type="button"
                className="lon-btn-back"
                onClick={() => setStep('state')}
              >
                <svg width={14} height={14} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                Voltar
              </button>
              <button type="button" className="lon-btn flex-1" onClick={goLoading}>
                Confirmar
                <svg width={16} height={16} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </>
        ) : null}

        {step === 'loading' ? (
          <div className="flex flex-col items-center px-1 py-4 text-center">
            <div className="lon-spinner" />
            <p className="mt-6 text-base font-bold text-gray-800">
              Buscando a unidade mais próxima...
            </p>
            <p className="mt-1.5 text-[13px] text-gray-400">
              {BR_STATES[selectedUf] ?? selectedUf} · {selectedCity}
            </p>
          </div>
        ) : null}

        {step === 'result' ? (
          <div className="flex flex-col items-center text-center">
            <div className="lon-success-ring">
              <svg width={34} height={34} fill="none" stroke="#fff" viewBox="0 0 24 24" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="mb-1 mt-5 text-[13px] text-gray-500">
              {SITE_LABEL} mais próximo fica a
            </p>
            <p className="mb-1 text-[44px] font-extrabold leading-none text-gray-900">
              {distanceKm}
              <span className="ml-1 text-lg font-semibold text-gray-400">km</span>
            </p>
            <p className="mb-5 text-[13px] text-gray-400">de você</p>
            <div className="lon-time-badge">
              <svg width={13} height={13} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <circle cx={12} cy={12} r={10} />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              Entrega em {deliveryTimes.minTime}–{deliveryTimes.maxTime} min
            </div>
            <button type="button" className="lon-btn mt-6 w-full" onClick={finalize}>
              Ver Ofertas
              <svg width={16} height={16} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        ) : null}
      </div>
    </div>
  )
}

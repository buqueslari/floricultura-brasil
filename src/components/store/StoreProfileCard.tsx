type Props = {
  logoPath?: string
  storeName: string
  locationLabel?: string
}

function VerifiedIcon() {
  return (
    <svg className="h-[20px] w-[20px] text-blue-500" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
        clipRule="evenodd"
      />
    </svg>
  )
}

function PinBlueIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      aria-hidden
    >
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="m12.065 21.243l-.006-.005zm.182-.274a29 29 0 0 0 3.183-3.392c2.04-2.563 3.281-5.09 3.365-7.337a6.8 6.8 0 1 0-13.591 0c.085 2.247 1.327 4.774 3.366 7.337a29 29 0 0 0 3.183 3.392q.166.15.247.218zm-.985 1.165S4 16.018 4 10a8 8 0 1 1 16 0c0 6.018-7.262 12.134-7.262 12.134c-.404.372-1.069.368-1.476 0M12 12.8a2.8 2.8 0 1 0 0-5.6a2.8 2.8 0 0 0 0 5.6m0 1.2a4 4 0 1 1 0-8a4 4 0 0 1 0 8"
      />
    </svg>
  )
}

function PinRedIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 80 80"
      aria-hidden
    >
      <g fill="currentColor">
        <path d="M43 8a3 3 0 1 0-6 0zm-6 4a3 3 0 1 0 6 0zm6 16a3 3 0 1 0-6 0zm-6 6.062a3 3 0 1 0 6 0zm6 16a3 3 0 0 0-6 0zM37 72a3 3 0 1 0 6 0zm0-64v4h6V8zm0 22.062V72h6V50.062z" />
        <path d="M16 13.5a1.5 1.5 0 0 1 1.5-1.5h45.672a2 2 0 0 1 1.414.586l6 6a2 2 0 0 1 0 2.828l-6 6a2 2 0 0 1-1.414.586H17.5a1.5 1.5 0 0 1-1.5-1.5zm48 22.062a1.5 1.5 0 0 0-1.5-1.5H16.828a2 2 0 0 0-1.414.585l-6 6a2 2 0 0 0 0 2.829l6 6a2 2 0 0 0 1.414.586H62.5a1.5 1.5 0 0 0 1.5-1.5z" />
      </g>
    </svg>
  )
}

export function StoreProfileCard({
  logoPath = '/IMG_6963.PNG',
  storeName,
  locationLabel = 'São Paulo - SP',
}: Props) {
  return (
    <>
      <div className="relative" style={{ margin: '-55px 0 0' }}>
        <div
          className="absolute left-1/2 z-10"
          style={{ bottom: -45, transform: 'translateX(-50%)' }}
        >
          <div
            className="overflow-hidden rounded-full border-4 border-white bg-white shadow-[0_8px_24px_rgba(16,24,40,.18)]"
            style={{ width: 90, height: 90 }}
          >
            <img
              src={logoPath}
              alt={storeName}
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </div>

      <div
        className="relative bg-white text-center"
        style={{
          marginTop: 0,
          background: '#fff',
          border: '1px solid #1118271a',
          borderRadius: 26,
          padding: '50px 16px 16px',
        }}
      >
        <h1
          className="text-[18px] text-gray-900 tracking-normal font-normal!"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            justifyContent: 'center',
            marginBottom: 0,
            marginTop: '1px',
            fontFamily: 'Poppins',
            fontWeight: 400,
          }}
        >
          {storeName}
          <VerifiedIcon />
        </h1>
        <div
          className="text-[13px] text-[rgba(34, 197, 94, .95)]"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginTop: '-3px',
            gap: 0,
          }}
        >
          <div>
            <span className="text-green-600/80 font-semibold">
              ⚡ Entrega em até 40min
            </span>
          </div>
          <div className="rating-badge -mt-3">
            <span className="star">★</span>
            <span className="score">4,9</span>
            <span className="count">(1.368 avaliações)</span>
          </div>
          <div className="store-meta justify-center">
            <span className="pill blue">
              <PinBlueIcon /> 2,1km de distância
            </span>
            <span className="pill red">
              <PinRedIcon /> <span>{locationLabel}</span>
            </span>
          </div>
        </div>
      </div>
    </>
  )
}

function formatBRL(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

type Props = {
  itemCount: number
  total: number
  onOpen?: () => void
}

export function FloatingCart({ itemCount, total, onOpen }: Props) {
  return (
    <div
      id="cart-float"
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onOpen?.()
        }
      }}
      role="button"
      tabIndex={0}
      style={{
        display: 'flex',
        position: 'fixed',
        bottom: 10,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 400,
        background: '#22c55e',
        color: '#ffffff',
        borderRadius: 14,
        padding: '16px 20px',
        cursor: 'pointer',
        boxShadow: 'rgba(0, 0, 0, 0.25) 0px 4px 24px',
        alignItems: 'center',
        gap: 12,
        width: 'calc(100% - 20px)',
        maxWidth: 660,
        fontWeight: 600,
        fontSize: 15,
        userSelect: 'none',
      }}
    >
      <div
        style={{
          position: 'relative',
          display: 'inline-flex',
          alignItems: 'center',
        }}
      >
        <svg
          width="22"
          height="22"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth="2.2"
          aria-hidden
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
          />
        </svg>
        {itemCount > 0 ? (
          <span
            id="cart-float-badge"
            style={{
              position: 'absolute',
              top: -8,
              right: -10,
              background: 'red',
              color: '#fff',
              borderRadius: '50%',
              fontSize: 10,
              fontWeight: 600,
              minWidth: 20,
              height: 20,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 3px',
            }}
          >
            {itemCount > 99 ? '99+' : itemCount}
          </span>
        ) : null}
      </div>
      <span>Ver carrinho</span>
      <span style={{ marginLeft: 'auto' }} id="cart-float-total">
        {formatBRL(total)}
      </span>
    </div>
  )
}

import { assetUrl } from '../../config/site'
import type { Testimonial } from '../../data/homepageData'

type Props = {
  items: Testimonial[]
}

export function ReviewsSection({ items }: Props) {
  return (
    <div className=" mt-8">
      <div className="avaliacoes-container">
        <div className="avaliacoes-header">
          <div className="avaliacoes-title-wrapper">
            <span className="avaliacoes-icon text-black">★</span>
            <h2 className="avaliacoes-title">Avaliações</h2>
          </div>
          <span className="badge-excelente">Excelente</span>
        </div>

        <div className="avaliacoes-stats">
          <div className="rating-large" style={{ marginBottom: '0px' }}>
            <span className="star-icon">★</span>
            <span className="rating-number-large">4,9</span>
            <span className="rating-count-large">• 1.368 avaliações</span>
          </div>
          <div className="orders-count">Mais de 3.000 pedidos entregues</div>
        </div>

        <div className="avaliacoes-list">
          {items.map((t) => (
            <div key={`${t.name}-${t.time}`} className="avaliacao-item">
              <img
                src={assetUrl(t.avatar)}
                alt=""
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  objectFit: 'cover',
                  flexShrink: 0,
                  border: '2px solid #f3f4f6',
                }}
              />
              <div className="avaliacao-content">
                <div className="avaliacao-header-row" style={{ marginBottom: '-3px' }}>
                  <div className="avaliacao-name">{t.name}</div>
                  <div className="avaliacao-time">{t.time}</div>
                </div>
                <div className="avaliacao-stars">
                  {Array.from({ length: 5 }, (_, i) => (
                    <span
                      key={i}
                      className={i < t.stars ? 'star-filled' : undefined}
                      style={i >= t.stars ? { color: '#e5e7eb' } : undefined}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <div className="avaliacao-text">{t.text}</div>
              </div>
            </div>
          ))}
        </div>

        <button type="button" className="btn-ver-mais-avaliacoes">
          Ver mais avaliações
        </button>
      </div>
    </div>
  )
}

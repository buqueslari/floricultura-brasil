import { assetUrl } from '../../config/site'
import type { StoreProduct } from '../../data/homepageData'

type Props = {
  product: StoreProduct
  onOpen?: (id: number) => void
  onQuickAdd?: (product: StoreProduct) => void
}

export function CarouselProductCard({ product, onOpen, onQuickAdd }: Props) {
  return (
    <div
      className="carousel-card shadow-md"
      style={{ cursor: 'pointer', position: 'relative' }}
      onClick={() => onOpen?.(product.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onOpen?.(product.id)
        }
      }}
      role="button"
      tabIndex={0}
    >
      <div className="carousel-card-thumb-row">
        <div className="carousel-card-thumb">
          {product.bestseller ? (
            <span className="carousel-card-badge-bestseller">
              <span aria-hidden>🏷️</span>
              Mais Vendido
            </span>
          ) : null}
          {product.discountLabel ? (
            <span className="carousel-card-badge-discount">
              {product.discountLabel}
            </span>
          ) : null}
          <img
            className="carousel-card-img"
            src={assetUrl(product.image)}
            alt={product.name}
          />
        </div>
      </div>
      <div className="carousel-card-body">
        <div className="carousel-card-name">{product.name}</div>
        <div className="carousel-footer">
          <div>
            {product.oldPriceFormatted ? (
              <div className="carousel-old">{product.oldPriceFormatted}</div>
            ) : null}
            <div className="carousel-price">{product.priceFormatted}</div>
          </div>
          <button
            type="button"
            className="btn-add-product"
            style={{ position: 'relative', bottom: 'auto', right: 'auto' }}
            onClick={(e) => {
              e.stopPropagation()
              onQuickAdd?.(product)
            }}
          >
            +
          </button>
        </div>
      </div>
    </div>
  )
}

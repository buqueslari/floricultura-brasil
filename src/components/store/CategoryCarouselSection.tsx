import { useStoreCart } from '../../context/StoreCartContext'
import type { StoreCategory } from '../../data/homepageData'
import { CarouselProductCard } from './CarouselProductCard'

type Props = {
  category: StoreCategory
}

export function CategoryCarouselSection({ category }: Props) {
  const { openProductModal, quickAddProductId } = useStoreCart()

  return (
    <div className="section-category cat-section" id={category.id}>
      <h2 className="category-title mb-0">{category.title}</h2>
      <div className="carousel-wrap">
        <div className="carousel-row">
          {category.products.map((p) => (
            <CarouselProductCard
              key={p.id}
              product={p}
              onOpen={() => openProductModal(p.id)}
              onQuickAdd={() => quickAddProductId(p.id)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

import { useState } from 'react'
import { StoreCartProvider, useStoreCart } from '../../context/StoreCartContext'
import {
  allProductsFlat,
  headerBannerPath,
  homepageCategories,
  midBannerPath,
  testimonials,
} from '../../data/homepageData'
import { CategoryCarouselSection } from './CategoryCarouselSection'
import { CartSheet } from './CartSheet'
import { FloatingCart } from './FloatingCart'
import { InlineSearch } from './InlineSearch'
import { MidBanner } from './MidBanner'
import { ProductModal } from './ProductModal'
import { PurchaseNotification } from './PurchaseNotification'
import { ReviewsSection } from './ReviewsSection'
import { StickySearchBar } from './StickySearchBar'
import { StoreFooter } from './StoreFooter'
import { StoreProfileCard } from './StoreProfileCard'
import { StoreTopBanner } from './StoreTopBanner'

function CestaStoreInner() {
  const [searchQuery, setSearchQuery] = useState('')
  const { itemCount, subtotal, openCart, openProductModal } = useStoreCart()

  return (
    <div className="cesta-store">
      <StoreTopBanner bannerPath={headerBannerPath} />

      <div className="container-mobile min-h-screen pb-12">
        <StoreProfileCard
          storeName="Floricultura Brasil - Cestas & Buquês"
        />

        <InlineSearch
          products={allProductsFlat}
          query={searchQuery}
          onQueryChange={setSearchQuery}
          onPickProduct={(p) => openProductModal(p.id)}
        />

        {homepageCategories.map((cat) => (
          <CategoryCarouselSection key={cat.id} category={cat} />
        ))}

        <MidBanner imagePath={midBannerPath} />
      </div>

      <div className="container-mobile mb-8 mt-8 px-1">
        <ReviewsSection items={testimonials} />
      </div>

      <div
        className={`container-mobile px-1 ${itemCount > 0 ? 'pb-28' : 'pb-12'}`}
      >
        <StoreFooter />
      </div>

      <StickySearchBar query={searchQuery} onQueryChange={setSearchQuery} />
      <PurchaseNotification />

      {itemCount > 0 ? (
        <FloatingCart
          itemCount={itemCount}
          total={subtotal}
          onOpen={openCart}
        />
      ) : null}
    </div>
  )
}

export function CestaStorePage() {
  return (
    <StoreCartProvider>
      <CestaStoreInner />
      <ProductModal />
      <CartSheet />
    </StoreCartProvider>
  )
}

export type StoreProduct = {
  id: number
  name: string
  image: string
  price: number
  priceFormatted: string
  oldPriceFormatted?: string
  discountLabel?: string
  bestseller?: boolean
}

export type StoreCategory = {
  id: string
  title: string
  products: StoreProduct[]
}

export const headerBannerPath = '/uploads/banners/banner-1772588889.webp'
export const midBannerPath =
  '/uploads/banners/banner_1773836689_69ba999142247.webp'

export const homepageCategories: StoreCategory[] = [
  {
    id: 'cat-19',
    title: 'Café da Manhã Surpresa',
    products: [
      {
        id: 85,
        name: 'Cesta Bom Dia Especial',
        image: '/uploads/products/product_1772553660_69a705bc0fd08.webp',
        price: 49.9,
        priceFormatted: 'R$ 49,90',
        oldPriceFormatted: 'R$ 59,90',
        discountLabel: '-17%',
      },
      {
        id: 86,
        name: 'Cesta Café da Manhã Premium',
        image: '/uploads/products/product_1772557748_69a715b494c9f.webp',
        price: 69.9,
        priceFormatted: 'R$ 69,90',
        oldPriceFormatted: 'R$ 82,90',
        discountLabel: '-16%',
      },
      {
        id: 87,
        name: 'Cesta Café da Manhã Romântica',
        image: '/uploads/products/product_1772558288_69a717d0903a9.webp',
        price: 89.9,
        priceFormatted: 'R$ 89,90',
        oldPriceFormatted: 'R$ 109,90',
        discountLabel: '-18%',
      },
      {
        id: 88,
        name: 'Cesta Café da Manhã Suprema',
        image: '/uploads/products/product_1772561342_69a723bec4b5e.webp',
        price: 99.9,
        priceFormatted: 'R$ 99,90',
        oldPriceFormatted: 'R$ 119,90',
        discountLabel: '-17%',
      },
    ],
  },
  {
    id: 'cat-22',
    title: 'Surpresas Românticas',
    products: [
      {
        id: 89,
        name: 'Cesta Luxo Romântica',
        image: '/uploads/products/product_1772561514_69a7246a9931f.webp',
        price: 114.9,
        priceFormatted: 'R$ 114,90',
        oldPriceFormatted: 'R$ 129,90',
        discountLabel: '-12%',
        bestseller: true,
      },
      {
        id: 90,
        name: 'Cesta Romântica Amor Doce',
        image: '/uploads/products/product_1772561669_69a72505ead88.webp',
        price: 99.9,
        priceFormatted: 'R$ 99,90',
        oldPriceFormatted: 'R$ 119,90',
        discountLabel: '-17%',
      },
      {
        id: 91,
        name: 'Cesta Romântica Ursinho, Rosas e Chocolates',
        image: '/uploads/products/product_1772561725_69a7253d77445.webp',
        price: 109.99,
        priceFormatted: 'R$ 109,99',
        oldPriceFormatted: 'R$ 129,99',
        discountLabel: '-15%',
      },
      {
        id: 92,
        name: 'Cesta Romântica Premium',
        image: '/uploads/products/product_1772562987_69a72a2b93f0c.webp',
        price: 134.9,
        priceFormatted: 'R$ 134,90',
        oldPriceFormatted: 'R$ 149,90',
        discountLabel: '-10%',
      },
      {
        id: 93,
        name: 'Kit Vinho & Amor com Taças',
        image: '/uploads/products/product_1772563034_69a72a5a8941d.webp',
        price: 104.9,
        priceFormatted: 'R$ 104,90',
        oldPriceFormatted: 'R$ 114,90',
        discountLabel: '-9%',
      },
      {
        id: 94,
        name: 'Cesta Romântica Elegance Gold',
        image: '/uploads/products/product_1772564925_69a731bd8be09.webp',
        price: 129.9,
        priceFormatted: 'R$ 129,90',
        oldPriceFormatted: 'R$ 159,90',
        discountLabel: '-19%',
      },
    ],
  },
  {
    id: 'cat-23',
    title: 'Presentes Baratos (Até R$60)',
    products: [
      {
        id: 101,
        name: 'Cesta Mini Romântica com Caneca, Chocolates e Buquê',
        image: '/uploads/products/product_1772583614_69a77abe7d268.webp',
        price: 42.9,
        priceFormatted: 'R$ 42,90',
        oldPriceFormatted: 'R$ 99,90',
        discountLabel: '-57%',
      },
      {
        id: 102,
        name: 'Cesta Romântica com Pelúcia e Chocolates',
        image: '/uploads/products/product_1772583698_69a77b12ce5c0.webp',
        price: 39.9,
        priceFormatted: 'R$ 39,90',
        oldPriceFormatted: 'R$ 44,90',
        discountLabel: '-11%',
      },
      {
        id: 103,
        name: 'Caixa Premium de Chocolates Lindt & Ferrero',
        image: '/uploads/products/product_1772583761_69a77b5100600.webp',
        price: 29.9,
        priceFormatted: 'R$ 29,90',
        oldPriceFormatted: 'R$ 34,90',
        discountLabel: '-14%',
      },
      {
        id: 104,
        name: 'Rosas com Nutella Especial',
        image: '/uploads/products/product_1772584139_69a77ccbb94e7.webp',
        price: 57.9,
        priceFormatted: 'R$ 57,90',
        oldPriceFormatted: 'R$ 59,90',
        discountLabel: '-3%',
      },
    ],
  },
  {
    id: 'cat-24',
    title: 'BUQUÊS CLÁSSICOS',
    products: [
      {
        id: 109,
        name: 'Buquê Clássico de 12 Rosas Vermelhas',
        image: '/uploads/products/product_1773834948_69ba92c4eb599.webp',
        price: 69.9,
        priceFormatted: 'R$ 69,90',
        bestseller: true,
      },
      {
        id: 110,
        name: 'Buquê Romântico de 12 Rosas Vermelhas com Gipsofila',
        image: '/uploads/products/product_1773835123_69ba937310492.webp',
        price: 79.9,
        priceFormatted: 'R$ 79,90',
        oldPriceFormatted: 'R$ 89,90',
        discountLabel: '-11%',
      },
      {
        id: 111,
        name: 'Buquê de Rosas Vermelhas e Brancas',
        image: '/uploads/products/product_1773835360_69ba9460200c0.webp',
        price: 84.9,
        priceFormatted: 'R$ 84,90',
        oldPriceFormatted: 'R$ 109,90',
        discountLabel: '-23%',
      },
      {
        id: 112,
        name: 'Buquê Romântico de Rosas Rosa',
        image: '/uploads/products/product_1773835675_69ba959b7f577.webp',
        price: 89.9,
        priceFormatted: 'R$ 89,90',
        oldPriceFormatted: 'R$ 109,90',
        discountLabel: '-18%',
      },
    ],
  },
  {
    id: 'cat-21',
    title: 'Buquês com Chocolates e Extras',
    products: [
      {
        id: 97,
        name: 'Buquê de Rosas + Ferrero Rocher',
        image: '/uploads/products/product_1772581707_69a7734bb2a80.webp',
        price: 67.9,
        priceFormatted: 'R$ 67,90',
        oldPriceFormatted: 'R$ 79,90',
        discountLabel: '-15%',
        bestseller: true,
      },
      {
        id: 98,
        name: 'Buquê Romântico com Mini Espumante',
        image: '/uploads/products/product_1772582779_69a7777bea1a8.webp',
        price: 78.9,
        priceFormatted: 'R$ 78,90',
        oldPriceFormatted: 'R$ 89,90',
        discountLabel: '-12%',
      },
      {
        id: 99,
        name: 'Buquê Amor & Lindt Especial',
        image: '/uploads/products/product_1772583015_69a77867d1ba3.webp',
        price: 92.9,
        priceFormatted: 'R$ 92,90',
        oldPriceFormatted: 'R$ 99,90',
        discountLabel: '-7%',
      },
      {
        id: 100,
        name: 'Buquê Colorido Premium + Ferrero 12 un',
        image: '/uploads/products/product_1772583369_69a779c91038e.webp',
        price: 67.9,
        priceFormatted: 'R$ 67,90',
        oldPriceFormatted: 'R$ 79,90',
        discountLabel: '-15%',
      },
    ],
  },
  {
    id: 'cat-25',
    title: 'CAIXA FLORAL COM ADICIONAIS',
    products: [
      {
        id: 113,
        name: 'Caixa Luxo de Rosas Vermelhas + Ferrero Rocher',
        image: '/uploads/products/product_1773836136_69ba9768d3a4f.webp',
        price: 87.9,
        priceFormatted: 'R$ 87,90',
        oldPriceFormatted: 'R$ 99,90',
        discountLabel: '-12%',
      },
      {
        id: 114,
        name: 'Caixa Romântica de Rosas Rosa + Ferrero Rocher',
        image: '/uploads/products/product_1773837303_69ba9bf750d7e.webp',
        price: 99.9,
        priceFormatted: 'R$ 99,90',
        oldPriceFormatted: 'R$ 129,90',
        discountLabel: '-23%',
      },
      {
        id: 115,
        name: 'Caixa Coração Romântica com Rosas Vermelhas e Ferrero Rocher',
        image: '/uploads/products/product_1773837651_69ba9d5320c87.webp',
        price: 119.9,
        priceFormatted: 'R$ 119,90',
        oldPriceFormatted: 'R$ 139,90',
        discountLabel: '-14%',
      },
      {
        id: 116,
        name: 'Caixa Luxo 24 Rosas Vermelhas com Ferrero Rocher',
        image: '/uploads/products/product_1773839125_69baa31563de9.webp',
        price: 119.9,
        priceFormatted: 'R$ 119,90',
        oldPriceFormatted: 'R$ 169,90',
        discountLabel: '-29%',
      },
    ],
  },
  {
    id: 'cat-20',
    title: 'CESTAS LIGHT/DIET',
    products: [
      {
        id: 95,
        name: 'Cesta Café Saudável',
        image: '/uploads/products/product_1772581517_69a7728d5afa0.webp',
        price: 62.9,
        priceFormatted: 'R$ 62,90',
        oldPriceFormatted: 'R$ 69,90',
        discountLabel: '-10%',
      },
      {
        id: 96,
        name: 'Cesta Café da Manhã Light',
        image: '/uploads/products/product_1772581555_69a772b314b5b.webp',
        price: 69.9,
        priceFormatted: 'R$ 69,90',
        oldPriceFormatted: 'R$ 79,90',
        discountLabel: '-13%',
      },
      {
        id: 107,
        name: 'Cesta Fit Energia',
        image: '/uploads/products/product_1773832412_69ba88dca1aad.webp',
        price: 57.9,
        priceFormatted: 'R$ 57,90',
        oldPriceFormatted: 'R$ 69,90',
        discountLabel: '-17%',
      },
      {
        id: 108,
        name: 'Cesta Equilíbrio Natural',
        image: '/uploads/products/product_1773832532_69ba8954850c5.webp',
        price: 59.9,
        priceFormatted: 'R$ 59,90',
        oldPriceFormatted: 'R$ 64,90',
        discountLabel: '-8%',
      },
    ],
  },
]

export type Testimonial = {
  name: string
  time: string
  text: string
  avatar: string
  stars: number
}

export const testimonials: Testimonial[] = [
  {
    name: 'João A.',
    time: 'Há 80 min',
    text: 'O buquê chegou perfeito e exatamente como na foto. Minha namorada amou!',
    avatar: '/uploads/testimonials/testimonial_1773839479_69baa477a1cad.webp',
    stars: 5,
  },
  {
    name: 'Juliana M.',
    time: 'Há 70 min',
    text: 'Gente, sério… igualzinho à foto! As rosas vieram lindas e os chocolates intactos.',
    avatar: '/uploads/testimonials/testimonial_1772551450_69a6fd1a63fe7.png',
    stars: 5,
  },
  {
    name: 'Camila R.',
    time: 'Há 117 min',
    text: 'Foi presente para minha mãe e ela se emocionou 🥺 Tudo muito bem embalado.',
    avatar: '/uploads/testimonials/testimonial_1772551533_69a6fd6db0e51.png',
    stars: 5,
  },
  {
    name: 'Rafael T.',
    time: 'Há 112 min',
    text: 'Qualidade excelente. Os chocolates são realmente bons e a apresentação é impecável.',
    avatar: '/uploads/testimonials/testimonial_1772551990_69a6ff363715a.png',
    stars: 4,
  },
  {
    name: 'Ana Paula D.',
    time: 'Há 96 min',
    text: 'Comprei com medo de não ser igual a foto, mas é idêntica! Muito capricho.',
    avatar: '/uploads/testimonials/testimonial_1772552008_69a6ff48c01ad.png',
    stars: 5,
  },
  {
    name: 'Beatriz L.',
    time: 'Há 97 min',
    text: 'Entrega rápida e tudo fresquinho. Valeu cada centavo!',
    avatar: '/uploads/testimonials/testimonial_1772552108_69a6ffacf2dc1.png',
    stars: 5,
  },
]

export const allProductsFlat: StoreProduct[] = homepageCategories.flatMap(
  (c) => c.products,
)

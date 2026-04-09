import { allProductsFlat, type StoreProduct } from './homepageData'
import { parseBRLLabel } from '../lib/money'
import {
  PRODUCT_ALLOW_OBSERVATIONS_EXEMPLO,
  PRODUCT_DESCRIPTIONS_EXEMPLO,
} from './productDescriptionsFromExemplo'

export type ComplementItem = {
  id: string
  name: string
  price: number
}

export type ComplementCategory = {
  id: string
  name: string
  max: number
  items: ComplementItem[]
}

export type ProductDetail = StoreProduct & {
  description: string
  allowObservations: boolean
  categories: ComplementCategory[]
  oldPrice?: number
}

const DEFAULT_DESC =
  'Entrega rápida, embalagem especial e o mesmo capricho da foto. Ideal para surpreender quem você ama.'

/** Outros produtos: lista curta tipo “Mais vendidos” */
const ADICIONAIS_PADRAO: ComplementCategory = {
  id: 'adicionais',
  name: '🎁 ADICIONAIS',
  max: 2,
  items: [
    { id: 'ad-pelucia', name: 'Pelúcia pequena', price: 24.9 },
    { id: 'ad-baloes', name: 'Balões tema amor (3 un.)', price: 19.9 },
    { id: 'ad-cartao', name: 'Cartão personalizado', price: 9.9 },
  ],
}

const ADICIONAIS_FLOR: ComplementCategory = {
  id: 'adicionais-flor',
  name: '🌹 ADICIONAIS FLORAIS',
  max: 2,
  items: [
    { id: 'fl-vazo', name: 'Vaso decorativo', price: 18.9 },
    { id: 'fl-cartao', name: 'Cartão com mensagem', price: 0 },
    { id: 'fl-choc', name: 'Ferrero Rocher (3 un.)', price: 12.9 },
  ],
}

/** Igual ao exemplo: 5 grupos, limites e itens do get-product */
const CAFE_MANHA_COMPLEMENTOS_COMPLETOS: ComplementCategory[] = [
  {
    id: 'cafe-manha',
    name: '☕ ADICIONAIS CAFÉ DA MANHÃ',
    max: 7,
    items: [
      {
        id: 'cm-cafe-premium',
        name: 'Café premium (Nescafé Gold)',
        price: 19.9,
      },
      { id: 'cm-croissant', name: 'Croissant', price: 7.9 },
      { id: 'cm-pao-queijo', name: 'Pão de queijo (porção)', price: 14.9 },
      { id: 'cm-mini-bolo', name: 'Mini bolo caseiro', price: 19.9 },
      { id: 'cm-cupcake', name: 'Cupcake gourmet', price: 12.9 },
      { id: 'cm-frutas', name: 'Frutas extras', price: 12.9 },
      { id: 'cm-suco', name: 'Suco integral', price: 14.9 },
    ],
  },
  {
    id: 'adicionais-presente',
    name: '🎁 ADICIONAIS',
    max: 5,
    items: [
      {
        id: 'ap-cartao-msg',
        name: 'Cartão com mensagem personalizada',
        price: 0,
      },
      {
        id: 'ap-foto-wa',
        name: 'Foto do presente antes da entrega (WhatsApp)',
        price: 0,
      },
      {
        id: 'ap-cartao-premium',
        name: 'Cartão premium (papel especial/escrito à mão)',
        price: 9.9,
      },
      { id: 'ap-laco', name: 'Laço decorativo premium', price: 7.9 },
      {
        id: 'ap-embalagem',
        name: 'Embalagem para presente especial',
        price: 9.9,
      },
    ],
  },
  {
    id: 'chocolates',
    name: '🍫 ADICIONAIS DE CHOCOLATES',
    max: 6,
    items: [
      { id: 'ch-ferrero-8', name: 'Caixa Ferrero Rocher (8 un.)', price: 19.9 },
      { id: 'ch-barra', name: 'Barra de chocolate premium', price: 11.9 },
      {
        id: 'ch-ferrero-12',
        name: 'Caixa Ferrero Rocher (12 un.)',
        price: 29.9,
      },
      { id: 'ch-lindt', name: 'Chocolates Lindt Lindor', price: 21.9 },
      { id: 'ch-bombons', name: 'Caixa de bombons sortidos', price: 14.9 },
      { id: 'ch-trufas', name: 'Trufas artesanais (4 un.)', price: 14.9 },
    ],
  },
  {
    id: 'florais',
    name: '🌹 ADICIONAIS FLORAIS',
    max: 5,
    items: [
      { id: 'fl-rosa', name: 'Rosa unitária', price: 14.9 },
      { id: 'fl-buque', name: 'Buquê pequeno de rosas', price: 29.9 },
      { id: 'fl-campo', name: 'Flores do campo complementares', price: 19.9 },
      { id: 'fl-arranjo', name: 'Arranjo floral pequeno', price: 39.9 },
      { id: 'fl-box', name: 'Box floral', price: 59.9 },
    ],
  },
  {
    id: 'romanticos',
    name: '🧸 ADICIONAIS ROMÂNTICOS',
    max: 6,
    items: [
      { id: 'ro-urso-p', name: 'Ursinho de pelúcia pequeno', price: 24.9 },
      { id: 'ro-urso-m', name: 'Ursinho de pelúcia médio', price: 34.9 },
      { id: 'ro-mini-balao', name: 'Mini balão romântico', price: 14.9 },
      { id: 'ro-balao-coracao', name: 'Balão coração grande', price: 24.9 },
      { id: 'ro-caneca', name: 'Caneca romântica', price: 29.9 },
      { id: 'ro-almofada', name: 'Almofada temática "Amor"', price: 39.9 },
    ],
  },
]

/** Cestas café da manhã — mesmo modal completo do exemplo (5 grupos) */
const IDS_CAFE_MANHA_COMPLETO = new Set([85, 86, 87, 88])

const IDS_ROMANTICOS = new Set([89, 90, 91, 92, 93, 94])
const IDS_BARATOS = new Set([101, 102, 103, 104])
const IDS_BUQUES_CLASSICOS = new Set([109, 110, 111, 112])
const IDS_BUQUES_EXTRAS = new Set([97, 98, 99, 100])
const IDS_CAIXA_FLORAL = new Set([113, 114, 115, 116])
const IDS_LIGHT = new Set([95, 96, 107, 108])

function defaultCategoriesForProduct(productId: number): ComplementCategory[] {
  if (IDS_CAFE_MANHA_COMPLETO.has(productId)) {
    return CAFE_MANHA_COMPLEMENTOS_COMPLETOS
  }
  if (IDS_ROMANTICOS.has(productId)) return [ADICIONAIS_PADRAO]
  if (IDS_BARATOS.has(productId)) return [ADICIONAIS_PADRAO]
  if (IDS_BUQUES_CLASSICOS.has(productId)) return [ADICIONAIS_FLOR]
  if (IDS_BUQUES_EXTRAS.has(productId)) return [ADICIONAIS_FLOR]
  if (IDS_CAIXA_FLORAL.has(productId)) return [ADICIONAIS_FLOR]
  if (IDS_LIGHT.has(productId)) {
    return [
      {
        id: 'adic-light',
        name: '🥗 ADICIONAIS',
        max: 2,
        items: [
          { id: 'lt-suco', name: 'Suco natural 300ml', price: 8.9 },
          { id: 'lt-fruta', name: 'Salada de frutas', price: 12.9 },
          { id: 'lt-granola', name: 'Granola extra', price: 6.9 },
        ],
      },
    ]
  }
  return []
}

export function getProductDetail(productId: number): ProductDetail | undefined {
  const p = allProductsFlat.find((x) => x.id === productId)
  if (!p) return undefined

  const rawDesc =
    PRODUCT_DESCRIPTIONS_EXEMPLO[productId] ?? DEFAULT_DESC

  return {
    ...p,
    description: rawDesc.replace(/\r\n/g, '\n'),
    allowObservations:
      PRODUCT_ALLOW_OBSERVATIONS_EXEMPLO[productId] ?? false,
    categories: defaultCategoriesForProduct(productId),
    oldPrice: parseBRLLabel(p.oldPriceFormatted),
  }
}

export function productNeedsModal(productId: number): boolean {
  const d = getProductDetail(productId)
  if (!d) return false
  return d.categories.length > 0 || d.allowObservations
}

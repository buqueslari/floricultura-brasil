import { assetUrl } from '../../config/site'
import { OpenBadge } from './OpenBadge'

type Props = {
  bannerPath: string
}

export function StoreTopBanner({ bannerPath }: Props) {
  return (
    <>
      <div className="relative w-full">
        <img
          src={assetUrl(bannerPath)}
          alt="Banner Floricultura Brasil - Cestas & Buquês"
          className="h-[160px] w-full object-cover"
        />
        <div className="absolute left-3 top-3 flex gap-2">
          <OpenBadge />
        </div>
      </div>
    </>
  )
}

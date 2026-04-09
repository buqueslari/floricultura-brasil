import { assetUrl } from '../../config/site'

type Props = {
  imagePath: string
  alt?: string
}

export function MidBanner({ imagePath, alt = 'Banner' }: Props) {
  return (
    <div className="px-1">
      <div className="banner-fixed">
        <img src={assetUrl(imagePath)} alt={alt} />
      </div>
    </div>
  )
}

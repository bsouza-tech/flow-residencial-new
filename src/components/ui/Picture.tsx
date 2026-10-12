import type { CSSProperties } from 'react';
import {
  imagePath,
  imageSrcSet,
  optimizedImages,
  type OptimizedImageName,
} from '../../data/optimizedImages';

export type PictureProps = {
  name: OptimizedImageName;
  sizes: string;
  alt: string;
  className?: string;
  pictureClassName?: string;
  style?: CSSProperties;
  loading?: 'eager' | 'lazy';
  fetchPriority?: 'high' | 'low' | 'auto';
  /** Override intrinsic width/height (defaults to original). */
  width?: number;
  height?: number;
};

export default function Picture({
  name,
  sizes,
  alt,
  className,
  pictureClassName,
  style,
  loading = 'lazy',
  fetchPriority,
  width,
  height,
}: PictureProps) {
  const meta = optimizedImages[name];
  const fallbackW = meta.largest;
  const fallbackSrc = imagePath(name, fallbackW, 'webp');

  // picture é inline por padrão; sem bloco + largura, height:% / object-fit nos
  // seletores escritos para <img> direto não reservam o mesmo espaço (CLS).
  const pictureStyle: CSSProperties | undefined = pictureClassName
    ? undefined
    : { display: 'block', width: '100%', maxWidth: '100%' };

  return (
    <picture className={pictureClassName} style={pictureStyle}>
      <source type="image/avif" srcSet={imageSrcSet(name, 'avif')} sizes={sizes} />
      <source type="image/webp" srcSet={imageSrcSet(name, 'webp')} sizes={sizes} />
      <img
        src={fallbackSrc}
        srcSet={imageSrcSet(name, 'webp')}
        sizes={sizes}
        width={width ?? meta.width}
        height={height ?? meta.height}
        alt={alt}
        className={className}
        style={style}
        loading={loading}
        decoding="async"
        fetchPriority={fetchPriority}
      />
    </picture>
  );
}

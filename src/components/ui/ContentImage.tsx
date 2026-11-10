import type { CSSProperties } from 'react';
import { type OptimizedImageName } from '../../data/optimizedImages';
import Picture, { type PictureProps } from './Picture';

type ContentImageProps = Omit<PictureProps, 'name'> & {
  name: OptimizedImageName;
  /** Se presente (https), substitui o pipeline local. */
  imageUrl?: string;
};

/** Imagem do conteúdo: pipeline otimizado por name, ou URL https opcional. */
export default function ContentImage({ imageUrl, name, alt, className, style, loading, width, height, ...rest }: ContentImageProps) {
  if (imageUrl) {
    const imgStyle: CSSProperties | undefined = style;
    return (
      <img
        src={imageUrl}
        alt={alt}
        className={className}
        style={imgStyle}
        width={width}
        height={height}
        loading={loading ?? 'lazy'}
        decoding="async"
      />
    );
  }

  return <Picture name={name} alt={alt} className={className} style={style} loading={loading} width={width} height={height} {...rest} />;
}

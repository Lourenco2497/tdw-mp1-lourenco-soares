"use client";

import Image, { type ImageProps, type ImageLoaderProps } from "next/image";

const contentfulLoader = ({ src, width, quality }: ImageLoaderProps) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

export default function ContentfulImage({ alt, ...props }: ImageProps) {
  return <Image alt={alt} loader={contentfulLoader} {...props} />;
}

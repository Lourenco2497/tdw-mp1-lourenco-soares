import ContentfulImage from "./contentful-image";
import type { ContentfulAsset, Post } from "./api";
import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import { BLOCKS } from "@contentful/rich-text-types";

function RichTextAsset({
  id,
  assets,
}: {
  id: string;
  assets: ContentfulAsset[] | undefined;
}) {
  const asset = assets?.find((asset) => asset.sys.id === id);

  if (asset?.url) {
    return (
      <ContentfulImage
        src={asset.url}
        width={asset.width}
        height={asset.height}
        alt={asset.description || ""}
        className="h-auto max-w-full"
      />
    );
  }

  return null;
}

export function Markdown({ content }: { content: Post["content"] }) {
  return documentToReactComponents(content.json, {
    renderNode: {
      [BLOCKS.EMBEDDED_ASSET]: (node) => (
        <RichTextAsset
          id={node.data.target.sys.id}
          assets={content.links?.assets?.block}
        />
      ),
    },
  });
}

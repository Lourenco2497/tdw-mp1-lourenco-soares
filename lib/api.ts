import type { Document } from "@contentful/rich-text-types";

export interface ContentfulAsset {
  sys: { id: string };
  url: string;
  description: string | null;
  width: number;
  height: number;
}

export interface Post {
  slug: string;
  title: string;
  coverImage: { url: string };
  date: string;
  author: { name: string; picture: { url: string } };
  excerpt: string;
  content: {
    json: Document;
    links?: { assets: { block: ContentfulAsset[] } };
  };
}

interface ContentfulResponse {
  data?: { postCollection?: { items?: Post[] } };
  errors?: unknown[];
}

const POST_GRAPHQL_FIELDS = `
  slug
  title
  coverImage {
    url
  }
  date
  author {
    ... on Author {
      name
      picture {
        url
      }
    }
  }
  excerpt
  content {
    json
    links {
      assets {
        block {
          sys { id }
          url
          description
          width
          height
        }
      }
    }
  }
`;

async function fetchGraphQL(
  query: string,
  preview = false,
): Promise<ContentfulResponse> {
  const token = preview
    ? process.env.CONTENTFUL_PREVIEW_ACCESS_TOKEN
    : process.env.CONTENTFUL_ACCESS_TOKEN;

  if (!process.env.CONTENTFUL_SPACE_ID || !token) {
    throw new Error(
      "Contentful configuration is missing a space ID or access token.",
    );
  }

  const response = await fetch(
    `https://graphql.contentful.com/content/v1/spaces/${process.env.CONTENTFUL_SPACE_ID}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ query }),
    },
  );

  if (!response.ok) {
    throw new Error(`Contentful request failed with HTTP ${response.status}.`);
  }

  const result: ContentfulResponse = await response.json();
  if (result.errors?.length) {
    throw new Error(
      "Contentful GraphQL query failed. Check the content model and published linked assets.",
    );
  }
  return result;
}

function extractPost(fetchResponse: ContentfulResponse): Post | undefined {
  return extractPostEntries(fetchResponse)[0];
}

function extractPostEntries(fetchResponse: ContentfulResponse): Post[] {
  const posts = fetchResponse?.data?.postCollection?.items;
  if (!Array.isArray(posts)) {
    throw new Error("Contentful returned an invalid post collection.");
  }
  for (const post of posts) {
    if (
      !post?.title ||
      !post.slug ||
      !post.excerpt ||
      !post.date ||
      Number.isNaN(Date.parse(post.date)) ||
      !post.coverImage?.url ||
      !post.author?.name ||
      !post.author.picture?.url ||
      !post.content?.json
    ) {
      throw new Error(
        "Contentful post is incomplete. Fill required fields and publish linked authors and images.",
      );
    }
  }
  return posts;
}

export async function getPreviewPostBySlug(
  slug: string | null,
): Promise<Post | undefined> {
  const entry = await fetchGraphQL(
    `query {
      postCollection(where: { slug: "${slug}" }, preview: true, limit: 1) {
        items {
          ${POST_GRAPHQL_FIELDS}
        }
      }
    }`,
    true,
  );
  return extractPost(entry);
}

export async function getAllPosts(isDraftMode: boolean): Promise<Post[]> {
  const entries = await fetchGraphQL(
    `query {
      postCollection(where: { slug_exists: true }, order: date_DESC, preview: ${
        isDraftMode ? "true" : "false"
      }) {
        items {
          ${POST_GRAPHQL_FIELDS}
        }
      }
    }`,
    isDraftMode,
  );
  return extractPostEntries(entries);
}

export async function getPostAndMorePosts(
  slug: string,
  preview: boolean,
): Promise<{ post: Post | undefined; morePosts: Post[] }> {
  const entry = await fetchGraphQL(
    `query {
      postCollection(where: { slug: "${slug}" }, preview: ${
        preview ? "true" : "false"
      }, limit: 1) {
        items {
          ${POST_GRAPHQL_FIELDS}
        }
      }
    }`,
    preview,
  );
  const entries = await fetchGraphQL(
    `query {
      postCollection(where: { slug_not_in: "${slug}" }, order: date_DESC, preview: ${
        preview ? "true" : "false"
      }, limit: 2) {
        items {
          ${POST_GRAPHQL_FIELDS}
        }
      }
    }`,
    preview,
  );
  return {
    post: extractPost(entry),
    morePosts: extractPostEntries(entries),
  };
}

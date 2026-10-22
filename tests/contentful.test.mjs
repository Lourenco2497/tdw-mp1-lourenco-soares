import assert from "node:assert/strict";
import { afterEach, beforeEach, test } from "vitest";
import { getAllPosts, getPostAndMorePosts } from "../lib/api.ts";

const originalFetch = globalThis.fetch;
const originalEnv = { ...process.env };
const post = {
  title: "Published post",
  slug: "published-post",
  date: "2026-10-19",
  excerpt: "An excerpt",
  coverImage: { url: "https://images.ctfassets.net/cover.jpg" },
  author: {
    name: "Author",
    picture: { url: "https://images.ctfassets.net/author.jpg" },
  },
  content: { json: { nodeType: "document", content: [] } },
};
const response = (items) =>
  Response.json({ data: { postCollection: { items } } });

beforeEach(() => {
  process.env.CONTENTFUL_SPACE_ID = "test-space";
  process.env.CONTENTFUL_ACCESS_TOKEN = "test-token";
});

afterEach(() => {
  globalThis.fetch = originalFetch;
  process.env = { ...originalEnv };
});

test("returns published content and requests embedded asset details", async () => {
  globalThis.fetch = async (_url, options) => {
    const { query } = JSON.parse(options.body);
    assert.match(query, /preview: false/);
    assert.match(query, /links\s*\{\s*assets/);
    return response([post]);
  };
  // Intentional failure to demonstrate CircleCI quality gating; revert after proof.
  assert.deepEqual(await getAllPosts(false), []);
});

test("rejects missing credentials before making a request", async () => {
  delete process.env.CONTENTFUL_ACCESS_TOKEN;
  globalThis.fetch = async () =>
    assert.fail("Must not send an unauthenticated request");
  await assert.rejects(
    getAllPosts(false),
    /Contentful.*config|CONTENTFUL_ACCESS_TOKEN/i,
  );
});

test("rejects HTTP failures", async () => {
  globalThis.fetch = async () => new Response("Unauthorized", { status: 401 });
  await assert.rejects(getAllPosts(false), /Contentful.*401/);
});

test("rejects GraphQL errors without returning partial content", async () => {
  globalThis.fetch = async () =>
    Response.json({
      data: { postCollection: { items: [post] } },
      errors: [{ message: "Unresolved linked asset" }],
    });
  await assert.rejects(getAllPosts(false), /Contentful.*GraphQL/);
});

test("rejects malformed collection responses", async () => {
  globalThis.fetch = async () => Response.json({ data: {} });
  await assert.rejects(getAllPosts(false), /Contentful.*collection/i);
});

test("rejects unpublished required linked images", async () => {
  globalThis.fetch = async () => response([{ ...post, coverImage: null }]);
  await assert.rejects(
    getAllPosts(false),
    /Contentful.*required|Contentful.*incomplete/i,
  );
});

test("allows a genuinely empty collection", async () => {
  globalThis.fetch = async () => response([]);
  assert.deepEqual(await getAllPosts(false), []);
});

test("returns an absent post for the page to handle as a 404", async () => {
  globalThis.fetch = async () => response([]);
  assert.deepEqual(await getPostAndMorePosts("unknown", false), {
    post: undefined,
    morePosts: [],
  });
});

#!/usr/bin/env node
import { PrismaClient } from "@prisma/client";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const socialLinksPath = resolve(root, "data", "SocialLink.json");
const socialLinks = JSON.parse(readFileSync(socialLinksPath, "utf8"));

const prisma = new PrismaClient();

const seedRows = [
  {
    platform: "instagram",
    originalUrl: socialLinks.instagramTopPost,
    caption: "Instagram post",
    isVisible: true,
  },
  {
    platform: "instagram",
    originalUrl: socialLinks.instagramBottomPost,
    caption: "Instagram post",
    isVisible: true,
  },
  {
    platform: "instagram",
    originalUrl: socialLinks.instagramReel,
    caption: "Instagram reel",
    isVisible: true,
  },
  {
    platform: "linkedin",
    originalUrl: socialLinks.linkedInPost.url,
    caption: "LinkedIn post",
    isVisible: true,
  },
];

async function main() {
  const existing = await prisma.socialPost.findMany({});
  const existingUrls = new Set(existing.map((post) => post.originalUrl));

  const inserts = seedRows.filter((row) => !existingUrls.has(row.originalUrl));

  if (inserts.length === 0) {
    console.log("No new social posts to seed.");
    return;
  }

  await prisma.socialPost.createMany({
    data: inserts,
  });

  console.log(`Seeded ${inserts.length} social posts.`);
}

try {
  await main();
} catch (error) {
  console.error("Failed to seed social posts:", error);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}

import "dotenv/config";

import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { posts, users } from "./db/schema";

import * as schema from "./db/schema";

const client = new pg.Client({
  connectionString: process.env.DRIZZLE_DATABASE_URL,
});

const db = drizzle(client, { schema });

async function runDrizzle() {
  await client.connect();

  // find all posts and the related author and categories
  // using the relational query API
  const allPostsRelational = await db.query.posts.findMany({
    with: {
      author: true,
      categories: {
        with: {
          category: true,
        },
      },
    },
  });
  console.log(JSON.stringify(allPostsRelational, null, 2));

  // find all posts and the related author
  // using the SQL-like operators
  const allPostsSQL = await db
    .select({
      id: posts.id,
      title: posts.title,
      author: {
        id: users.id,
        name: users.name,
      },
    })
    .from(posts)
    .innerJoin(users, eq(posts.authorId, users.id));
  console.log(JSON.stringify(allPostsSQL, null, 2));

  // Create a new post
  const newPost = await db
    .insert(posts)
    .values({
      title: "My new post",
      content: "My new post content",
      authorId: "some author id from your database",
    })
    .returning();
  console.log(JSON.stringify(newPost, null, 2));

  // Update a post
  const updatedPost = await db
    .update(posts)
    .set({
      content: "My new post content updated",
    })
    .where(eq(posts.id, "some post id from your database"))
    .returning();
  console.log(JSON.stringify(updatedPost, null, 2));

  // Delete a post
  const deletedPost = await db
    .delete(posts)
    .where(eq(posts.id, "some post id from your database"))
    .returning();
  console.log(JSON.stringify(deletedPost, null, 2));

  await client.end();
}

runDrizzle();
import { pgTable, varchar, date } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

export const posts = pgTable("posts", {
  id: varchar("id")
    .primaryKey()
    .$defaultFn(() => uuidv4()),
  title: varchar("title"),
  content: varchar("content"),
  authorId: varchar("authorId"),
  publishedAt: date("publishedAt"),
  createdAt: date("createdAt"),
  updatedAt: date("updatedAt"),
});

export const users = pgTable("users", {
  id: varchar("id")
    .primaryKey()
    .$defaultFn(() => uuidv4()),
  email: varchar("email").unique(),
  name: varchar("name"),
  createdAt: date("createdAt"),
  updatedAt: date("updatedAt"),
});

export const categories = pgTable("categories", {
  id: varchar("id")
    .primaryKey()
    .$defaultFn(() => uuidv4()),
  name: varchar("name"),
  createdAt: date("createdAt"),
  updatedAt: date("updatedAt"),
});

export const postsRelations = relations(posts, ({ one, many }) => ({
  author: one(users, {
    fields: [posts.authorId],
    references: [users.id],
  }),
  categories: many(categoriesToPosts),
}));

export const categoriesToPosts = pgTable("categories_to_posts", {
  categoryId: varchar("categoryId")
    .notNull()
    .references(() => categories.id),
  postId: varchar("postId")
    .notNull()
    .references(() => posts.id),
});

export const categoriesRelations = relations(categories, ({ many }) => ({
  posts: many(categoriesToPosts),
}));

export const categoriesToPostsRelations = relations(
  categoriesToPosts,
  ({ one }) => ({
    category: one(categories, {
      fields: [categoriesToPosts.categoryId],
      references: [categories.id],
    }),
    posts: one(posts, {
      fields: [categoriesToPosts.postId],
      references: [posts.id],
    }),
  })
);

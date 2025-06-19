import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function runPrisma() {
  // find all posts
  const allPosts = await prisma.post.findMany();
  console.log(allPosts);

  // find posts with authors
  const allPostsWithAuthors = await prisma.post.findMany({
    include: {
      author: true,
    },
  });
  console.log(allPostsWithAuthors);

  // find posts with authors and categories
  const allPostsWithAuthorsAndCategories = await prisma.post.findMany({
    include: {
      author: true,
      categories: true,
    },
  });
  console.log(allPostsWithAuthorsAndCategories);

  // create a post
  const newPost = await prisma.post.create({
    data: {
      title: "My new post",
      content: "My new post content",
      author: {
        connect: {
          id: "some author id from your database",
        },
      },
    },
  });
  console.log(newPost);

  // update a post
  const updatedPost = await prisma.post.update({
    where: {
      id: "some post id from your database",
    },
    data: {
      content: "My new post content updated",
    },
  });
  console.log(updatedPost);

  // delete a post
  const deletedPost = await prisma.post.delete({
    where: {
      id: "some post id from your database",
    },
  });
  console.log(deletedPost);
}

runPrisma();
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Create users
  const john = await prisma.user.create({
    data: {
      email: "john.doe@example.com",
      name: "John Doe",
    },
  });

  const jane = await prisma.user.create({
    data: {
      email: "jane.doe@example.com",
      name: "Jane Doe",
    },
  });

  // Create categories
  const categories = await Promise.all(
    ["Technology", "Travel", "Food", "Lifestyle"].map((name) =>
      prisma.category.create({ data: { name } })
    )
  );

  // Create posts and associate with categories
  const posts = await Promise.all(
    Array.from({ length: 8 }).map(async (_, index) => {
      const author = index % 2 === 0 ? john : jane;
      const postCategories = [
        categories[index % 4],
        categories[(index + 1) % 4],
      ];

      return prisma.post.create({
        data: {
          title: `Post Title ${index + 1}`,
          content: `This is the content of post ${index + 1}. It's written by ${
            author.name
          }.`,
          author: { connect: { id: author.id } },
          categories: { connect: postCategories.map((c) => ({ id: c.id })) },
          publishedAt: new Date(
            Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)
          ),
        },
      });
    })
  );

  console.log(`Created ${posts.length} posts`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
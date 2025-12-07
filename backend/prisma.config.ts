// Simple Prisma config for CLI; loads .env and points to the schema/migrations.
import 'dotenv/config';

export default {
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
};

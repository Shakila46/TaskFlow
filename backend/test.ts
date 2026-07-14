import prisma from './src/utils/prisma';

async function run() {
  const tasks = await prisma.task.findMany({ include: { dependencies: true } as any });
  const tasksWithDeps = tasks.filter(t => (t as any).dependencies && (t as any).dependencies.length > 0);
  console.log("Tasks with dependencies:", tasksWithDeps.length);
  if (tasksWithDeps.length > 0) {
    console.log(JSON.stringify(tasksWithDeps.map(t => ({ id: t.id, dependencies: (t as any).dependencies.map((d: any) => d.id) })), null, 2));
  }
}
run();

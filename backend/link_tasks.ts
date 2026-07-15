import prisma from './src/utils/prisma';

async function run() {
  const tasks = await prisma.task.findMany({ orderBy: { id: 'asc' } });
  
  // Group by project
  const byProject: Record<number, any[]> = {};
  for (const t of tasks) {
    if (!byProject[t.projectId]) byProject[t.projectId] = [];
    byProject[t.projectId].push(t);
  }

  for (const pTasks of Object.values(byProject)) {
    for (let i = 1; i < pTasks.length; i++) {
      const prev = pTasks[i - 1];
      const curr = pTasks[i];
      console.log(`Connecting ${curr.id} to depend on ${prev.id}`);
      await prisma.task.update({
        where: { id: curr.id },
        data: {
          dependencies: { connect: [{ id: prev.id }] }
        }
      });
    }
  }
  console.log("Done linking tasks.");
}
run();

import jwt from 'jsonwebtoken';
import prisma from './src/utils/prisma';

async function run() {
  const testToken = jwt.sign({ userId: 1, role: 'ADMIN' }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '1h' });

  const tasks = await prisma.task.findMany({ take: 2 });
  if (tasks.length < 2) return;

  const t1 = tasks[0];
  const t2 = tasks[1];

  const payload = {
    title: t1.title,
    description: t1.description,
    projectId: t1.projectId,
    dependencyIds: [t2.id.toString()]
  };

  const res = await fetch(`http://localhost:5000/api/tasks/${t1.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${testToken}`
    },
    body: JSON.stringify(payload)
  });

  console.log("Status:", res.status);
  const text = await res.text();
  console.log("Response:", text);
}

run();

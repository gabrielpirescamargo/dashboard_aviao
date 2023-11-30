import React, { useEffect } from 'react';
import { Chart } from 'react-google-charts';

const columns = [
  { type: 'string', id: 'President' },
  { type: 'date', id: 'Start' },
  { type: 'date', id: 'End' },
];

const rows = [];

export const data = [columns, ...rows];

export function TimelineChart({ selectedWorkersTasks }) {
  const tasks = [];
  const creattingDisplayName = selectedWorkersTasks.map((worker) => {
    worker.tasks.map((task) =>
      tasks.push({ ...task, displayName: `${worker.name} - ${task.name}` })
    );
    return worker;
  });
  const tst = tasks.filter((task) => {
    const taskDate = new Date(task.date);
    const today = new Date();

    if (
      today.getFullYear() == taskDate.getFullYear() &&
      (today.getMonth() < taskDate.getMonth() + 3 ||
        today.getMonth() > taskDate.getMonth() - 3)
    ) {
      return task;
    }
  });
  const tst2 = tst.map((task) => {
    const taskDate = new Date(task.date);
    const millisecondsInADay = 24 * 60 * 60 * 1000;

    const day3 = new Date(taskDate.getTime() + 3 * millisecondsInADay);
    if (task.status == 'Em andamento') {
      return [task?.displayName, new Date(task.date), new Date()];
    } else if (task.status == 'Cancelado' || task.status == 'Concluído') {
      return [task?.displayName, new Date(task.date), day3];
    } else {
      return [task?.displayName, new Date(task.date), day3];
    }
  });
  useEffect(() => {
    if (tst2.length < 4) {
      tst2.push({});
    }
  }, [tst2]);
  return (
    <Chart chartType='Timeline' data={tst2} height='400px' width='800px' />
  );
}

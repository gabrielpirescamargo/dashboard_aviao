import React, { useEffect } from 'react';
import { Chart } from 'react-google-charts';

const options = {
  width: 700,
  sankey: {
    link: { color: { fill: 'white' } },
    node: {
      label: { color: 'black' },
    },
  },
};

export function TreeChart({ user, workers, manager }) {
  const data = [
    ['From', 'To', 'Weight'],

    [manager?.name || 'Sem gerencia', user?.name, 1],
  ];

  workers.map((worker) => {
    data.push([user.name, worker.name, 1]);
    return worker;
  });
  console.log(workers);

  console.log(data);

  return (
    <Chart
      chartType='Sankey'
      width='400px'
      height='100px'
      data={data}
      options={options}
    />
  );
}

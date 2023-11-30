import React from 'react';

export function WorkersTable({ workers }) {
  return (
    <div>
      <table style={{ borderSpacing: '0px 0px' }}>
        <h2>Meus colaboradores</h2>
        <tr style={{ textAlign: 'left' }}>
          <th>Nome</th>
          <th>ID</th>
          <th>E-mail</th>
        </tr>
        {workers?.map((worker) => {
          return (
            <tr
              style={{ textAlign: 'left', cursor: 'pointer' }}
              // onClick={() => setSelectedWorker(worker)}
            >
              <td>{worker.name}</td>
              <td>{worker.id}</td>
              <td>{worker.email}</td>
            </tr>
          );
        })}
      </table>
    </div>
  );
}

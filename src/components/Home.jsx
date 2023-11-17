import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Chart } from 'react-google-charts';

const Home = () => {
  const [userID, setUserID] = useState('');
  const [user, setUser] = useState({});
  const [userTasks, setUserTasks] = useState({});
  const [workers, setWorkers] = useState([]);
  const [selectedWorker, setSelectedWorker] = useState({});
  const [selectedWorkerTasks, setSelectedWorkerTasks] = useState([]);
  const [selectedWorkersTasks, setSelectedWorkersTasks] = useState([]);
  const [workersData, setWorkersData] = useState([]);
  const [userData, setUserData] = useState([]);

  const workersOptions = {
    title: 'Progresso',
    hAxis: {
      title: 'Quantidade',
      minValue: 0,
    },
    vAxis: {
      title: 'Funcionario',
    },
  };

  const myOptions = {
    title: 'My Daily Activities',
    is3D: true,
  };

  const handleChange = async (e) => {
    setWorkersData([]);
    setUserData([]);
    setUser({});
    setUserTasks([]);
    if (e) {
      setUserID(e);

      const userResponse = await axios.get(
        `http://localhost:3000/users?id=${e}`
      );
      const user = userResponse.data[0];
      const myTasksResponse = await axios.get(
        `http://localhost:3000/maintenanceList?assignee=${e}`
      );
      setUserTasks(myTasksResponse.data);
      const totais = {};
      myTasksResponse.data.forEach((task) => {
        const status = task.status;
        if (totais[status]) {
          totais[status] += 1;
        } else {
          totais[status] = 1;
        }
      });
      setUserData([
        ['Status', 'Qty'],
        ['A fazer', totais?.['A fazer'] || 0],
        ['Cancelado', totais?.['Cancelado'] || 0],
        ['Em andamento', totais?.['Em andamento'] || 0],
        ['Concluído', totais?.['Concluído'] || 0],
      ]);

      setUser(user);

      const workersResponse = await axios.get(
        `http://localhost:3000/users?manager=${e}`
      );
      setWorkers(workersResponse.data);
      const workersData = workersResponse.data;

      const tasks = [];
      for (const worker of workersData) {
        const taskResponse = await axios.get(
          `http://localhost:3000/maintenanceList?assignee=${worker.id}`
        );
        const taskData = taskResponse.data;
        tasks.push({
          tasks: taskData,
          id: worker.id,
          name: worker.name,
        });
      }
      const data = tasks.map((employee) => {
        const totais = {};
        employee.tasks.forEach((task) => {
          const status = task.status;
          if (totais[status]) {
            totais[status] += 1;
          } else {
            totais[status] = 1;
          }
        });
        return [
          employee.name,
          totais?.['A fazer'] || 0,
          totais?.['Cancelado'] || 0,
          totais?.['Em andamento'] || 0,
          totais?.['Concluído'] || 0,
        ];
      });
      data.unshift([
        'Nome',
        'A fazer',
        'Cancelado',
        'Em andamento',
        'Concluído',
      ]);
      setWorkersData(data);

      setSelectedWorkersTasks(tasks);
    }
  };
  console.log(userData);
  useEffect(() => {
    axios
      .get(
        `http://localhost:3000/maintenanceList?assignee=${selectedWorker.id}`
      )
      .then((res) => {
        setSelectedWorkerTasks(res.data);
      });
  }, [selectedWorker]);

  const role = () => {
    if (user?.name) {
      if (user?.manager) {
        if (workers?.length > 0) {
          return 'Supervisor';
        } else {
          return 'Funcionario';
        }
      } else {
        return 'ADM';
      }
    }
  };

  return (
    <>
      <div>
        <input type='text' onChange={(e) => handleChange(e.target.value)} />
        <h1 style={{ textAlign: 'left', lineHeight: 0 }}>{user?.name}</h1>
        <h3 style={{ textAlign: 'left' }}>{role()}</h3>
      </div>
      {userData && role() !== 'ADM' && role() && (
        <div>
          <h2>Meus dados</h2>

          <Chart
            chartType='PieChart'
            data={userData}
            options={myOptions}
            height='400px'
            width='800px'
          />
        </div>
      )}
      {role() !== 'Funcionario' && role() && (
        <div>
          <table style={{ borderSpacing: '32px 0px' }}>
            <h2>Dados dos funcionarios</h2>
            <h3>Funcionarios</h3>
            <tr style={{ textAlign: 'left' }}>
              <th>Nome</th>
              <th>ID</th>
              <th>E-mail</th>
            </tr>
            {workers?.map((worker) => {
              return (
                <tr
                  style={{ textAlign: 'left', cursor: 'pointer' }}
                  onClick={() => setSelectedWorker(worker)}
                >
                  <td>{worker.name}</td>
                  <td>{worker.id}</td>
                  <td>{worker.email}</td>
                </tr>
              );
            })}
          </table>
        </div>
      )}

      <div>
        {selectedWorker && (
          <div>
            <h3>{selectedWorker.name}</h3>
          </div>
        )}
      </div>

      <div>
        {workersData.length > 1 && (
          <Chart
            chartType='BarChart'
            height='400px'
            width='800px'
            data={workersData}
            options={workersOptions}
          />
        )}
      </div>
    </>
  );
};

export default Home;

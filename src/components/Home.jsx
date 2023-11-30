import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Chart } from 'react-google-charts';
import { TimelineChart } from './TimelineChart';
import { TreeChart } from './TreeChart';
import { WorkersTable } from './WorkersTable';

const Home = () => {
  const [user, setUser] = useState({});
  const [userTasks, setUserTasks] = useState({});
  const [workers, setWorkers] = useState([]);
  const [selectedWorker, setSelectedWorker] = useState({});
  const [selectedWorkerTasks, setSelectedWorkerTasks] = useState([]);
  const [selectedWorkersTasks, setSelectedWorkersTasks] = useState([]);
  const [workersData, setWorkersData] = useState([]);
  const [userData, setUserData] = useState([]);
  const [manager, setManager] = useState({});
  const [changedManager, setChangedManager] = useState('');
  const [logged, setLogged] = useState(false);
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

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

  const handleLogin = async () => {
    const userResponse = await axios.get(
      `https://backend-pi-7ri0.onrender.com/users?email=${email}&senha=${senha}`
    );

    setUser(userResponse.data[0]);
    handleChange(userResponse.data[0]);
    setLogged(true);
  };
  console.log(user);

  const handleSubmitManager = async () => {
    const newUser = {
      ...user,
      manager: changedManager,
    };
    setUser(newUser);
    await axios({
      method: 'put',
      url: `https://backend-pi-7ri0.onrender.com/users/${user.id}`,
      data: {
        manager: `${changedManager}`,
        id: user.id,
        name: user.name,
        email: user.email,
        senha: user.senha,
      },
    });

    handleChange(newUser);
  };

  const handleChange = async (e) => {
    const user = e;
    setWorkersData([]);
    setUserData([]);
    setUserTasks([]);
    if (user) {
      const myTasksResponse = await axios.get(
        `https://backend-pi-7ri0.onrender.com/maintenanceList?assignee=${user.id}`
      );
      const myManager = await axios.get(
        `https://backend-pi-7ri0.onrender.com/users?id=${user.manager}`
      );

      setManager(myManager.data[0]);

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

      const workersResponse = await axios.get(
        `https://backend-pi-7ri0.onrender.com/users?manager=${user.id}`
      );
      setWorkers(workersResponse.data);
      const workersData = workersResponse.data;

      const tasks = [];
      for (const worker of workersData) {
        const taskResponse = await axios.get(
          `https://backend-pi-7ri0.onrender.com/maintenanceList?assignee=${worker.id}`
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
      if (user.manager !== changedManager) {
        setUser({
          ...user,
          manager: changedManager,
        });
      }
    }
  };
  useEffect(() => {
    axios
      .get(
        `https://backend-pi-7ri0.onrender.com/maintenanceList?assignee=${selectedWorker.id}`
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
        return 'Supervisor';
      }
    }
  };
  return logged ? (
    <div style={{ padding: 50 }}>
      <div>
        <h1 style={{ textAlign: 'left', lineHeight: 0 }}>{user?.name}</h1>
        {/* <h3 style={{ textAlign: 'left' }}>{role()}</h3> */}
      </div>
      <div
        style={{
          background: '#2f2f2f',
          display: 'flex',
          padding: 32,
          paddingTop: 16,
          marginTop: 32,
          flexDirection: 'row',
          alignItems: 'flex-start',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            paddingBottom: 30,
          }}
        >
          {role() !== 'Funcionario' && role() && workers.length > 0 && (
            <WorkersTable workers={workers} />
          )}
          <div>
            <h2>Meu gerente</h2>
            <div>
              <input
                type='text'
                defaultValue={user?.manager || ''}
                onChange={(e) => setChangedManager(e.target.value)}
              />
              <button type='submit' onClick={() => handleSubmitManager()}>
                Trocar
              </button>
            </div>
          </div>
        </div>
        {user?.name && (workers || user?.manager) && (
          <div style={{ marginLeft: 100, marginTop: 100 }}>
            <TreeChart user={user} workers={workers} manager={manager} />
          </div>
        )}
      </div>

      <div
        style={{
          padding: 32,
          paddingTop: 16,
          marginTop: 32,
          background: '#2f2f2f',
        }}
      >
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

        {/* <div>
        {selectedWorker && (
          <div>
            <h3>{selectedWorker.name}</h3>
          </div>
        )}
      </div> */}

        <div style={{ marginTop: 32 }}>
          {workersData.length > 1 && (
            <div>
              {' '}
              <h2>Dados dos colaboradores</h2>
              <Chart
                chartType='BarChart'
                height='400px'
                width='800px'
                data={workersData}
                options={workersOptions}
              />
            </div>
          )}
        </div>

        <div style={{ marginTop: 32 }}>
          {selectedWorkersTasks.length > 4 && (
            <TimelineChart selectedWorkersTasks={selectedWorkersTasks} />
          )}
        </div>
      </div>
    </div>
  ) : (
    <>
      <input
        type='text'
        onChange={(e) => setEmail(e.target.value)}
        placeholder='email'
      />
      <input
        type='text'
        onChange={(e) => setSenha(e.target.value)}
        placeholder='senha'
      />
      <button onClick={() => handleLogin()}>Login</button>
    </>
  );
};

export default Home;

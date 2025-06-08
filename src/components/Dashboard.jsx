// src/components/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { collection, query, where, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import Layout from './Layout';

function Dashboard() {
  const [transacoes, setTransacoes] = useState([]);
  const [entradaTotal, setEntradaTotal] = useState(0);
  const [saidaTotal, setSaidaTotal] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const usuario = auth.currentUser;
    if (!usuario) return;

    const q = query(collection(db, 'transacoes'), where('uid', '==', usuario.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const lista = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setTransacoes(lista);

      const entradas = lista.filter((t) => t.tipo === 'entrada').reduce((acc, t) => acc + t.valor, 0);
      const saidas = lista.filter((t) => t.tipo === 'saida').reduce((acc, t) => acc + t.valor, 0);
      setEntradaTotal(entradas);
      setSaidaTotal(saidas);
    });

    return () => unsubscribe();
  }, []);

  const handleExcluir = async (id) => {
    try {
      await deleteDoc(doc(db, 'transacoes', id));
    } catch (error) {
      console.error('Erro ao excluir:', error);
    }
  };

  const saldo = entradaTotal - saidaTotal;
  const dataGrafico = [
    { name: 'Entradas', value: entradaTotal },
    { name: 'Saídas', value: saidaTotal },
  ];

  const cores = ['#3b82f6', '#ef4444'];

  return (
    <Layout>
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-6">Resumo Financeiro</h1>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-100 text-blue-800 p-4 rounded shadow">
            <h2 className="text-lg font-semibold">Entradas</h2>
            <p className="text-xl">R$ {entradaTotal.toFixed(2)}</p>
          </div>
          <div className="bg-red-100 text-red-800 p-4 rounded shadow">
            <h2 className="text-lg font-semibold">Saídas</h2>
            <p className="text-xl">R$ {saidaTotal.toFixed(2)}</p>
          </div>
          <div className="bg-green-100 text-green-800 p-4 rounded shadow">
            <h2 className="text-lg font-semibold">Saldo Atual</h2>
            <p className="text-xl">R$ {saldo.toFixed(2)}</p>
          </div>
        </div>

        <div className="flex justify-center">
          <PieChart width={300} height={300}>
            <Pie
              data={dataGrafico}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label
            >
              {dataGrafico.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={cores[index % cores.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </div>

        <h2 className="text-xl font-bold mt-10 mb-2">Transações Recentes</h2>
        <ul>
          {transacoes.length === 0 && <li className="text-gray-500">Nenhuma transação cadastrada.</li>}
          {transacoes.map((t) => (
            <li key={t.id} className="flex justify-between items-center border-b py-2">
              <div>
                <p className="font-semibold">{t.descricao || '(Sem descrição)'}</p>
                <p className="text-sm text-gray-500">
                  {new Date(t.data?.toDate?.() || t.data).toLocaleDateString('pt-BR')} {t.categoria && ` - ${t.categoria}`}
                </p>
              </div>
              <div className="text-right">
                <p className={t.tipo === 'entrada' ? 'text-green-600' : 'text-red-600'}>
                  {t.tipo === 'entrada' ? '+' : '-'} R$ {t.valor.toFixed(2)}
                </p>
                <button
                  onClick={() => handleExcluir(t.id)}
                  className="text-red-500 text-sm hover:underline ml-4"
                >
                  Excluir
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </Layout>
  );
}

export default Dashboard;

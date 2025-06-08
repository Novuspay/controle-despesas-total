// src/components/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, query, where, deleteDoc, doc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { Pie } from 'react-chartjs-2';
import 'chart.js/auto';

function Dashboard() {
  const [transacoes, setTransacoes] = useState([]);
  const [usuario, setUsuario] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        setUsuario(user);
        const q = query(collection(db, 'transacoes'), where('uid', '==', user.uid));
        const unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
          const lista = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            data: doc.data().data?.toDate?.() || new Date(),
          }));
          setTransacoes(lista.sort((a, b) => b.data - a.data));
        });
        return () => unsubscribeSnapshot();
      } else {
        navigate('/');
      }
    });
    return () => unsubscribeAuth();
  }, [navigate]);

  const handleExcluir = async (id) => {
    await deleteDoc(doc(db, 'transacoes', id));
  };

  const entradas = transacoes.filter((t) => t.tipo === 'entrada').reduce((acc, t) => acc + t.valor, 0);
  const saidas = transacoes.filter((t) => t.tipo === 'saida').reduce((acc, t) => acc + t.valor, 0);
  const saldo = entradas - saidas;

  const dataGrafico = {
    labels: ['Entradas', 'Saídas'],
    datasets: [
      {
        data: [entradas, saidas],
        backgroundColor: ['#3b82f6', '#ef4444'],
      },
    ],
  };

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h2 className="text-xl font-bold mb-2">Olá, {usuario?.email} 👋</h2>
      <p className="mb-4">Bem-vindo ao seu painel de controle</p>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-100 p-4 rounded text-center">
          <p className="text-sm text-blue-700 font-medium">Entradas</p>
          <p className="text-lg font-bold text-blue-900">R$ {entradas.toFixed(2)}</p>
        </div>
        <div className="bg-red-100 p-4 rounded text-center">
          <p className="text-sm text-red-700 font-medium">Saídas</p>
          <p className="text-lg font-bold text-red-900">R$ {saidas.toFixed(2)}</p>
        </div>
        <div className="bg-green-100 p-4 rounded text-center">
          <p className="text-sm text-green-700 font-medium">Saldo Atual</p>
          <p className="text-lg font-bold text-green-900">R$ {saldo.toFixed(2)}</p>
        </div>
      </div>

      <div className="max-w-xs mx-auto mb-6">
        <Pie data={dataGrafico} />
      </div>

      <div className="flex justify-between gap-4 mb-6">
        <button
          onClick={() => navigate('/nova')}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Nova Transação
        </button>
        <button
          onClick={() => auth.signOut()}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Sair
        </button>
      </div>

      <h3 className="text-lg font-semibold mb-2">Transações Recentes</h3>
      <ul>
        {transacoes.map((t) => (
          <li key={t.id} className="flex justify-between items-center mb-2 border-b pb-1">
            <div>
              <p className="font-medium">{t.descricao}</p>
              <small>{t.data.toLocaleDateString()}</small>
              {t.categoria && <p className="text-sm text-gray-500">{t.categoria}</p>}
            </div>
            <div className="flex items-center gap-2">
              <span className={`font-bold ${t.tipo === 'entrada' ? 'text-green-600' : 'text-red-600'}`}>
                {t.tipo === 'entrada' ? '+' : '-'} R$ {t.valor.toFixed(2)}
              </span>
              <button
                onClick={() => handleExcluir(t.id)}
                className="text-sm text-red-500 hover:underline"
              >
                Excluir
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Dashboard;

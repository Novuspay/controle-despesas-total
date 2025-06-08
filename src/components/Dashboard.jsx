// src/components/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';

function Dashboard() {
  const [transacoes, setTransacoes] = useState([]);
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUsuario(user);
        const q = query(collection(db, 'transacoes'), where('uid', '==', user.uid));
        const unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
          const lista = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
          setTransacoes(lista);
        });
        return () => unsubscribeSnapshot();
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const entradas = transacoes.filter((t) => t.tipo === 'entrada');
  const saidas = transacoes.filter((t) => t.tipo === 'saida');
  const totalEntradas = entradas.reduce((acc, cur) => acc + cur.valor, 0);
  const totalSaidas = saidas.reduce((acc, cur) => acc + cur.valor, 0);
  const total = totalEntradas + totalSaidas;

  const porcentagemEntrada = total > 0 ? (totalEntradas / total) * 100 : 50;
  const porcentagemSaida = 100 - porcentagemEntrada;

  const handleExcluir = async (id) => {
    await deleteDoc(doc(db, 'transacoes', id));
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>

      <div className="mb-6">
        <div className="w-64 h-64 relative mx-auto">
          <svg viewBox="0 0 32 32" className="w-full h-full">
            <circle
              r="16"
              cx="16"
              cy="16"
              fill="white"
              stroke="green"
              strokeWidth="32"
              strokeDasharray={`${porcentagemEntrada} ${100 - porcentagemEntrada}`}
              transform="rotate(-90 16 16)"
            />
          </svg>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
            <p className="font-bold">Entradas</p>
            <p className="text-green-600">{porcentagemEntrada.toFixed(1)}%</p>
            <p className="text-red-500">{porcentagemSaida.toFixed(1)}%</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <h2 className="text-xl font-semibold mb-2 text-green-600">Entradas</h2>
          <ul>
            {entradas.map((t) => (
              <li key={t.id} className="flex justify-between">
                <span>{t.descricao || 'Sem descrição'} - ${t.valor.toFixed(2)}</span>
                <button onClick={() => handleExcluir(t.id)} className="text-red-500 ml-2">Excluir</button>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2 text-red-500">Saídas</h2>
          <ul>
            {saidas.map((t) => (
              <li key={t.id} className="flex justify-between">
                <span>{t.descricao || 'Sem descrição'} - ${t.valor.toFixed(2)}</span>
                <button onClick={() => handleExcluir(t.id)} className="text-red-500 ml-2">Excluir</button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

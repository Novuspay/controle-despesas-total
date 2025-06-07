// src/components/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../firebase';
import { useNavigate, Link } from 'react-router-dom';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

function Dashboard() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(null);
  const [transacoes, setTransacoes] = useState([]);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUsuario(user);
        const q = query(collection(db, 'transacoes'), where('usuarioId', '==', user.uid));
        const unsubscribeFirestore = onSnapshot(q, (snapshot) => {
          const lista = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
          setTransacoes(lista);
        });
        return () => unsubscribeFirestore();
      } else {
        navigate('/login');
      }
    });
    return () => unsubscribeAuth();
  }, [navigate]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-3xl mx-auto bg-white shadow-md rounded p-6">
        <h1 className="text-3xl font-bold mb-2">Olá, {usuario?.displayName || usuario?.email || 'Usuário'} 👋</h1>
        <p className="text-gray-600 mb-6">Bem-vindo ao seu painel de controle</p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-100 text-blue-800 p-4 rounded shadow">
            <h2 className="font-semibold">Entradas</h2>
            <p className="text-xl font-bold">R$ 4.200,00</p>
          </div>
          <div className="bg-red-100 text-red-800 p-4 rounded shadow">
            <h2 className="font-semibold">Saídas</h2>
            <p className="text-xl font-bold">R$ 2.750,00</p>
          </div>
          <div className="bg-green-100 text-green-800 p-4 rounded shadow">
            <h2 className="font-semibold">Saldo Atual</h2>
            <p className="text-xl font-bold">R$ 1.450,00</p>
          </div>
        </div>

        <div className="flex justify-between mb-6">
          <Link
            to="/nova"
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Nova Transação
          </Link>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Sair
          </button>
        </div>

        <h2 className="text-xl font-semibold mb-2">Transações Recentes</h2>
        {transacoes.length === 0 ? (
          <p className="text-gray-500">Nenhuma transação cadastrada.</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {transacoes.map((transacao) => (
              <li key={transacao.id} className="py-2 flex justify-between items-center">
                <div>
                  <p className="font-medium">{transacao.descricao}</p>
                  <span className="text-sm text-gray-500">{new Date(transacao.data?.seconds * 1000).toLocaleDateString()}</span>
                </div>
                <span className={
                  transacao.tipo === 'entrada'
                    ? 'text-green-600 font-bold'
                    : 'text-red-600 font-bold'
                }>
                  {transacao.tipo === 'entrada' ? '+' : '-'} R$ {transacao.valor.toFixed(2)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default Dashboard;

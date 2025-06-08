// src/components/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import {
  collection,
  query,
  where,
  onSnapshot,
  deleteDoc,
  doc
} from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const [transacoes, setTransacoes] = useState([]);
  const [entradaTotal, setEntradaTotal] = useState(0);
  const [saidaTotal, setSaidaTotal] = useState(0);
  const [nomeUsuario, setNomeUsuario] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const usuario = auth.currentUser;
    if (!usuario) return;

    setNomeUsuario(usuario.displayName || usuario.email);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 via-indigo-900 to-slate-700 text-gray-100 p-4">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">Bem-vindo, {nomeUsuario} 👋</h1>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          <div className="bg-white text-green-600 p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold">Entradas</h2>
            <p className="text-2xl font-bold">R$ {entradaTotal.toFixed(2)}</p>
          </div>
          <div className="bg-white text-red-600 p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold">Saídas</h2>
            <p className="text-2xl font-bold">R$ {saidaTotal.toFixed(2)}</p>
          </div>
          <div className="bg-white text-emerald-600 p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold">Saldo Atual</h2>
            <p className="text-2xl font-bold">R$ {saldo.toFixed(2)}</p>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow text-gray-800">
            <h2 className="text-xl font-semibold text-indigo-600 mb-4">Nova Transação</h2>
            <button
              onClick={() => navigate('/nova')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded w-full"
            >
              Ir para o Formulário
            </button>
          </div>

          <div className="bg-white p-6 rounded-lg shadow text-gray-800">
            <h2 className="text-xl font-semibold text-red-500 mb-4">Transações</h2>
            <ul className="space-y-3 max-h-[400px] overflow-y-auto">
              {transacoes.length === 0 && <li className="text-gray-500">Nenhuma transação cadastrada.</li>}
              {transacoes.map((t) => (
                <li key={t.id} className="flex justify-between items-center border-b pb-2">
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
                      className="text-red-500 text-sm hover:underline mt-1"
                    >
                      Excluir
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Dashboard;

// src/components/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { collection, query, where, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

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

  return (
    <div className="min-h-screen bg-gradient-to-tr from-slate-800 via-indigo-900 to-slate-700 text-gray-800 p-6">
      <h1 className="text-3xl font-extrabold text-white text-center mb-8">
        <span role="img" aria-label="money">💰</span> Controle de Gastos
        <p className="text-sm font-normal mt-1 text-indigo-200">Controle cada real que entra e sai</p>
      </h1>

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-4 rounded-xl shadow text-center">
          <p className="text-sm font-medium text-gray-600 flex items-center justify-center gap-1">
            <span className="text-green-500">🟢</span> Total de Entradas
          </p>
          <p className="text-2xl text-green-600 font-bold">R$ {entradaTotal.toFixed(2)}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow text-center">
          <p className="text-sm font-medium text-gray-600 flex items-center justify-center gap-1">
            <span className="text-red-500">🔴</span> Total de Saídas
          </p>
          <p className="text-2xl text-red-500 font-bold">R$ {saidaTotal.toFixed(2)}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow text-center">
          <p className="text-sm font-medium text-gray-600 flex items-center justify-center gap-1">
            <span className="text-blue-500">🔵</span> Saldo Atual
          </p>
          <p className="text-2xl text-emerald-600 font-bold">R$ {saldo.toFixed(2)}</p>
        </div>
      </div>

      {/* Área principal */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Formulário de Nova Transação */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-lg font-bold text-indigo-700 mb-4 flex items-center gap-2">
            ➕ Nova Transação
          </h2>
          <button
            onClick={() => navigate('/nova')}
            className="bg-indigo-500 hover:bg-indigo-600 text-white py-2 px-4 rounded-lg font-semibold w-full transition"
          >
            Ir para o Formulário
          </button>
        </div>

        {/* Lista de Transações */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-lg font-bold text-red-600 mb-4 flex items-center gap-2">
            📄 Transações
          </h2>

          {transacoes.length === 0 ? (
            <p className="text-gray-500 text-sm">Nenhuma transação encontrada.</p>
          ) : (
            <ul className="divide-y text-sm">
              {transacoes.map((t) => (
                <li key={t.id} className="py-3 flex justify-between items-center">
                  <div>
                    <p className="font-medium">{t.descricao || '(Sem descrição)'}</p>
                    <p className="text-gray-500 text-xs">
                      {new Date(t.data?.toDate?.() || t.data).toLocaleDateString('pt-BR')}
                      {t.categoria && ` - ${t.categoria}`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={t.tipo === 'entrada' ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                      {t.tipo === 'entrada' ? '+' : '-'} R$ {t.valor.toFixed(2)}
                    </p>
                    <button
                      onClick={() => handleExcluir(t.id)}
                      className="text-red-500 hover:underline text-xs mt-1"
                    >
                      Excluir
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

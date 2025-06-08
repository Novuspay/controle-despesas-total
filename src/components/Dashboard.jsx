// src/components/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { collection, query, where, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { format } from 'date-fns';

function Dashboard() {
  const [transacoes, setTransacoes] = useState([]);
  const [entradaTotal, setEntradaTotal] = useState(0);
  const [saidaTotal, setSaidaTotal] = useState(0);
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [filtroCategoria, setFiltroCategoria] = useState('todas');
  const [filtroMes, setFiltroMes] = useState('todos');

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

  const transacoesFiltradas = transacoes.filter((t) => {
    const tipoOk = filtroTipo === 'todos' || t.tipo === filtroTipo;
    const categoriaOk = filtroCategoria === 'todas' || t.categoria === filtroCategoria;
    const mesOk = filtroMes === 'todos' ||
      new Date(t.data?.toDate?.() || t.data).getMonth() === Number(filtroMes);
    return tipoOk && categoriaOk && mesOk;
  });

  const categoriasUnicas = [...new Set(transacoes.map(t => t.categoria))];

  return (
    <div className="min-h-screen bg-gradient-to-tr from-slate-800 via-indigo-900 to-slate-700 text-gray-800 p-6">
      <h1 className="text-2xl sm:text-3xl font-bold text-center text-white mb-8">
        <span role="img" aria-label="money">💰</span> Controle de Gastos
        <p className="text-sm font-normal text-indigo-200 mt-1">Controle cada real que entra e sai</p>
      </h1>

      {/* Resumo Financeiro */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <p className="text-sm text-gray-500 font-medium flex items-center justify-center gap-1">
            <span className="text-green-500">🟢</span> Total de Entradas
          </p>
          <p className="text-xl text-green-600 font-bold">R$ {entradaTotal.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <p className="text-sm text-gray-500 font-medium flex items-center justify-center gap-1">
            <span className="text-red-500">🔴</span> Total de Saídas
          </p>
          <p className="text-xl text-red-600 font-bold">R$ {saidaTotal.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <p className="text-sm text-gray-500 font-medium flex items-center justify-center gap-1">
            <span className="text-blue-500">🔵</span> Saldo Atual
          </p>
          <p className="text-xl text-emerald-600 font-bold">R$ {saldo.toFixed(2)}</p>
        </div>
      </div>

      {/* Área de Transações */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-bold text-indigo-600 mb-4 flex items-center gap-2">
            ➕ Nova Transação
          </h2>
          <button
            onClick={() => window.location.href = '/nova'}
            className="bg-indigo-500 hover:bg-indigo-600 text-white w-full rounded-lg py-2 font-medium transition"
          >
            Ir para o Formulário
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-bold text-red-600 mb-4 flex items-center gap-2">
            📄 Transações
          </h2>

          <div className="flex flex-wrap gap-2 mb-4">
            <select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)} className="border rounded p-1 text-sm">
              <option value="todos">Todos os tipos</option>
              <option value="entrada">Entradas</option>
              <option value="saida">Saídas</option>
            </select>
            <select value={filtroCategoria} onChange={(e) => setFiltroCategoria(e.target.value)} className="border rounded p-1 text-sm">
              <option value="todas">Todas as categorias</option>
              {categoriasUnicas.map((c, i) => (
                <option key={i} value={c}>{c}</option>
              ))}
            </select>
            <select value={filtroMes} onChange={(e) => setFiltroMes(e.target.value)} className="border rounded p-1 text-sm">
              <option value="todos">Todos os meses</option>
              {[...Array(12).keys()].map((m) => (
                <option key={m} value={m}>{format(new Date(2025, m, 1), 'MMMM')}</option>
              ))}
            </select>
          </div>

          {transacoesFiltradas.length === 0 ? (
            <p className="text-gray-500 text-sm">Nenhuma transação encontrada.</p>
          ) : (
            <ul className="divide-y text-sm">
              {transacoesFiltradas.map((t) => (
                <li key={t.id} className="py-3 flex justify-between items-center">
                  <div>
                    <p className="font-medium">{t.descricao || '(Sem descrição)'}</p>
                    <p className="text-gray-500">
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

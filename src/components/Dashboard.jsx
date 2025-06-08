import React, { useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import {
  collection,
  query,
  where,
  onSnapshot,
  deleteDoc,
  doc,
  getDocs
} from 'firebase/firestore';

function Dashboard() {
  const [transacoes, setTransacoes] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [entradaTotal, setEntradaTotal] = useState(0);
  const [saidaTotal, setSaidaTotal] = useState(0);
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [filtroCategoria, setFiltroCategoria] = useState('todas');
  const [filtroMes, setFiltroMes] = useState('todos');
  const [novaTransacao, setNovaTransacao] = useState({ tipo: '', descricao: '', categoria: '', valor: '', data: '' });

  const usuario = auth.currentUser;
  const saldo = entradaTotal - saidaTotal;

  useEffect(() => {
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
  }, [usuario]);

  useEffect(() => {
    if (!usuario) return;

    const carregarCategorias = async () => {
      const snap = await getDocs(query(collection(db, 'categorias'), where('uid', '==', usuario.uid)));
      const lista = snap.docs.map((doc) => doc.data().nome);
      setCategorias(lista);
    };

    carregarCategorias();
  }, [usuario]);

  const handleExcluir = async (id) => {
    try {
      await deleteDoc(doc(db, 'transacoes', id));
    } catch (error) {
      console.error('Erro ao excluir:', error);
    }
  };

  const handleAdicionar = async () => {
    // lógica para adicionar nova transação
  };

  const transacoesFiltradas = transacoes.filter((t) => {
    const data = new Date(t.data?.toDate?.() || t.data);
    const mes = (data.getMonth() + 1).toString().padStart(2, '0');

    return (
      (filtroTipo === 'todos' || t.tipo === filtroTipo) &&
      (filtroCategoria === 'todas' || t.categoria === filtroCategoria) &&
      (filtroMes === 'todos' || data.toISOString().slice(5, 7) === filtroMes)
    );
  });

  return (
    <div className="min-h-screen bg-gradient-to-tr from-slate-800 via-indigo-900 to-slate-700 text-gray-800 p-6">
      <h1 className="text-2xl sm:text-3xl font-bold text-center text-white mb-2">💰 Controle de Gastos</h1>
      <p className="text-center text-white text-sm mb-6">Controle cada real que entra e sai</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <p className="text-sm text-gray-500">🟢 Total de Entradas</p>
          <p className="text-xl text-green-600 font-bold">R$ {entradaTotal.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <p className="text-sm text-gray-500">🔴 Total de Saídas</p>
          <p className="text-xl text-red-600 font-bold">R$ {saidaTotal.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <p className="text-sm text-gray-500">🔵 Saldo Atual</p>
          <p className="text-xl text-emerald-600 font-bold">R$ {saldo.toFixed(2)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-bold text-indigo-600 mb-4">➕ Nova Transação</h2>
          <select className="w-full mb-2 border p-2 rounded" value={novaTransacao.tipo} onChange={(e) => setNovaTransacao({ ...novaTransacao, tipo: e.target.value })}>
            <option value="">Selecione o tipo</option>
            <option value="entrada">Entrada</option>
            <option value="saida">Saída</option>
          </select>
          <input className="w-full mb-2 border p-2 rounded" placeholder="Descrição" value={novaTransacao.descricao} onChange={(e) => setNovaTransacao({ ...novaTransacao, descricao: e.target.value })} />
          <select className="w-full mb-2 border p-2 rounded" value={novaTransacao.categoria} onChange={(e) => setNovaTransacao({ ...novaTransacao, categoria: e.target.value })}>
            <option value="">Selecione a categoria</option>
            {categorias.map((cat, idx) => (
              <option key={idx} value={cat}>{cat}</option>
            ))}
          </select>
          <input className="w-full mb-2 border p-2 rounded" placeholder="Valor (R$)" value={novaTransacao.valor} onChange={(e) => setNovaTransacao({ ...novaTransacao, valor: e.target.value })} />
          <input className="w-full mb-4 border p-2 rounded" placeholder="Data" value={novaTransacao.data} onChange={(e) => setNovaTransacao({ ...novaTransacao, data: e.target.value })} />
          <button className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded font-medium" onClick={handleAdicionar}>
            Adicionar Transação
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-bold text-red-600 mb-4">📄 Transações</h2>
          <div className="flex gap-2 mb-4">
            <select className="w-1/3 border p-2 rounded" value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)}>
              <option value="todos">Todos os tipos</option>
              <option value="entrada">Entradas</option>
              <option value="saida">Saídas</option>
            </select>
            <select className="w-1/3 border p-2 rounded" value={filtroCategoria} onChange={(e) => setFiltroCategoria(e.target.value)}>
              <option value="todas">Todas as categorias</option>
              {categorias.map((cat, idx) => (
                <option key={idx} value={cat}>{cat}</option>
              ))}
            </select>
            <select className="w-1/3 border p-2 rounded" value={filtroMes} onChange={(e) => setFiltroMes(e.target.value)}>
              <option value="todos">Todos os meses</option>
              {[...Array(12)].map((_, i) => {
                const m = (i + 1).toString().padStart(2, '0');
                return <option key={m} value={m}>{m}</option>;
              })}
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
                    <button onClick={() => handleExcluir(t.id)} className="text-red-500 hover:underline text-xs mt-1">Excluir</button>
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

// src/components/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  getDocs
} from 'firebase/firestore';

function Dashboard() {
  const [transacoes, setTransacoes] = useState([]);
  const [entradaTotal, setEntradaTotal] = useState(0);
  const [saidaTotal, setSaidaTotal] = useState(0);
  const [tipo, setTipo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [categoria, setCategoria] = useState('');
  const [valor, setValor] = useState('');
  const [data, setData] = useState('');
  const [categorias, setCategorias] = useState([]);
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [filtroMes, setFiltroMes] = useState('');

  const usuario = auth.currentUser;

  useEffect(() => {
    if (!usuario) return;

    const transacoesQuery = query(collection(db, 'transacoes'), where('uid', '==', usuario.uid));
    const unsubscribe = onSnapshot(transacoesQuery, (snapshot) => {
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
    if (!usuario || !tipo) return;

    const categoriasQuery = query(
      collection(db, 'categorias'),
      where('uid', '==', usuario.uid),
      where('tipo', '==', tipo)
    );

    onSnapshot(categoriasQuery, (snapshot) => {
      const lista = snapshot.docs.map((doc) => doc.data().nome);
      setCategorias(lista);
    });
  }, [usuario, tipo]);

  const handleNovaTransacao = async () => {
    if (!tipo || !descricao || !categoria || !valor || !data) return;

    await addDoc(collection(db, 'transacoes'), {
      uid: usuario.uid,
      tipo,
      descricao,
      categoria,
      valor: parseFloat(valor),
      data: new Date(data)
    });

    setTipo('');
    setDescricao('');
    setCategoria('');
    setValor('');
    setData('');
  };

  const handleExcluir = async (id) => {
    await deleteDoc(doc(db, 'transacoes', id));
  };

  const saldo = entradaTotal - saidaTotal;

  const transacoesFiltradas = transacoes.filter((t) => {
    return (
      (!filtroTipo || t.tipo === filtroTipo) &&
      (!filtroCategoria || t.categoria === filtroCategoria) &&
      (!filtroMes || new Date(t.data).getMonth() + 1 === parseInt(filtroMes))
    );
  });

  return (
    <div className="min-h-screen bg-gradient-to-tr from-slate-800 via-indigo-900 to-slate-700 text-gray-800 p-6">
      <h1 className="text-2xl sm:text-3xl font-bold text-center text-white mb-2">
        <span role="img">💰</span> Controle de Gastos
      </h1>
      <p className="text-center text-sm text-white mb-8">Controle cada real que entra e sai</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-bold text-indigo-600 mb-4 flex items-center gap-2">➕ Nova Transação</h2>

          <select
            className="w-full mb-3 p-2 border rounded"
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
          >
            <option value="">Selecione o tipo</option>
            <option value="entrada">Entrada</option>
            <option value="saida">Saída</option>
          </select>

          <input
            className="w-full mb-3 p-2 border rounded"
            type="text"
            placeholder="Ex: Salário, Alimentação, etc."
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
          />

          <select
            className="w-full mb-3 p-2 border rounded"
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
          >
            <option value="">Selecione a categoria</option>
            {categorias.map((cat, i) => (
              <option key={i} value={cat}>{cat}</option>
            ))}
          </select>

          <input
            className="w-full mb-3 p-2 border rounded"
            type="number"
            placeholder="Valor"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
          />

          <input
            className="w-full mb-3 p-2 border rounded"
            type="date"
            value={data}
            onChange={(e) => setData(e.target.value)}
          />

          <button
            onClick={handleNovaTransacao}
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
          >
            Adicionar Transação
          </button>

          <div className="bg-gray-100 rounded mt-6 p-3 text-center">
            <p className="text-sm text-gray-500">Transações</p>
            <p className="text-xl font-semibold">{transacoesFiltradas.length}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-bold text-red-600 mb-4 flex items-center gap-2">📄 Transações</h2>

          <div className="flex gap-2 mb-4 text-sm">
            <select className="border p-1 rounded" value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)}>
              <option value="">Todos os tipos</option>
              <option value="entrada">Entrada</option>
              <option value="saida">Saída</option>
            </select>
            <select className="border p-1 rounded" value={filtroCategoria} onChange={(e) => setFiltroCategoria(e.target.value)}>
              <option value="">Todas as categorias</option>
              {[...new Set(transacoes.map((t) => t.categoria))].map((cat, i) => (
                <option key={i} value={cat}>{cat}</option>
              ))}
            </select>
            <select className="border p-1 rounded" value={filtroMes} onChange={(e) => setFiltroMes(e.target.value)}>
              <option value="">Todos os meses</option>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((mes) => (
                <option key={mes} value={mes}>{String(mes).padStart(2, '0')}</option>
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
                    <p className="font-medium">{t.descricao}</p>
                    <p className="text-gray-500">{new Date(t.data).toLocaleDateString('pt-BR')} - {t.categoria}</p>
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

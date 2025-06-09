// src/components/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import {
  collection,
  query,
  where,
  onSnapshot,
  deleteDoc,
  doc,
  addDoc,
  getDocs
} from 'firebase/firestore';

function Dashboard() {
  const [transacoes, setTransacoes] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [tipo, setTipo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [categoria, setCategoria] = useState('');
  const [valor, setValor] = useState('');
  const [data, setData] = useState('');
  const [entradaTotal, setEntradaTotal] = useState(0);
  const [saidaTotal, setSaidaTotal] = useState(0);
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [filtroCategoria, setFiltroCategoria] = useState('todas');
  const [filtroMes, setFiltroMes] = useState('todos');

  const usuario = auth.currentUser;

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
    const q = query(collection(db, 'categorias'), where('uid', '==', usuario.uid));
    getDocs(q).then((snapshot) => {
      const lista = snapshot.docs.map((doc) => doc.data().nome);
      setCategorias(lista);
    });
  }, [usuario]);

  const handleExcluir = async (id) => {
    try {
      await deleteDoc(doc(db, 'transacoes', id));
    } catch (error) {
      console.error('Erro ao excluir:', error);
    }
  };

  const handleAdicionar = async () => {
    if (!tipo || !descricao || !categoria || !valor || !data) return;

    try {
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
    } catch (error) {
      console.error('Erro ao adicionar:', error);
    }
  };

  const saldo = entradaTotal - saidaTotal;
  const transacoesFiltradas = transacoes.filter((t) => {
    const tipoOk = filtroTipo === 'todos' || t.tipo === filtroTipo;
    const catOk = filtroCategoria === 'todas' || t.categoria === filtroCategoria;
    const dataObj = new Date(t.data.seconds * 1000);
    const mesOk = filtroMes === 'todos' || dataObj.getMonth() + 1 === parseInt(filtroMes);
    return tipoOk && catOk && mesOk;
  });

  return (
    <div className="min-h-screen bg-gradient-to-tr from-slate-800 via-indigo-900 to-slate-700 text-gray-800 p-6">
      <h1 className="text-2xl sm:text-3xl font-bold text-center text-white mb-2">
        <span role="img">💰</span> Controle de Gastos
      </h1>
      <p className="text-center text-sm text-white mb-6">Controle cada real que entra e sai</p>

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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-bold text-indigo-600 mb-4 flex items-center gap-2">➕ Nova Transação</h2>
          <select value={tipo} onChange={(e) => setTipo(e.target.value)} className="mb-2 w-full border rounded p-2">
            <option value="">Selecione o tipo</option>
            <option value="entrada">Entrada</option>
            <option value="saida">Saída</option>
          </select>
          <input value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="Ex: Salário, Alimentação, etc." className="mb-2 w-full border rounded p-2" />
          <select value={categoria} onChange={(e) => setCategoria(e.target.value)} className="mb-2 w-full border rounded p-2">
            <option value="">Selecione a categoria</option>
            {categorias.map((cat, idx) => (
              <option key={idx} value={cat}>{cat}</option>
            ))}
          </select>
          <input type="number" value={valor} onChange={(e) => setValor(e.target.value)} placeholder="Valor (R$)" className="mb-2 w-full border rounded p-2" />
          <input type="date" value={data} onChange={(e) => setData(e.target.value)} className="mb-4 w-full border rounded p-2" />
          <button onClick={handleAdicionar} className="w-full bg-blue-500 text-white py-2 rounded">Adicionar Transação</button>
          <div className="text-center mt-4 bg-gray-100 p-2 rounded text-sm">
            <p className="font-medium text-gray-600">Transações</p>
            <p className="text-xl font-bold">{transacoes.length}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-bold text-red-600 mb-4 flex items-center gap-2">📄 Transações</h2>
          <div className="flex gap-2 mb-4">
            <select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)} className="border rounded p-2 text-sm">
              <option value="todos">Todos os tipos</option>
              <option value="entrada">Entradas</option>
              <option value="saida">Saídas</option>
            </select>
            <select value={filtroCategoria} onChange={(e) => setFiltroCategoria(e.target.value)} className="border rounded p-2 text-sm">
              <option value="todas">Todas as categorias</option>
              {categorias.map((cat, idx) => (
                <option key={idx} value={cat}>{cat}</option>
              ))}
            </select>
            <select value={filtroMes} onChange={(e) => setFiltroMes(e.target.value)} className="border rounded p-2 text-sm">
              <option value="todos">Todos os meses</option>
              {[...Array(12).keys()].map(m => <option key={m + 1} value={m + 1}>{(m + 1).toString().padStart(2, '0')}</option>)}
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
                      {new Date(t.data.seconds * 1000).toLocaleDateString('pt-BR')}
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

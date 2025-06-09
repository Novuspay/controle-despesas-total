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
  getDocs,
  orderBy,
  Timestamp,
} from 'firebase/firestore';

function Dashboard() {
  const [transacoes, setTransacoes] = useState([]);
  const [entradaTotal, setEntradaTotal] = useState(0);
  const [saidaTotal, setSaidaTotal] = useState(0);
  const [tipo, setTipo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [data, setData] = useState('');
  const [categoria, setCategoria] = useState('');
  const [categorias, setCategorias] = useState([]);
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [filtroMes, setFiltroMes] = useState('');

  const usuario = auth.currentUser;

  useEffect(() => {
    if (!usuario) return;

    const q = query(collection(db, 'transacoes'), where('uid', '==', usuario.uid), orderBy('data', 'desc'));
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
    if (!tipo || !descricao || !valor || !data || !categoria) return;
    try {
      await addDoc(collection(db, 'transacoes'), {
        uid: usuario.uid,
        tipo,
        descricao,
        valor: parseFloat(valor),
        data: Timestamp.fromDate(new Date(data)),
        categoria,
      });
      setTipo('');
      setDescricao('');
      setValor('');
      setData('');
      setCategoria('');
    } catch (error) {
      console.error('Erro ao adicionar transação:', error);
    }
  };

  const saldo = entradaTotal - saidaTotal;

  const transacoesFiltradas = transacoes.filter((t) => {
    const tipoOk = !filtroTipo || t.tipo === filtroTipo;
    const catOk = !filtroCategoria || t.categoria === filtroCategoria;
    const mesOk = !filtroMes || new Date(t.data.toDate()).getMonth() + 1 === parseInt(filtroMes);
    return tipoOk && catOk && mesOk;
  });

  const totalMes = transacoes.filter((t) => {
    const d = new Date(t.data.toDate());
    const hoje = new Date();
    return d.getMonth() === hoje.getMonth() && d.getFullYear() === hoje.getFullYear();
  }).length;

  return (
    <div className="min-h-screen bg-gradient-to-tr from-slate-800 via-indigo-900 to-slate-700 text-gray-800 p-6">
      <h1 className="text-2xl sm:text-3xl font-bold text-center text-white mb-2">
        <span role="img">💰</span> Controle de Gastos
      </h1>
      <p className="text-center text-white mb-8 text-sm">Controle cada real que entra e sai</p>

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
          <div className="space-y-3">
            <select className="w-full border rounded px-3 py-2" value={tipo} onChange={(e) => setTipo(e.target.value)}>
              <option value="">Selecione o tipo</option>
              <option value="entrada">Entrada</option>
              <option value="saida">Saída</option>
            </select>
            <input type="text" className="w-full border rounded px-3 py-2" placeholder="Ex: Salário, Alimentação, etc." value={descricao} onChange={(e) => setDescricao(e.target.value)} />
            <select className="w-full border rounded px-3 py-2" value={categoria} onChange={(e) => setCategoria(e.target.value)}>
              <option value="">Selecione a categoria</option>
              {categorias.map((c, idx) => (
                <option key={idx} value={c}>{c}</option>
              ))}
            </select>
            <input type="number" className="w-full border rounded px-3 py-2" placeholder="Valor" value={valor} onChange={(e) => setValor(e.target.value)} />
            <input type="date" className="w-full border rounded px-3 py-2" value={data} onChange={(e) => setData(e.target.value)} />
            <button className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded" onClick={handleAdicionar}>Adicionar Transação</button>
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="bg-gray-100 text-center p-3 rounded">
                <p className="text-sm text-gray-600">Transações</p>
                <p className="font-bold text-xl">{totalMes}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-bold text-red-600 mb-4 flex items-center gap-2">📄 Transações</h2>
          <div className="flex flex-col sm:flex-row gap-2 mb-4">
            <select className="border rounded px-2 py-1" value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)}>
              <option value="">Todos os tipos</option>
              <option value="entrada">Entradas</option>
              <option value="saida">Saídas</option>
            </select>
            <select className="border rounded px-2 py-1" value={filtroCategoria} onChange={(e) => setFiltroCategoria(e.target.value)}>
              <option value="">Todas as categorias</option>
              {categorias.map((c, idx) => (
                <option key={idx} value={c}>{c}</option>
              ))}
            </select>
            <select className="border rounded px-2 py-1" value={filtroMes} onChange={(e) => setFiltroMes(e.target.value)}>
              <option value="">Todos os meses</option>
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>{(i + 1).toString().padStart(2, '0')}</option>
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
                      {new Date(t.data.toDate()).toLocaleDateString('pt-BR')} {t.categoria && `- ${t.categoria}`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={t.tipo === 'entrada' ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                      {t.tipo === 'entrada' ? '+' : '-'} R$ {t.valor.toFixed(2)}
                    </p>
                    <button onClick={() => handleExcluir(t.id)} className="text-red-500 hover:underline text-xs mt-1">
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

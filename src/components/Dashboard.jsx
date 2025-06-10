import React, { useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import {
  collection,
  query,
  where,
  onSnapshot,
  deleteDoc,
  doc,
  addDoc
} from 'firebase/firestore';
import categoriasFixas from '../categoriasFixas';

function Dashboard() {
  const [transacoes, setTransacoes] = useState([]);
  const [entradaTotal, setEntradaTotal] = useState(0);
  const [saidaTotal, setSaidaTotal] = useState(0);
  const [tipo, setTipo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [categoria, setCategoria] = useState('');
  const [valor, setValor] = useState('');
  const [data, setData] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [filtroMes, setFiltroMes] = useState('');

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

  const handleAdicionar = async () => {
    const usuario = auth.currentUser;
    if (!usuario || !tipo || !descricao || !valor || !data || !categoria) {
      alert('Preencha todos os campos.');
      return;
    }

    const nova = {
      tipo,
      descricao,
      categoria,
      valor: parseFloat(valor),
      data: new Date(data + 'T00:00:00'),
      uid: usuario.uid
    };

    try {
      await addDoc(collection(db, 'transacoes'), nova);
      setTipo('');
      setDescricao('');
      setCategoria('');
      setValor('');
      setData('');
    } catch (error) {
      console.error('Erro ao adicionar transação:', error);
    }
  };

  const saldo = entradaTotal - saidaTotal;

  const transacoesFiltradas = transacoes.filter((t) => {
    const mesTransacao = new Date(t.data?.toDate?.() || t.data).getMonth() + 1;
    const anoTransacao = new Date(t.data?.toDate?.() || t.data).getFullYear();
    const hoje = new Date();

    const condTipo = !filtroTipo || t.tipo === filtroTipo;
    const condCategoria = !filtroCategoria || t.categoria === filtroCategoria;
    const condMes =
      !filtroMes || (parseInt(filtroMes) === mesTransacao && anoTransacao === hoje.getFullYear());

    return condTipo && condCategoria && condMes;
  });

  const totalMes = transacoesFiltradas.reduce((acc, t) => acc + t.valor, 0);
  const categoriasFiltradas = categoriasFixas.filter((cat) => cat.tipo === tipo);

  return (
    <div className="min-h-screen bg-gradient-to-tr from-slate-800 via-indigo-900 to-slate-700 text-white p-4 sm:p-6">
      <header className="text-center mb-6">
        <h1 className="text-3xl font-bold">💰 Controle de Gastos</h1>
        <p className="text-sm text-slate-300">Gerencie sua vida financeira de forma prática</p>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white bg-opacity-10 p-4 rounded-xl shadow text-center">
          <p className="text-sm text-green-300">🟢 Entradas</p>
          <p className="text-2xl font-bold text-green-400">R$ {entradaTotal.toFixed(2)}</p>
        </div>
        <div className="bg-white bg-opacity-10 p-4 rounded-xl shadow text-center">
          <p className="text-sm text-red-300">🔴 Saídas</p>
          <p className="text-2xl font-bold text-red-400">R$ {saidaTotal.toFixed(2)}</p>
        </div>
        <div className="bg-white bg-opacity-10 p-4 rounded-xl shadow text-center">
          <p className="text-sm text-blue-300">🔵 Saldo</p>
          <p className="text-2xl font-bold text-emerald-300">R$ {saldo.toFixed(2)}</p>
        </div>
      </section>

      <section className="grid md:grid-cols-2 gap-6">
        <div className="bg-white bg-opacity-10 p-6 rounded-xl">
          <h2 className="text-xl font-semibold text-indigo-300 mb-4">➕ Nova Transação</h2>

          <div className="space-y-2">
            <select value={tipo} onChange={(e) => setTipo(e.target.value)} className="w-full p-2 rounded bg-slate-100 text-black">
              <option value="">Tipo</option>
              <option value="entrada">Entrada</option>
              <option value="saida">Saída</option>
            </select>

            <input type="text" placeholder="Descrição" value={descricao} onChange={(e) => setDescricao(e.target.value)} className="w-full p-2 rounded bg-slate-100 text-black" />

            <select value={categoria} onChange={(e) => setCategoria(e.target.value)} className="w-full p-2 rounded bg-slate-100 text-black">
              <option value="">Categoria</option>
              {categoriasFiltradas.map((cat, i) => (
                <option key={i} value={cat.nome}>{cat.nome}</option>
              ))}
            </select>

            <input type="number" placeholder="Valor" value={valor} onChange={(e) => setValor(e.target.value)} className="w-full p-2 rounded bg-slate-100 text-black" />

            <input type="date" value={data} onChange={(e) => setData(e.target.value)} className="w-full p-2 rounded bg-slate-100 text-black" />

            <button onClick={handleAdicionar} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-semibold">
              Adicionar
            </button>
          </div>
        </div>

        <div className="bg-white bg-opacity-10 p-6 rounded-xl">
          <h2 className="text-xl font-semibold text-red-300 mb-4">📄 Histórico</h2>

          <div className="flex flex-wrap gap-2 mb-4">
            <select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)} className="p-1 rounded text-black">
              <option value="">Tipo</option>
              <option value="entrada">Entrada</option>
              <option value="saida">Saída</option>
            </select>

            <select value={filtroCategoria} onChange={(e) => setFiltroCategoria(e.target.value)} className="p-1 rounded text-black">
              <option value="">Categoria</option>
              {categoriasFixas.map((cat, i) => (
                <option key={i} value={cat.nome}>{cat.nome}</option>
              ))}
            </select>

            <select value={filtroMes} onChange={(e) => setFiltroMes(e.target.value)} className="p-1 rounded text-black">
              <option value="">Mês</option>
              {[...Array(12)].map((_, i) => (
                <option key={i + 1} value={i + 1}>{i + 1}</option>
              ))}
            </select>
          </div>

          {transacoesFiltradas.length === 0 ? (
            <p className="text-slate-300 text-sm">Nenhuma transação encontrada.</p>
          ) : (
            <ul className="space-y-2">
              {transacoesFiltradas.map((t) => (
                <li key={t.id} className="flex justify-between bg-white bg-opacity-10 rounded p-2">
                  <div>
                    <p className="font-semibold">{t.descricao || '(Sem descrição)'}</p>
                    <p className="text-sm text-slate-300">
                      {new Date(t.data?.toDate?.() || t.data).toLocaleDateString('pt-BR')} - {t.categoria}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={t.tipo === 'entrada' ? 'text-green-400 font-semibold' : 'text-red-400 font-semibold'}>
                      {t.tipo === 'entrada' ? '+' : '-'} R$ {t.valor.toFixed(2)}
                    </p>
                    <button
                      onClick={() => handleExcluir(t.id)}
                      className="text-red-300 text-xs hover:underline"
                    >Excluir</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}

export default Dashboard;

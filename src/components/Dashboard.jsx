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
  const [saldosPorMes, setSaldosPorMes] = useState([]);

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

      const saldos = Array(12).fill(0);
      lista.forEach(t => {
        const d = new Date(t.data?.toDate?.() || t.data);
        const mes = d.getMonth();
        saldos[mes] += t.tipo === 'entrada' ? t.valor : -t.valor;
      });
      setSaldosPorMes(saldos);
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
    if (!usuario || !tipo || !descricao || !valor || !data || !categoria) return;

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

  const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

  return (
    <div className="min-h-screen bg-gradient-to-tr from-slate-800 via-indigo-900 to-slate-700 text-white p-6">
      <h1 className="text-3xl font-bold text-center mb-4">💰 Controle de Gastos</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white text-black rounded shadow p-4 text-center">
          <p className="text-sm text-gray-500">🟢 Entradas</p>
          <p className="text-xl font-bold text-green-600">R$ {entradaTotal.toFixed(2)}</p>
        </div>
        <div className="bg-white text-black rounded shadow p-4 text-center">
          <p className="text-sm text-gray-500">🔴 Saídas</p>
          <p className="text-xl font-bold text-red-600">R$ {saidaTotal.toFixed(2)}</p>
        </div>
        <div className="bg-white text-black rounded shadow p-4 text-center">
          <p className="text-sm text-gray-500">🔵 Saldo</p>
          <p className="text-xl font-bold text-blue-600">R$ {saldo.toFixed(2)}</p>
        </div>
      </div>

      {/* SVG Bar Chart */}
      <div className="bg-white rounded shadow p-4 mb-6">
        <h2 className="text-lg font-bold text-black mb-4">📊 Saldo Mensal</h2>
        <svg viewBox="0 0 600 200" className="w-full h-40">
          {saldosPorMes.map((valor, i) => {
            const height = Math.abs(valor) * 2;
            const x = i * 50 + 20;
            const y = valor >= 0 ? 100 - height : 100;
            return (
              <g key={i}>
                <rect x={x} y={y} width="30" height={height} fill={valor >= 0 ? '#4ade80' : '#f87171'} />
                <text x={x + 15} y={115} textAnchor="middle" fontSize="10" fill="#000">{meses[i]}</text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Aqui continuam os campos de nova transação e lista como antes... */}
      {/* Você pode manter os inputs e lista que já estavam funcionando aqui, mantendo os handlers e filtros */}
    </div>
  );
}

export default Dashboard;

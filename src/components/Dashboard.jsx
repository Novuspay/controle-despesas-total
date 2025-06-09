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

  const categoriasAgrupadas = transacoesFiltradas.reduce((acc, t) => {
    if (!acc[t.categoria]) acc[t.categoria] = 0;
    acc[t.categoria] += t.valor;
    return acc;
  }, {});

  const cores = ['#10b981', '#ef4444', '#3b82f6', '#f59e0b', '#6366f1', '#14b8a6', '#8b5cf6', '#ec4899'];
  const categoriasKeys = Object.keys(categoriasAgrupadas);
  const totalValores = Object.values(categoriasAgrupadas).reduce((a, b) => a + b, 0);

  let anguloInicial = 0;
  const fatias = categoriasKeys.map((categoria, i) => {
    const valor = categoriasAgrupadas[categoria];
    const angulo = (valor / totalValores) * 2 * Math.PI;
    const x1 = 100 + 100 * Math.cos(anguloInicial);
    const y1 = 100 + 100 * Math.sin(anguloInicial);
    anguloInicial += angulo;
    const x2 = 100 + 100 * Math.cos(anguloInicial);
    const y2 = 100 + 100 * Math.sin(anguloInicial);
    const grande = angulo > Math.PI ? 1 : 0;
    return (
      <path
        key={i}
        d={`M100,100 L${x1},${y1} A100,100 0 ${grande},1 ${x2},${y2} Z`}
        fill={cores[i % cores.length]}
      />
    );
  });

  return (
    <div className="min-h-screen bg-gradient-to-tr from-slate-800 via-indigo-900 to-slate-700 text-gray-800 p-6">
      <h1 className="text-2xl sm:text-3xl font-bold text-center text-white mb-2">
        <span role="img" aria-label="money">💰</span> Controle de Gastos
      </h1>
      <p className="text-center text-sm text-white mb-6">Controle cada real que entra e sai</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <p className="text-sm text-gray-500 font-medium">🟢 Entradas</p>
          <p className="text-xl text-green-600 font-bold">R$ {entradaTotal.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <p className="text-sm text-gray-500 font-medium">🔴 Saídas</p>
          <p className="text-xl text-red-600 font-bold">R$ {saidaTotal.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <p className="text-sm text-gray-500 font-medium">🔵 Saldo</p>
          <p className="text-xl text-emerald-600 font-bold">R$ {saldo.toFixed(2)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-4 flex justify-center items-center">
          <svg width="200" height="200" viewBox="0 0 200 200">
            {fatias}
          </svg>
        </div>
        <div className="md:col-span-2">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-indigo-600 mb-4">➕ Nova Transação</h2>
            {/* ...campos e botão... */}
          </div>
        </div>
      </div>
      {/* ...continuação com lista de transações... */}
    </div>
  );
}

export default Dashboard;

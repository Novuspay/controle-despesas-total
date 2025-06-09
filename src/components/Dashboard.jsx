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

  // Dados para o gráfico SVG
  const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const dadosMensais = Array(12).fill(0);

  transacoes.forEach((t) => {
    const dataTransacao = new Date(t.data?.toDate?.() || t.data);
    const mes = dataTransacao.getMonth();
    dadosMensais[mes] += t.tipo === 'entrada' ? t.valor : -t.valor;
  });

  const maxAbsValor = Math.max(...dadosMensais.map((v) => Math.abs(v)), 1);
  const alturaMax = 100;

  return (
    <div className="min-h-screen bg-gradient-to-tr from-slate-800 via-indigo-900 to-slate-700 text-gray-800 p-6">
      <h1 className="text-2xl sm:text-3xl font-bold text-center text-white mb-2">
        <span role="img" aria-label="money">💰</span> Controle de Gastos
      </h1>
      <p className="text-center text-sm text-white mb-6">Controle cada real que entra e sai</p>

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

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-bold text-indigo-600 mb-4">📊 Saldo Mensal (Gráfico)</h2>
        <svg width="100%" height="150">
          {dadosMensais.map((valor, i) => {
            const altura = Math.abs(valor) / maxAbsValor * alturaMax;
            const x = i * 30 + 10;
            const y = valor >= 0 ? alturaMax - altura : alturaMax;
            const cor = valor >= 0 ? '#16a34a' : '#dc2626';

            return (
              <g key={i}>
                <rect x={x} y={y} width="20" height={altura} fill={cor} />
                <text x={x + 10} y={alturaMax + 12} textAnchor="middle" fontSize="10" fill="#000">{meses[i]}</text>
                <text x={x + 10} y={y - 4} textAnchor="middle" fontSize="10" fill="#000">{valor.toFixed(0)}</text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        [...restante do código permanece igual...]
      </div>
    </div>
  );
}

export default Dashboard;

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

  const entradasPorMes = Array(12).fill(0);
  transacoes.forEach((t) => {
    const d = new Date(t.data?.toDate?.() || t.data);
    const mes = d.getMonth();
    if (t.tipo === 'entrada') entradasPorMes[mes] += t.valor;
  });

  return (
    <div className="min-h-screen bg-gradient-to-tr from-slate-800 via-indigo-900 to-slate-700 text-white p-6">
      <h1 className="text-3xl font-bold text-center mb-2">💰 Controle de Gastos</h1>
      <p className="text-center text-sm mb-6">Controle cada real que entra e sai</p>

      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white text-black rounded-lg shadow p-4 text-center">
          <p className="text-sm text-gray-500 font-medium">🟢 Total de Entradas</p>
          <p className="text-xl font-bold text-green-600">R$ {entradaTotal.toFixed(2)}</p>
        </div>
        <div className="bg-white text-black rounded-lg shadow p-4 text-center">
          <p className="text-sm text-gray-500 font-medium">🔴 Total de Saídas</p>
          <p className="text-xl font-bold text-red-600">R$ {saidaTotal.toFixed(2)}</p>
        </div>
        <div className="bg-white text-black rounded-lg shadow p-4 text-center">
          <p className="text-sm text-gray-500 font-medium">🔵 Saldo Atual</p>
          <p className="text-xl font-bold text-emerald-600">R$ {saldo.toFixed(2)}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-bold text-indigo-600 mb-4">📊 Gráfico Entradas Mês a Mês</h2>
        <svg width="100%" height="200">
          {entradasPorMes.map((valor, i) => {
            const altura = valor * 0.5;
            return (
              <g key={i} transform={`translate(${i * 30 + 20}, 180)`}>
                <rect width="20" height={-altura} fill="#6366f1" />
                <text x="10" y="15" fontSize="10" fill="#000" textAnchor="middle">{valor > 0 ? valor : ''}</text>
                <text x="10" y="30" fontSize="10" fill="#000" textAnchor="middle">
                  {['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'][i]}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* O restante do layout permanece igual (Nova Transação e Transações) */}
    </div>
  );
}

export default Dashboard;

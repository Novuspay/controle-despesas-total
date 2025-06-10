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
  const [hoveredCategoria, setHoveredCategoria] = useState(null);
  const [mesGrafico, setMesGrafico] = useState('atual');

  const getData = (d) => d?.toDate?.() ? d.toDate() : new Date(d);

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

  const hoje = new Date();
  const mesAtual = hoje.getMonth();
  const anoAtual = hoje.getFullYear();
  const mesSelecionado = mesGrafico === 'atual' ? mesAtual : (mesAtual === 0 ? 11 : mesAtual - 1);
  const anoSelecionado = mesGrafico === 'atual' ? anoAtual : (mesAtual === 0 ? anoAtual - 1 : anoAtual);

  const transacoesGrafico = transacoes.filter((t) => {
    const dataTransacao = getData(t.data);
    return (
      t.tipo === 'saida' &&
      dataTransacao.getMonth() === mesSelecionado &&
      dataTransacao.getFullYear() === anoSelecionado
    );
  });

  const despesasPorCategoria = transacoesGrafico.reduce((acc, t) => {
    acc[t.categoria] = (acc[t.categoria] || 0) + t.valor;
    return acc;
  }, {});

  const totalDespesas = Object.values(despesasPorCategoria).reduce((acc, val) => acc + val, 0);
  const cores = ["#f87171", "#fb923c", "#facc15", "#4ade80", "#60a5fa", "#a78bfa", "#f472b6", "#34d399"];
  const radius = 70;
  const cx = 80;
  const cy = 80;
  let acumulado = 0;
  const segmentos = Object.entries(despesasPorCategoria).map(([cat, val], i) => {
    const proporcao = val / totalDespesas;
    const dashArray = `${proporcao * 2 * Math.PI * radius} ${(1 - proporcao) * 2 * Math.PI * radius}`;
    const dashOffset = acumulado;
    acumulado += proporcao * 2 * Math.PI * radius;
    return { cat, val, dashArray, dashOffset, cor: cores[i % cores.length], proporcao };
  });

  return (
    <div className="min-h-screen bg-gradient-to-tr from-slate-800 via-indigo-900 to-slate-700 text-gray-800 p-6">
      <h1 className="text-2xl sm:text-3xl font-bold text-center text-white mb-2">
        <span role="img" aria-label="money">💰</span> Controle de Gastos
      </h1>
      <p className="text-center text-sm text-white mb-6">Controle cada real que entra e sai</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <p className="text-sm text-gray-500 font-medium">🟢 Total de Entradas</p>
          <p className="text-xl text-green-600 font-bold">R$ {entradaTotal.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <p className="text-sm text-gray-500 font-medium">🔴 Total de Saídas</p>
          <p className="text-xl text-red-600 font-bold">R$ {saidaTotal.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <p className="text-sm text-gray-500 font-medium">🔵 Saldo Atual</p>
          <p className="text-xl text-emerald-600 font-bold">R$ {saldo.toFixed(2)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6 md:col-span-2">
          <h2 className="text-lg font-bold text-indigo-600 mb-4">➕ Nova Transação</h2>
          <select value={tipo} onChange={(e) => setTipo(e.target.value)} className="w-full mb-2 border rounded px-3 py-2">
            <option value="">Selecione o tipo</option>
            <option value="entrada">Entrada</option>
            <option value="saida">Saída</option>
          </select>
          <input type="text" placeholder="Ex: Salário" value={descricao} onChange={(e) => setDescricao(e.target.value)} className="w-full mb-2 border rounded px-3 py-2" />
          <select value={categoria} onChange={(e) => setCategoria(e.target.value)} className="w-full mb-2 border rounded px-3 py-2">
            <option value="">Selecione a categoria</option>
            {categoriasFixas.filter((cat) => cat.tipo === tipo).map((cat, i) => (
              <option key={i} value={cat.nome}>{cat.nome}</option>
            ))}
          </select>
          <input type="number" placeholder="Valor" value={valor} onChange={(e) => setValor(e.target.value)} className="w-full mb-2 border rounded px-3 py-2" />
          <input type="date" value={data} onChange={(e) => setData(e.target.value)} className="w-full mb-4 border rounded px-3 py-2" />
          <button onClick={handleAdicionar} className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded font-semibold">
            Adicionar Transação
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-bold text-purple-700 mb-2">📊 Gastos por Categoria</h2>
          <button
            onClick={() => setMesGrafico(mesGrafico === 'atual' ? 'anterior' : 'atual')}
            className="mb-4 text-sm text-blue-600 underline hover:text-blue-800"
          >
            Visualizar {mesGrafico === 'atual' ? 'mês anterior' : 'mês atual'}
          </button>
          <div className="flex flex-col items-center">
            {totalDespesas === 0 ? (
              <p className="text-gray-500 mt-4">Sem dados de despesas para este mês.</p>
            ) : (
              <>
                <svg width="160" height="160" viewBox="0 0 160 160">
                  <circle cx={cx} cy={cy} r={radius} fill="none" stroke="#e5e7eb" strokeWidth="30" />
                  {segmentos.map((s, i) => (
                    <circle
                      key={i}
                      cx={cx}
                      cy={cy}
                      r={radius}
                      fill="none"
                      stroke={s.cor}
                      strokeWidth="30"
                      strokeDasharray={s.dashArray}
                      strokeDashoffset={-s.dashOffset}
                      transform="rotate(-90 80 80)"
                      onMouseEnter={() => setHoveredCategoria(s.cat)}
                      onMouseLeave={() => setHoveredCategoria(null)}
                    />
                  ))}
                </svg>
                <ul className="mt-4 space-y-1 text-sm">
                  {segmentos.map((s, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: s.cor }}></span>
                      <span>{s.cat} – {Math.round(s.proporcao * 100)}% (R$ {s.val.toFixed(2)})</span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

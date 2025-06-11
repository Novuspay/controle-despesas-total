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
  const [tipo, setTipo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [categoria, setCategoria] = useState('');
  const [valor, setValor] = useState('');
  const [data, setData] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [filtroMes, setFiltroMes] = useState('');
  const [mesGrafico, setMesGrafico] = useState(new Date().getMonth() + 1);
  const [hoveredCategoria, setHoveredCategoria] = useState(null);

  useEffect(() => {
    const usuario = auth.currentUser;
    if (!usuario) return;

    const q = query(collection(db, 'transacoes'), where('uid', '==', usuario.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const lista = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setTransacoes(lista);
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

  const hoje = new Date();
  const anoAtual = hoje.getFullYear();
  const transacoesDoMes = transacoes.filter((t) => {
    const d = new Date(t.data?.toDate?.() || t.data);
    return d.getMonth() + 1 === mesGrafico && d.getFullYear() === anoAtual;
  });

  const entradaTotal = transacoesDoMes.filter(t => t.tipo === 'entrada').reduce((acc, t) => acc + t.valor, 0);
  const saidaTotalCalc = transacoesDoMes.filter(t => t.tipo === 'saida').reduce((acc, t) => acc + t.valor, 0);
  const saldo = entradaTotal - saidaTotalCalc;

  const transacoesFiltradas = transacoesDoMes.filter((t) => {
    const mesTransacao = new Date(t.data?.toDate?.() || t.data).getMonth() + 1;
    const anoTransacao = new Date(t.data?.toDate?.() || t.data).getFullYear();
    const condTipo = !filtroTipo || t.tipo === filtroTipo;
    const condCategoria = !filtroCategoria || t.categoria === filtroCategoria;
    const condMes = !filtroMes || parseInt(filtroMes) === mesTransacao;
    return condTipo && condCategoria && condMes;
  });

  const categoriasFiltradas = categoriasFixas.filter((cat) => cat.tipo === tipo);

  const despesasPorCategoria = transacoesDoMes
    .filter((t) => t.tipo === 'saida')
    .reduce((acc, t) => {
      acc[t.categoria] = (acc[t.categoria] || 0) + t.valor;
      return acc;
    }, {});

  const totalDespesas = Object.values(despesasPorCategoria).reduce((acc, val) => acc + val, 0);
  const cores = ["#f87171", "#fb923c", "#facc15", "#4ade80", "#60a5fa", "#a78bfa", "#f472b6", "#34d399"];
  const radius = 70;
  const cx = 100;
  const cy = 100;
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
          <p className="text-xl text-red-600 font-bold">R$ {saidaTotalCalc.toFixed(2)}</p>
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
            {categoriasFiltradas.map((cat, i) => (
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
          <select value={mesGrafico} onChange={(e) => setMesGrafico(parseInt(e.target.value))} className="mb-4 border rounded px-2 py-1">
            {[...Array(12)].map((_, i) => (
              <option key={i + 1} value={i + 1}>{i + 1}º mês</option>
            ))}
          </select>
          <div className="flex flex-col items-center">
            <svg width="200" height="200" viewBox="0 0 200 200">
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
                  transform="rotate(-90 100 100)"
                  onMouseEnter={() => setHoveredCategoria(s.cat)}
                  onMouseLeave={() => setHoveredCategoria(null)}
                />
              ))}
            </svg>
            <ul className="mt-4 space-y-1 text-sm">
              {segmentos.map((s, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: s.cor }}></span>
                  <span>{s.cat} - {(s.proporcao * 100).toFixed(1)}% (R$ {s.val.toFixed(2)})</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mt-6">
        <h2 className="text-lg font-bold text-red-600 mb-4">📄 Transações</h2>
        <div className="flex gap-2 mb-4">
          <select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)} className="border rounded px-2 py-1">
            <option value="">Todos os tipos</option>
            <option value="entrada">Entrada</option>
            <option value="saida">Saída</option>
          </select>
          <select value={filtroCategoria} onChange={(e) => setFiltroCategoria(e.target.value)} className="border rounded px-2 py-1">
            <option value="">Todas as categorias</option>
            {categoriasFixas.map((cat, i) => (
              <option key={i} value={cat.nome}>{cat.nome}</option>
            ))}
          </select>
          <select value={filtroMes} onChange={(e) => setFiltroMes(e.target.value)} className="border rounded px-2 py-1">
            <option value="">Todos os meses</option>
            {[...Array(12)].map((_, i) => (
              <option key={i + 1} value={i + 1}>{i + 1}</option>
            ))}
          </select>
        </div>
        {transacoesFiltradas.length === 0 ? (
          <p className="text-gray-500 text-sm">Nenhuma transação encontrada.</p>
        ) : (
          <ul className="divide-y text-sm">
             {[...transacoesFiltradas]
              .sort((a, b) => new Date(b.data?.toDate?.() || b.data) - new Date(a.data?.toDate?.() || a.data))
              .map((t) => (
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
  );
}

export default Dashboard;

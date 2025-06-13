import React, { useEffect, useState, useRef } from 'react';
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
import html2pdf from 'html2pdf.js';

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
  const [filtroAno, setFiltroAno] = useState('');
  const [mesGrafico, setMesGrafico] = useState(new Date().getMonth() + 1);
  const [anoGrafico, setAnoGrafico] = useState(new Date().getFullYear());
  const [hoveredCategoria, setHoveredCategoria] = useState(null);
  const pdfRef = useRef();

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

  const transacoesGrafico = transacoes.filter((t) => {
    const d = new Date(t.data?.toDate?.() || t.data);
    return d.getMonth() + 1 === mesGrafico && d.getFullYear() === anoGrafico;
  });

  const entradaTotal = transacoesGrafico.filter(t => t.tipo === 'entrada').reduce((acc, t) => acc + t.valor, 0);
  const saidaTotalCalc = transacoesGrafico.filter(t => t.tipo === 'saida').reduce((acc, t) => acc + t.valor, 0);
  const saldo = entradaTotal - saidaTotalCalc;

  const transacoesFiltradas = transacoes.filter((t) => {
    const d = new Date(t.data?.toDate?.() || t.data);
    const mesTransacao = d.getMonth() + 1;
    const anoTransacao = d.getFullYear();
    const condTipo = !filtroTipo || t.tipo === filtroTipo;
    const condCategoria = !filtroCategoria || t.categoria === filtroCategoria;
    const condMes = !filtroMes || parseInt(filtroMes) === mesTransacao;
    const condAno = !filtroAno || parseInt(filtroAno) === anoTransacao;
    return condTipo && condCategoria && condMes && condAno;
  });

  const categoriasFiltradas = categoriasFixas.filter((cat) => cat.tipo === tipo);

  const despesasPorCategoria = transacoesGrafico
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

  const segmentos = Object.entries(despesasPorCategoria)
    .sort((a, b) => b[1] - a[1])
    .map(([cat, val], i) => {
      const proporcao = val / totalDespesas;
      const dashArray = `${proporcao * 2 * Math.PI * radius} ${(1 - proporcao) * 2 * Math.PI * radius}`;
      const dashOffset = acumulado;
      acumulado += proporcao * 2 * Math.PI * radius;
      return { cat, val, dashArray, dashOffset, cor: cores[i % cores.length], proporcao };
    });

  const anosDisponiveis = [...new Set(transacoes.map(t => new Date(t.data?.toDate?.() || t.data).getFullYear()))];

  const exportarPDF = () => {
    const elemento = pdfRef.current;
    html2pdf()
      .set({ margin: 0.5, filename: 'transacoes.pdf', html2canvas: { scale: 2 }, jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' } })
      .from(elemento)
      .save();
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-slate-800 via-indigo-900 to-slate-700 text-gray-800 p-6">
      <h1 className="text-2xl sm:text-3xl font-bold text-center text-white mb-2">
        <span role="img" aria-label="money">💰</span> Controle de Gastos
      </h1>
      <p className="text-center text-sm text-white mb-6">Controle cada real que entra e sai</p>
      <div className="text-center mb-6">
        <button onClick={exportarPDF} className="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold px-4 py-2 rounded">
          Exportar PDF
        </button>
      </div>
      <div ref={pdfRef} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-bold text-purple-700 mb-4">📄 Transações</h2>
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
                  </div>
                </li>
              ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

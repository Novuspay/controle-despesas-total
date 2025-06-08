import React, { useEffect, useState } from 'react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { useNavigate } from 'react-router-dom';
import categoriasFixas from '../categoriasFixas';

function NovaTransacao() {
  const [tipo, setTipo] = useState('entrada');
  const [valor, setValor] = useState('');
  const [descricao, setDescricao] = useState('');
  const [data, setData] = useState('');
  const [categoriaSelecionada, setCategoriaSelecionada] = useState('');
  const [erro, setErro] = useState('');
  const navigate = useNavigate();

  const categoriasFiltradas = categoriasFixas.filter((cat) => cat.tipo === tipo);

  const handleSalvar = async (e) => {
    e.preventDefault();
    setErro('');

    const usuario = auth.currentUser;
    if (!usuario) {
      setErro('Usuário não autenticado.');
      return;
    }

    const valorNumero = parseFloat(valor);
    if (isNaN(valorNumero) || valorNumero <= 0) {
      setErro('Informe um valor válido maior que zero.');
      return;
    }

    try {
      await addDoc(collection(db, 'transacoes'), {
        tipo,
        valor: valorNumero,
        descricao,
        data: data ? new Date(data) : serverTimestamp(),
        categoria: categoriaSelecionada,
        uid: usuario.uid,
      });
      navigate('/dashboard');
    } catch (err) {
      setErro('Erro ao salvar transação: ' + err.message);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 bg-white p-8 shadow rounded">
      <h2 className="text-2xl font-bold mb-6 text-center text-green-700">Nova Transação</h2>

      <form onSubmit={handleSalvar} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Tipo</label>
          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          >
            <option value="entrada">Entrada</option>
            <option value="saida">Saída</option>
          </select>
        </div>

        <div>
          <label className="block mb-1 font-medium">Valor</label>
          <input
            type="number"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
            placeholder="Ex: 100.00"
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Descrição</label>
          <input
            type="text"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
            placeholder="Ex: Salário, Aluguel"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Data</label>
          <input
            type="date"
            value={data}
            onChange={(e) => setData(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Categoria</label>
          <select
            value={categoriaSelecionada}
            onChange={(e) => setCategoriaSelecionada(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
            required
          >
            <option value="">Selecione uma categoria</option>
            {categoriasFiltradas.map((cat, idx) => (
              <option key={idx} value={cat.nome}>{cat.nome}</option>
            ))}
          </select>
        </div>

        {erro && <p className="text-red-500 text-sm">{erro}</p>}

        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
        >
          Salvar Transação
        </button>
      </form>
    </div>
  );
}

export default NovaTransacao;

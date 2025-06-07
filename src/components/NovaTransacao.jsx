// src/components/NovaTransacao.jsx
import React, { useEffect, useState } from 'react';
import { addDoc, collection, getDocs, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { useNavigate } from 'react-router-dom';

function NovaTransacao() {
  const [tipo, setTipo] = useState('entrada');
  const [valor, setValor] = useState('');
  const [descricao, setDescricao] = useState('');
  const [data, setData] = useState('');
  const [categorias, setCategorias] = useState([]);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState('');
  const [erro, setErro] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const carregarCategorias = async () => {
      const usuario = auth.currentUser;
      if (!usuario) return;

      const snapshot = await getDocs(collection(db, 'categorias'));
      const lista = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((cat) => cat.uid === usuario.uid);

      setCategorias(lista);
    };

    carregarCategorias();
  }, []);

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
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <form onSubmit={handleSalvar} className="bg-white p-8 rounded shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">Nova Transação</h2>

        <select
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded mb-4"
        >
          <option value="entrada">Entrada</option>
          <option value="saida">Saída</option>
        </select>

        <input
          type="number"
          placeholder="Valor"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded mb-4"
          required
        />

        <input
          type="text"
          placeholder="Descrição"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded mb-4"
        />

        <input
          type="date"
          value={data}
          onChange={(e) => setData(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded mb-4"
        />

        <select
          value={categoriaSelecionada}
          onChange={(e) => setCategoriaSelecionada(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded mb-4"
        >
          <option value="">Selecione uma categoria</option>
          {categorias.map((cat) => (
            <option key={cat.id} value={cat.nome}>{cat.nome}</option>
          ))}
        </select>

        {erro && <p className="text-red-500 mb-4">{erro}</p>}

        <button
          type="submit"
          className="bg-green-500 text-white w-full p-2 rounded hover:bg-green-600"
        >
          Salvar
        </button>
      </form>
    </div>
  );
}

export default NovaTransacao;

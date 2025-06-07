// src/components/CategoriasListagem.jsx
import React, { useEffect, useState } from 'react';
import { collection, deleteDoc, doc, getDocs } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { useNavigate } from 'react-router-dom';

function CategoriasListagem() {
  const [categorias, setCategorias] = useState([]);
  const navigate = useNavigate();

  const carregarCategorias = async () => {
    const usuario = auth.currentUser;
    if (!usuario) {
      navigate('/login');
      return;
    }

    const snapshot = await getDocs(collection(db, 'categorias'));
    const lista = snapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .filter((cat) => cat.uid === usuario.uid);

    setCategorias(lista);
  };

  const handleExcluir = async (id) => {
    if (window.confirm('Deseja realmente excluir esta categoria?')) {
      await deleteDoc(doc(db, 'categorias', id));
      carregarCategorias();
    }
  };

  useEffect(() => {
    carregarCategorias();
  }, []);

  const categoriasEntrada = categorias.filter((cat) => cat.tipo === 'entrada');
  const categoriasSaida = categorias.filter((cat) => cat.tipo === 'saida');

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-2xl mx-auto bg-white shadow-md rounded p-6">
        <h1 className="text-2xl font-bold mb-6">Minhas Categorias</h1>

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Categorias de Entrada</h2>
          {categoriasEntrada.length === 0 ? (
            <p className="text-gray-500">Nenhuma categoria cadastrada.</p>
          ) : (
            <ul className="divide-y divide-gray-200">
              {categoriasEntrada.map((cat) => (
                <li key={cat.id} className="py-2 flex justify-between items-center">
                  <span>{cat.nome}</span>
                  <button
                    onClick={() => handleExcluir(cat.id)}
                    className="text-sm bg-red-100 text-red-600 px-2 py-1 rounded hover:bg-red-200"
                  >
                    Excluir
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">Categorias de Saída</h2>
          {categoriasSaida.length === 0 ? (
            <p className="text-gray-500">Nenhuma categoria cadastrada.</p>
          ) : (
            <ul className="divide-y divide-gray-200">
              {categoriasSaida.map((cat) => (
                <li key={cat.id} className="py-2 flex justify-between items-center">
                  <span>{cat.nome}</span>
                  <button
                    onClick={() => handleExcluir(cat.id)}
                    className="text-sm bg-red-100 text-red-600 px-2 py-1 rounded hover:bg-red-200"
                  >
                    Excluir
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default CategoriasListagem;

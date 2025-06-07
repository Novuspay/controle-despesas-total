// src/components/CategoriasListagem.jsx
import React, { useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { collection, deleteDoc, doc, onSnapshot, query, where } from 'firebase/firestore';
import { useNavigate, Link } from 'react-router-dom';

function CategoriasListagem() {
  const [categoriasEntrada, setCategoriasEntrada] = useState([]);
  const [categoriasSaida, setCategoriasSaida] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const usuario = auth.currentUser;
    if (!usuario) return;

    const q = query(collection(db, 'categorias'), where('uid', '==', usuario.uid));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const lista = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setCategoriasEntrada(lista.filter(cat => cat.tipo === 'entrada'));
      setCategoriasSaida(lista.filter(cat => cat.tipo === 'saida'));
    });

    return () => unsubscribe();
  }, []);

  const handleExcluir = async (id) => {
    if (window.confirm('Deseja realmente excluir esta categoria?')) {
      try {
        await deleteDoc(doc(db, 'categorias', id));
      } catch (err) {
        console.error('Erro ao excluir categoria:', err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-2xl mx-auto bg-white shadow-md rounded p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Minhas Categorias</h2>
          <Link
            to="/categoria"
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Nova Categoria
          </Link>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold text-blue-700 mb-2">Categorias de Entrada</h3>
          {categoriasEntrada.length === 0 ? (
            <p className="text-gray-500">Nenhuma categoria de entrada cadastrada.</p>
          ) : (
            <ul className="divide-y divide-gray-200">
              {categoriasEntrada.map((cat) => (
                <li key={cat.id} className="flex justify-between items-center py-2">
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
          <h3 className="text-lg font-semibold text-red-700 mb-2">Categorias de Saída</h3>
          {categoriasSaida.length === 0 ? (
            <p className="text-gray-500">Nenhuma categoria de saída cadastrada.</p>
          ) : (
            <ul className="divide-y divide-gray-200">
              {categoriasSaida.map((cat) => (
                <li key={cat.id} className="flex justify-between items-center py-2">
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

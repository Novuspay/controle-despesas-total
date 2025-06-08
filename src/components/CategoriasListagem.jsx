// src/components/CategoriasListagem.jsx
import React from 'react';
import categoriasFixas from '../categoriasFixas';

function CategoriasListagem() {
  const entradas = categoriasFixas.filter((cat) => cat.tipo === 'entrada');
  const saidas = categoriasFixas.filter((cat) => cat.tipo === 'saida');

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Minhas Categorias</h1>

      <h2 className="text-xl font-semibold text-green-600 mb-2">Entradas</h2>
      <ul className="mb-6 list-disc list-inside">
        {entradas.map((cat, idx) => (
          <li key={idx} className="text-gray-700">{cat.nome}</li>
        ))}
      </ul>

      <h2 className="text-xl font-semibold text-red-600 mb-2">Saídas</h2>
      <ul className="list-disc list-inside">
        {saidas.map((cat, idx) => (
          <li key={idx} className="text-gray-700">{cat.nome}</li>
        ))}
      </ul>
    </div>
  );
}

export default CategoriasListagem;

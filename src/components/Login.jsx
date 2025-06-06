import React from 'react';

function Login() {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
        <form>
          <div className="mb-4">
            <label className="block text-gray-700">Email</label>
            <input
              type="email"
              className="w-full px-4 py-2 border rounded"
              placeholder="Seu email"
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700">Senha</label>
            <input
              type="password"
              className="w-full px-4 py-2 border rounded"
              placeholder="Sua senha"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;

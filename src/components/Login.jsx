import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErro('');

    try {
      await signInWithEmailAndPassword(auth, email, senha);
      navigate('/dashboard');
    } catch (err) {
      setErro('Credenciais inválidas ou erro ao fazer login.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center text-green-600">Login</h1>

        <input
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded mb-4"
          required
        />

        <input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded mb-4"
          required
        />

        {erro && <p className="text-red-500 mb-4 text-sm">{erro}</p>}

        <button
          type="submit"
          className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600"
        >
          Entrar
        </button>

        <p className="text-center mt-4 text-sm">
          Não tem uma conta?{' '}
          <span
            className="text-blue-600 hover:underline cursor-pointer"
            onClick={() => navigate('/cadastro')}
          >
            Cadastre-se
          </span>
        </p>
      </form>
    </div>
  );
}

export default Login;

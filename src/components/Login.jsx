import React, { useState } from 'react';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigate, Link } from 'react-router-dom';

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
    } catch (error) {
      setErro('Email ou senha incorretos');
    }
  };

  const handlePasswordReset = async () => {
    if (!email) {
      setErro('Informe o email para recuperar a senha');
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      alert('Email de recuperação enviado com sucesso.');
    } catch (error) {
      setErro('Erro ao enviar email: ' + error.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-100 via-white to-green-200">
      <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-md border border-gray-200">
        <h2 className="text-3xl font-bold text-center text-green-600 mb-6">Acessar Conta</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-gray-600 mb-1 text-sm">E-mail</label>
            <input
              type="email"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-400 focus:outline-none"
              placeholder="Seu email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-gray-600 mb-1 text-sm">Senha</label>
            <input
              type="password"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-400 focus:outline-none"
              placeholder="Sua senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
            />
          </div>

          {erro && <p className="text-red-500 text-sm text-center">{erro}</p>}

          <button
            type="submit"
            className="w-full bg-green-500 hover:bg-green-600 transition text-white font-medium py-2 rounded-md"
          >
            Entrar
          </button>

          <button
            type="button"
            onClick={handlePasswordReset}
            className="block text-center w-full text-sm text-green-600 hover:underline mt-1"
          >
            Esqueceu a senha?
          </button>
        </form>

        <div className="text-center text-sm text-gray-600 mt-6">
          Não tem uma conta?{' '}
          <Link to="/register" className="text-green-600 hover:underline">
            Cadastre-se
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;

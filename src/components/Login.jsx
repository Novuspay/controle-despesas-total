import React, { useState } from 'react';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react'; // ícone moderno

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-800 px-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md border border-gray-100 animate-fade-in">
        <div className="flex justify-center mb-4">
          <ShieldCheck className="w-12 h-12 text-emerald-600" />
        </div>

        <h2 className="text-3xl font-extrabold text-center text-emerald-600 mb-2">Acessar Conta</h2>
        <p className="text-sm text-gray-500 text-center mb-6">Gerencie suas finanças com controle e segurança</p>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm text-gray-700 mb-1">E-mail</label>
            <input
              type="email"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              placeholder="exemplo@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">Senha</label>
            <input
              type="password"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              placeholder="Digite sua senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
            />
          </div>

          {erro && <p className="text-red-500 text-center text-sm">{erro}</p>}

          <button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg font-semibold transition"
          >
            Entrar
          </button>

          <button
            type="button"
            onClick={handlePasswordReset}
            className="block w-full text-center text-sm text-emerald-600 hover:underline mt-1"
          >
            Esqueceu a senha?
          </button>
        </form>

        <div className="text-center text-sm text-gray-600 mt-6">
          Não tem uma conta?{' '}
          <Link to="/register" className="text-emerald-600 hover:underline">
            Cadastre-se
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;

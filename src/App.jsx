import React, { useState } from 'react';
import axios from 'axios';
import './App.css';


function App() {
  const [arquivoPdv, setArquivoPdv] = useState(null);
  const [arquivoEntrega, setArquivoEntrega] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const [modal, setModal] = useState({ visivel: false, tipo: '', titulo: '', mensagem: '', arquivo: '' });
  const [feedback, setFeedback] = useState({ visivel: false, tipo: '', mensagem: '' });

  const mostrarFeedback = (tipo, mensagem) => {
    setFeedback({ visivel: true, tipo, mensagem });
    setTimeout(() => setFeedback({ visivel: false, tipo: '', mensagem: '' }), 4000);
  };

  const handleUploadPdv = () => {
    if (!arquivoPdv) return;
    setModal({
      visivel: true, tipo: 'pdv', titulo: 'Confirmar Atualização de Setor 🏪',
      mensagem: 'O sistema vai ler a planilha da Ambev, identificar o número do setor 503 (ou outro) direto na coluna e atualizar o banco de dados dos clientes.',
      arquivo: arquivoPdv.name
    });
  };

  const handleUploadEntrega = () => {
    if (!arquivoEntrega) return;
    setModal({
      visivel: true, tipo: 'entrega', titulo: 'Confirmar Rota Logística 🚚',
      mensagem: 'Isso vai atualizar o status dos caminhões e placas no rastreio em tempo real.',
      arquivo: arquivoEntrega.name
    });
  };

  const fecharModal = () => setModal({ ...modal, visivel: false });

  const confirmarEnvio = async () => {
    setLoading(true);
    const formData = new FormData();

    try {
      if (modal.tipo === 'pdv') {
        formData.append('file', arquivoPdv); 
        await axios.post('https://rnplanner-api.azurewebsites.net/pdvs/importar', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        mostrarFeedback('sucesso', '✅ Planilha processada! Os PDVs foram carimbados com seus respectivos setores no banco.');
        setArquivoPdv(null);
        
      } else if (modal.tipo === 'entrega') {
        formData.append('file', arquivoEntrega); 
        await axios.post('https://rnplanner-api.azurewebsites.net/entregas/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        mostrarFeedback('sucesso', '🚚 Logística de entregas atualizada!');
        setArquivoEntrega(null);
      }
      fecharModal();

    } catch (error) {
      console.error("Erro na requisição:", error);
      mostrarFeedback('erro', '❌ Falha na importação. O banco bloqueou ou o arquivo está incorreto.');
      fecharModal();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-container">
      <header className="admin-header">
        <div className="logo-area">
          <h1>Painel de Comando 🦅</h1>
          <span className="subtitle">RN Planner - Backoffice</span>
        </div>
        <span className="badge-admin">Acesso Restrito - Admin</span>
      </header>

      <main className="admin-content">
        <div className="cards-grid">
          <div className="upload-card card-pdv">
            <h2>🏪 Clientes do Setor</h2>
            <p>Suba o arquivo Excel/CSV original com a coluna do setor para alimentar o aplicativo da rua.</p>
            <div className="file-input-wrapper">
              <input type="file" className="input-arquivo" accept=".csv, .xlsx, .xls" onChange={(e) => setArquivoPdv(e.target.files[0])} />
            </div>
            <button className={`btn-upload ${arquivoPdv ? 'btn-pdv-pronto' : ''}`} onClick={handleUploadPdv} disabled={!arquivoPdv}>
              {arquivoPdv ? '🚀 ATUALIZAR SETOR' : 'ESCOLHER PLANILHA DE PDVS'}
            </button>
          </div>

          <div className="upload-card card-entrega">
            <h2>🚚 Rotas de Entrega</h2>
            <p>Suba o arquivo logístico para atualizar o status dos caminhões e placas.</p>
            <div className="file-input-wrapper wrapper-blue">
              <input type="file" className="input-arquivo" accept=".csv, .xlsx, .xls" onChange={(e) => setArquivoEntrega(e.target.files[0])} />
            </div>
            <button className={`btn-upload ${arquivoEntrega ? 'btn-entrega-pronto' : ''}`} onClick={handleUploadEntrega} disabled={!arquivoEntrega}>
              {arquivoEntrega ? '📦 ATUALIZAR ENTREGAS' : 'ESCOLHER PLANILHA LOGÍSTICA'}
            </button>
          </div>
        </div>
      </main>

      {modal.visivel && (
        <div className="modal-overlay">
          <div className={`modal-box ${modal.tipo === 'pdv' ? 'modal-borda-pdv' : 'modal-borda-entrega'}`}>
            <h3 className="modal-titulo">{modal.titulo}</h3>
            <div className="modal-arquivo-box">
              <span className="modal-label">Arquivo Selecionado:</span>
              <span className="modal-nome-arquivo">{modal.arquivo}</span>
            </div>
            <p className="modal-texto">{modal.mensagem}</p>
            <div className="modal-botoes">
              <button className="btn-cancelar" onClick={fecharModal} disabled={loading}>CANCELAR</button>
              <button className={`btn-confirmar ${modal.tipo === 'pdv' ? 'btn-conf-pdv' : 'btn-conf-entrega'}`} onClick={confirmarEnvio} disabled={loading}>
                {loading ? '🚀 LENDO PLANILHA...' : 'CONFIRMAR ENVIO'}
              </button>
            </div>
          </div>
        </div>
      )}

      {feedback.visivel && (
        <div className={`toast-feedback ${feedback.tipo === 'sucesso' ? 'toast-sucesso' : 'toast-erro'}`}>
          {feedback.mensagem}
        </div>
      )}
    </div>
  );
}

export default App;

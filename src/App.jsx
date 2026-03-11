import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [arquivoPdv, setArquivoPdv] = useState(null);
  const [arquivoEntrega, setArquivoEntrega] = useState(null);
  
  // 🔥 LISTA VIP
  const [setorVip, setSetorVip] = useState('');
  const [setoresLiberados, setSetoresLiberados] = useState([]);

  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState({ visivel: false, tipo: '', titulo: '', mensagem: '', arquivo: '' });
  const [feedback, setFeedback] = useState({ visivel: false, tipo: '', mensagem: '' });

  const BASE_URL = 'https://rnplanner-api-ekc2hratcvgqhgc5.brazilsouth-01.azurewebsites.net';

  const mostrarFeedback = (tipo, mensagem) => {
    setFeedback({ visivel: true, tipo, mensagem });
    setTimeout(() => setFeedback({ visivel: false, tipo: '', mensagem: '' }), 4000);
  };

  // BUSCA OS SETORES QUE JÁ ESTÃO LIBERADOS QUANDO ABRIR O PAINEL
  useEffect(() => {
    carregarListaVip();
  }, []);

  const carregarListaVip = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/setores-vip`);
      setSetoresLiberados(response.data);
    } catch (error) {
      console.error("Erro ao carregar Lista VIP", error);
    }
  };

  // 🔥 FUNÇÃO PARA LIBERAR ACESSO A UM SETOR NOVO
  const handleAdicionarVip = async () => {
    if (!setorVip.trim()) return;
    setLoading(true);
    try {
      await axios.post(`${BASE_URL}/setores-vip/adicionar/${setorVip}`);
      mostrarFeedback('sucesso', `✅ Acesso liberado para o setor ${setorVip}!`);
      setSetorVip('');
      carregarListaVip(); // Atualiza a lista na tela
    } catch (error) {
      mostrarFeedback('erro', '❌ Falha ao liberar acesso. Verifique se ele já está na lista.');
    } finally {
      setLoading(false);
    }
  };

  // FUNÇÃO PARA BLOQUEAR O ACESSO
  const handleRemoverVip = async (id, numeroSetor) => {
    if(!window.confirm(`Tem certeza que deseja bloquear o acesso do setor ${numeroSetor}?`)) return;
    
    try {
      await axios.delete(`${BASE_URL}/setores-vip/remover/${id}`);
      mostrarFeedback('sucesso', `Acesso do setor ${numeroSetor} revogado!`);
      carregarListaVip();
    } catch (error) {
      mostrarFeedback('erro', 'Erro ao remover acesso.');
    }
  };

  const handleUploadPdv = () => {
    if (!arquivoPdv) return;
    setModal({
      visivel: true, tipo: 'pdv', titulo: 'Confirmar Planificador PDF 🏪',
      mensagem: 'O sistema vai ler o PDF, extrair as metas do dia (Subdivisão de Tasks, Missões, Ofertas) e identificar o RKG e Score 5 dos clientes.',
      arquivo: arquivoPdv.name
    });
  };

  const handleUploadEntrega = () => {
    if (!arquivoEntrega) return;
    setModal({
      visivel: true, tipo: 'entrega', titulo: 'Confirmar Rota Logística 🚚',
      mensagem: 'Isso vai atualizar o status das entregas.',
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
        // 🔥 MUDANÇA: Agora envia para a nova porta /upload-pdf que criamos no Java
        await axios.post(`${BASE_URL}/pdvs/upload-pdf`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        mostrarFeedback('sucesso', '✅ PDF processado! As metas diárias e o RKG foram atualizados com sucesso.');
        setArquivoPdv(null);
        
      } else if (modal.tipo === 'entrega') {
        formData.append('file', arquivoEntrega); 
        await axios.post(`${BASE_URL}/entregas/upload`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        mostrarFeedback('sucesso', '🚚 Mapeamento da Logística atualizado!');
        setArquivoEntrega(null);
      }
      fecharModal();

    } catch (error) {
      console.error("Erro na requisição:", error);
      mostrarFeedback('erro', '❌ Falha na importação. O arquivo não é um PDF válido ou está fora do padrão.');
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
          <span className="subtitle">RN Planner - Setor Administrativo </span>
        </div>
        <span className="badge-admin">Acesso Restrito - Admin - Carlos Eduardo</span>
      </header>

      <main className="admin-content">
        <div className="cards-grid">
          
          <div className="upload-card card-pdv">
            <h2>🏪 Metas e Clientes</h2>
            {/* 🔥 MUDANÇA NO TEXTO */}
            <p>Suba o <b>Planificador em PDF</b> para atualizar as metas diárias, o RKG e o Score 5 do setor.</p>
            <div className="file-input-wrapper">
              {/* 🔥 MUDANÇA NO ACCEPT: Agora só aceita .pdf */}
              <input type="file" className="input-arquivo" accept=".pdf" onChange={(e) => setArquivoPdv(e.target.files[0])} />
            </div>
            <button className={`btn-upload ${arquivoPdv ? 'btn-pdv-pronto' : ''}`} onClick={handleUploadPdv} disabled={!arquivoPdv}>
              {arquivoPdv ? '🚀 ATUALIZAR METAS E PDVS' : 'ESCOLHER PLANIFICADOR PDF'}
            </button>
          </div>

          <div className="upload-card card-entrega">
            <h2>🚚 Rotas de Entrega</h2>
            <p>Suba o arquivo logístico para atualizar o status de entregas.</p>
            <div className="file-input-wrapper wrapper-blue">
              <input type="file" className="input-arquivo" accept=".csv, .xlsx, .xls" onChange={(e) => setArquivoEntrega(e.target.files[0])} />
            </div>
            <button className={`btn-upload ${arquivoEntrega ? 'btn-entrega-pronto' : ''}`} onClick={handleUploadEntrega} disabled={!arquivoEntrega}>
              {arquivoEntrega ? '📦 ATUALIZAR ENTREGAS' : 'ESCOLHER PLANILHA LOGÍSTICA'}
            </button>
          </div>

          {/* 🔥 GESTÃO DE ACESSOS (LISTA VIP) MANTIDA EXATAMENTE IGUAL */}
          <div className="upload-card card-vip">
            <h2>🔑 Gestão de Acessos</h2>
            <p>Gerenciar Acesso ao RNPlanner </p>
            
            <div className="vip-input-row" style={{ display: 'flex', gap: '10px', marginTop: '15px', marginBottom: '15px' }}>
              <input 
                type="number" 
                placeholder="Ex: 507" 
                value={setorVip}
                onChange={(e) => setSetorVip(e.target.value)}
                style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '16px' }}
              />
              <button 
                onClick={handleAdicionarVip} 
                disabled={loading || !setorVip}
                style={{ backgroundColor: '#28a745', color: '#fff', border: 'none', padding: '0 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                LIBERAR
              </button>
            </div>

            <div className="vip-lista-scroll" style={{ maxHeight: '120px', overflowY: 'auto', backgroundColor: '#f9f9f9', borderRadius: '8px', padding: '10px' }}>
              <span style={{ fontSize: '12px', color: '#666', fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>Setores com Acesso Liberado:</span>
              {setoresLiberados.length === 0 ? (
                <span style={{ fontSize: '13px', color: '#999', fontStyle: 'italic' }}>Nenhum setor VIP no momento.</span>
              ) : (
                setoresLiberados.map(vip => (
                  <div key={vip.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: '8px 12px', borderRadius: '6px', marginBottom: '5px', border: '1px solid #eee' }}>
                    <span style={{ fontWeight: 'bold', color: '#333' }}>Setor {vip.setor}</span>
                    <button onClick={() => handleRemoverVip(vip.id, vip.setor)} style={{ backgroundColor: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px', padding: '4px 8px', fontSize: '12px', cursor: 'pointer' }}>Bloquear ❌</button>
                  </div>
                ))
              )}
            </div>

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
                {loading ? '🚀 PROCESSANDO...' : 'CONFIRMAR ENVIO'}
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
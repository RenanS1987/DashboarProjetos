import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const styles = {
  container: {
    padding: '20px',
    backgroundColor: '#191970',
    color: 'white',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  formBox: {
    width: '90%',
    maxWidth: '600px',
    backgroundColor: '#36454F',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0,0,0,0.5)'
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    marginBottom: '12px'
  },
  label: {
    marginBottom: '6px',
    fontWeight: '600'
  },
  input: {
    padding: '8px',
    borderRadius: '4px',
    border: '1px solid #5a5a5a',
    backgroundColor: '#2a3a4a',
    color: 'white'
  },
  actions: {
    display: 'flex',
    gap: '10px',
    marginTop: '12px'
  },
  btn: {
    padding: '10px 14px',
    borderRadius: '6px',
    border: 'none',
    cursor: 'pointer',
    fontWeight: '600'
  },
  saveBtn: {
    backgroundColor: '#82ca9d',
    color: '#062018'
  },
  cancelBtn: {
    backgroundColor: '#e23e57',
    color: 'white'
  }
};

function Formulario({ convenios = [], taxasConclusao = [], isDataLoaded, onSubmit }) {
  console.log('Convênios recebidos no formulário:', convenios);
  console.log('Taxas de conclusão recebidas:', taxasConclusao);
  const [projeto, setProjeto] = useState('');
  const [valor, setValor] = useState('');
  const [valorNumerico, setValorNumerico] = useState(0);
  const [prazo, setPrazo] = useState('');
  const [tipoAquisicao, setTipoAquisicao] = useState('');
  const [taxaConclusao, setTaxaConclusao] = useState('');
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  // Função para lidar com mudanças no campo de valor (permite digitação livre)
  const handleValorChange = (e) => {
    const input = e.target.value;
    // Remove tudo exceto números, vírgula e ponto
    const apenasNumeros = input.replace(/[^\d,.]/g, '');
    setValor(apenasNumeros);
    
    // Converte para número (substitui vírgula por ponto)
    const numeroFloat = parseFloat(apenasNumeros.replace(',', '.')) || 0;
    setValorNumerico(numeroFloat);
  };

  // Função para formatar quando sair do campo
  const handleValorBlur = () => {
    if (valorNumerico > 0) {
      const formatado = valorNumerico.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
      setValor(formatado);
    }
  };

  // Atualiza a taxa de conclusão quando o convênio é selecionado
  const handleConvenioChange = (convenioSelecionado) => {
    setTipoAquisicao(convenioSelecionado);
    
    // Busca a taxa de conclusão correspondente ao convênio selecionado
    const taxaData = taxasConclusao.find(item => item.convenio === convenioSelecionado);
    if (taxaData) {
      setTaxaConclusao(taxaData.taxa.toString());
      console.log(`Taxa de conclusão preenchida automaticamente: ${taxaData.taxa}% para ${convenioSelecionado}`);
    } else {
      setTaxaConclusao('');
      console.log(`Nenhuma taxa de conclusão encontrada para ${convenioSelecionado}`);
    }
  };

    const validate = () => {
    const e = {};
    if (!projeto.trim()) e.projeto = 'Nome do Projeto é obrigatório.';
    if (valorNumerico === 0 || valorNumerico < 0) e.valor = 'Valor deve ser maior que zero.';
    if (!tipoAquisicao) e.tipoAquisicao = 'Fonte pagadora é obrigatória.';
    if (prazo === '' || Number.isNaN(Number(prazo))) e.prazo = 'Prazo deve ser um número.';
    if (prazo !== '' && Number(prazo) < 0) e.prazo = 'Prazo deve ser >= 0.';
    if (taxaConclusao === '' || Number.isNaN(Number(taxaConclusao))) e.taxaConclusao = 'Taxa de Conclusão deve ser um número.';
    if (taxaConclusao !== '' && (Number(taxaConclusao) < 0 || Number(taxaConclusao) > 100)) e.taxaConclusao = 'Taxa de Conclusão deve estar entre 0 e 100.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (ev) => {
    ev.preventDefault();
    if (!validate()) return;

    const formData = {
      projeto: projeto.trim(),
      valor: valorNumerico,
      prazo: Number(prazo),
      tipoAquisicao: tipoAquisicao,
      taxaConclusao: Number(taxaConclusao),
    };

    // Chama a função onSubmit passada como prop para enviar os dados para o App
    if (onSubmit) {
      onSubmit(formData);
    }

    // Redireciona para a página de avaliação
    navigate('/avaliacao');
  };

  const handleCancel = () => {
    // Reseta e volta para Home
    setProjeto('');
    setValor('');
    setValorNumerico(0);
    setPrazo('');
    setTipoAquisicao('');
    setTaxaConclusao('');
    navigate('/');
  };

  return (
    <div style={styles.container}>
      <div style={styles.formBox}>
        <h2 style={{ marginTop: 0, textAlign: 'center' }}>Formulário de Avaliação de Projeto</h2>

        <form onSubmit={handleSubmit}>
          <div style={styles.field}>
            <label style={styles.label}>Nome do Projeto</label>
            <input
              style={styles.input}
              value={projeto}
              onChange={(e) => setProjeto(e.target.value)}
              placeholder="Digite o nome do projeto"
            />
            {errors.projeto && <small style={{ color: '#ffcccb' }}>{errors.projeto}</small>}
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Valor (R$)</label>
            <input
              style={styles.input}
              type="text"
              value={valor}
              onChange={handleValorChange}
              onBlur={handleValorBlur}
              placeholder="Ex: 1250.50 ou 1250,50"
            />
            {errors.valor && <small style={{ color: '#ffcccb' }}>{errors.valor}</small>}
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Prazo (meses)</label>
            <input
              style={styles.input}
              type="number"
              value={prazo}
              onChange={(e) => setPrazo(e.target.value)}
              placeholder="Número de meses"
            />
            {errors.prazo && <small style={{ color: '#ffcccb' }}>{errors.prazo}</small>}
          </div>

          <div style={styles.field}>
            <label style={styles.label}>FONTE PAGADORA</label>
            <div style={{ display: 'flex', gap: '20px', marginTop: '8px', flexDirection: 'column' }}>
              {!isDataLoaded ? (
                <p style={{ color: '#ffcccb', margin: '5px 0' }}>Carregando convênios...</p>
              ) : convenios.length === 0 ? (
                <p style={{ color: '#ffcccb', margin: '5px 0' }}>Nenhum convênio encontrado</p>
              ) : (
                convenios.map((convenio, index) => (
                  <label key={index} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="tipoAquisicao"
                      value={convenio}
                      checked={tipoAquisicao === convenio}
                      onChange={(e) => handleConvenioChange(e.target.value)}
                      style={{ marginRight: '8px' }}
                    />
                    {convenio}
                  </label>
                ))
              )}
            </div>
            {errors.tipoAquisicao && <small style={{ color: '#ffcccb' }}>{errors.tipoAquisicao}</small>}
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Taxa de Conclusão (%) *</label>
            <input
              style={{ ...styles.input, backgroundColor: '#1a2a3a', cursor: 'not-allowed' }}
              type="number"
              min="0"
              max="100"
              value={taxaConclusao}
              readOnly
              placeholder="Selecione um convênio"
            />
            {errors.taxaConclusao && <small style={{ color: '#ffcccb' }}>{errors.taxaConclusao}</small>}
            <small style={{ color: '#cbd5e1', marginTop: '4px' }}>Preenchido automaticamente ao selecionar o convênio</small>
          </div>

          <div style={styles.actions}>
            <button type="submit" style={{ ...styles.btn, ...styles.saveBtn }}>Avaliar</button>
            <button type="button" onClick={handleCancel} style={{ ...styles.btn, ...styles.cancelBtn }}>Cancelar</button>
            <Link to="/" style={{ marginLeft: 'auto', color: '#82ca9d', alignSelf: 'center', textDecoration: 'none' }}>Voltar para Home</Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Formulario;

import React from 'react';
import { Link } from 'react-router-dom';

// Estilos de fundo consistentes
const styles = {
    container: {
        padding: '20px',
        backgroundColor: '#191970',
        color: 'white',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center'
    },
    title: {
        fontSize: '2.5em',
        marginBottom: '20px',
        paddingBottom: '10px'
    },
    section: {
        width: '90%',
        maxWidth: '900px',
        margin: '20px 0',
        padding: '25px',
        backgroundColor: '#36454F', // Cinza escuro para contraste
        borderRadius: '8px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.5)'
    },
    cardsContainer: {
        display: 'flex',
        gap: '18px',
        justifyContent: 'space-between',
        marginBottom: '18px'
    },
    card: {
        flex: 1,
        padding: '16px',
        borderRadius: '8px',
        backgroundColor: '#1f2937',
        boxShadow: '0 2px 6px rgba(0,0,0,0.4)'
    },
    cardTitle: {
        fontSize: '0.95rem',
        color: '#cbd5e1',
        marginBottom: '8px'
    },
    cardValue: {
        fontSize: '1.6rem',
        fontWeight: '700',
        color: '#82ca9d'
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
        marginTop: '20px'
    },
    th: {
        border: '1px solid #5a5a5a',
        padding: '12px',
        // --- ALTERAÇÃO AQUI: CENTRALIZAR CABEÇALHO ---
        textAlign: 'center',
        // --- FIM DA ALTERAÇÃO ---
        backgroundColor: '#191970',
        fontWeight: 'bold'
    },
    td: {
        border: '1px solid #5a5a5a',
        padding: '12px',
        textAlign: 'right', // Mantido 'right' para alinhar números (R$)
        backgroundColor: '#2a3a4a'
    }
};

// Home agora recebe as métricas como props
function Home({ metrics, isDataLoaded, loadingError }) {
    // Formata o saldo total
    const formatCurrency = (value) => {
        if (typeof value !== 'number') return 'R$ 0,00';
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(value);
    };

    // Formata a taxa de conclusão como porcentagem
    const formatPercentage = (value) => {
        if (typeof value !== 'number') return '0,00%';
        return new Intl.NumberFormat('pt-BR', {
            style: 'decimal',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(value) + '%';
    };

    return (
        <div style={styles.container}>

            <h1 style={styles.title}>TRABALHO PRÁTICO FINAL - TPF</h1>
            <h2 style={{ fontSize: '1.8em', marginTop: '-22px', marginBottom: '25px', color: '#f2f7f4ff' }}> Pós Graduação em Gestão de Projetos - FIA-ONLINE</h2>
            <h3 style={{ fontSize: '1.5em', marginTop: '10px', marginBottom: '20px', color: '#06a345ff' }}> Software para Avaliação de Projetos aplicados em Convênios de CT&I</h3>

            <div style={styles.section}>

                <h2 style={{ marginTop: '24px', marginBottom: '16px', color: '#cbd5e1' }}>
                    RESUMO DAS MÉTRICAS DOS CONVÊNIOS
                </h2>

                        <table style={styles.table}>
                            <thead>
                                <tr>
                                    {/* Os títulos serão centralizados pelo estilo styles.th */}
                                    <th style={styles.th}>Métrica</th>
                                    <th style={styles.th}>Resultado</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    {/* As métricas (texto) permanecem alinhadas à esquerda para leitura fácil */}
                                    <td style={{ ...styles.td, textAlign: 'left' }}>Total de Convênios em Execução</td>
                                    {/* Os resultados (números) permanecem alinhados à direita */}
                                    <td style={styles.td}>{metrics.totalConvenios}</td>
                                </tr>
                                <tr>
                                    <td style={{ ...styles.td, textAlign: 'left' }}>Saldo Geral de Todos os Convênios</td>
                                    <td style={styles.td}>{formatCurrency(metrics.saldoGeral)}</td>
                                </tr>
                                <tr>
                                    <td style={{ ...styles.td, textAlign: 'left' }}>Taxa Média de Conclusão de Projetos</td>
                                    <td style={styles.td}>{formatPercentage(metrics.mediaTaxaConclusao ?? 0)}</td>
                                </tr>
                            </tbody>
                        </table>
                    
            

                <p style={{ marginTop: '10px' }}>
                    <Link to="/formulario" style={{ color: '#82ca9d', textDecoration: 'none', fontWeight: 'bold' }}>
                        Avaliar novo projeto
                    </Link>
                </p>
            </div>

        </div>
    );
}

export default Home;
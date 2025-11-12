import React from 'react';
import ExcelReader from "./assets/components/ExcelReader.jsx";
import DashboardChart from "./assets/components/DashboardChart.jsx";

// Analises agora recebe os dados e funções diretamente do App.jsx
function Analises({ chartDataSaldo, chartDataPrazo, saldoGeral, isDataLoaded, loadingError, onClearData }) {

  return (
    <div className="dashboard-container" style={{
      padding: '20px',
      backgroundColor: '#191970',
      color: 'white',
      minHeight: '100vh'
    }}>

      {/* --- ALTERAÇÃO AQUI: DIMINUIÇÃO DO TAMANHO DA FONTE --- */}
      <h1 style={{
        textAlign: 'center',
        marginBottom: '10px', // Reduzida a margem inferior de 30px para 10px
        fontSize: '1.5em'     // Reduzido o tamanho da fonte (metade de um padrão grande de ~3em)
      }}>
        ANÁLISE DE CONVÊNIOS
      </h1>

      {/* ExcelReader (já ajustado) */}
      <ExcelReader
        totalSaldo={saldoGeral}
        isDataLoaded={isDataLoaded}
        loadingError={loadingError}
        onClearData={onClearData}
      />

      {/* DashboardChart */}
      <DashboardChart
        chartDataSaldo={chartDataSaldo}
        chartDataPrazo={chartDataPrazo}
        isDataLoaded={isDataLoaded}
      />
    </div>
  );
}

export default Analises;
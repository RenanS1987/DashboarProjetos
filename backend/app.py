from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
import skfuzzy as fuzz
from skfuzzy import control as ctrl
import numpy as np
import matplotlib
matplotlib.use('Agg')  # Backend sem interface gráfica para salvar arquivos
import matplotlib.pyplot as plt
import os
from datetime import datetime

app = FastAPI()

# Configurar CORS para permitir requisições do frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://dashboarprojetos.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ProjetoData(BaseModel):
    saldo_convenio: float
    prazo_convenio: int
    valor_projeto: float
    prazo_projeto: int
    taxa_conclusao: float

def criar_sistema_fuzzy():
    # Antecedentes (entradas) - APENAS 3 VARIÁVEIS
    perc_custo = ctrl.Antecedent(np.arange(0, 101, 1), 'percentual_custo')
    perc_prazo = ctrl.Antecedent(np.arange(0, 101, 1), 'percentual_prazo')
    taxa_conclusao = ctrl.Antecedent(np.arange(0, 101, 1), 'taxa_conclusao')

    # Consequente (saída)
    nivel_sucesso = ctrl.Consequent(np.arange(0, 101, 1), 'nivel_sucesso')

    # Funções de pertinência para percentual do saldo
    perc_custo['baixo'] = fuzz.trimf(perc_custo.universe, [10, 10, 25])
    perc_custo['medio'] = fuzz.gaussmf(perc_custo.universe, 50, 25)
    perc_custo['alto'] = fuzz.trapmf(perc_custo.universe, [70, 80, 90, 90])

    # Funções de pertinência para percentual do prazo
    perc_prazo['baixo'] = fuzz.gaussmf(perc_prazo.universe, 0, 25)
    perc_prazo['medio'] = fuzz.gaussmf(perc_prazo.universe, 50, 15)
    perc_prazo['alto'] = fuzz.gaussmf(perc_prazo.universe, 100, 25)

    # Funções de pertinência para taxa de conclusão
    taxa_conclusao['baixa'] = fuzz.trapmf(taxa_conclusao.universe, [0, 0, 30, 50])
    taxa_conclusao['media'] = fuzz.gaussmf(taxa_conclusao.universe, 50, 15)
    taxa_conclusao['alta'] = fuzz.trapmf(taxa_conclusao.universe, [60, 70, 90, 100])

    # Funções de pertinência para nível de sucesso (saída)
    nivel_sucesso['muito_baixo'] = fuzz.trimf(nivel_sucesso.universe, [0, 0, 25])
    nivel_sucesso['baixo'] = fuzz.trimf(nivel_sucesso.universe, [15, 35, 45])
    nivel_sucesso['moderado'] = fuzz.trimf(nivel_sucesso.universe, [35, 50, 65])
    nivel_sucesso['alto'] = fuzz.trimf(nivel_sucesso.universe, [55, 75, 85])
    nivel_sucesso['muito_alto'] = fuzz.trimf(nivel_sucesso.universe, [75, 100, 100])

    # Regras fuzzy - Sistema simplificado com 3 variáveis
    regras = [
        # Regra 1: Projeto excelente - todos os indicadores altos
        ctrl.Rule(perc_custo['baixo'] & perc_prazo['baixo'] & taxa_conclusao['alta'], 
                  nivel_sucesso['muito_alto']),
        
        # Regra 2: Projeto bom - maioria dos indicadores altos/médios
        ctrl.Rule(perc_custo['baixo'] & perc_prazo['medio'] & taxa_conclusao['alta'], 
                  nivel_sucesso['alto']),
        
        # Regra 3: Projeto bom - saldo e prazo altos, mesmo com conclusão média
        ctrl.Rule(perc_custo['baixo'] & perc_prazo['baixo'] & taxa_conclusao['media'], 
                  nivel_sucesso['muito_alto']),
        
        # Regra 4: Projeto regular - indicadores médios
        ctrl.Rule(perc_custo['medio'] & perc_prazo['medio'] & taxa_conclusao['media'], 
                  nivel_sucesso['moderado']),
        
        # Regra 5: Projeto regular - bom saldo mas prazo e conclusão médios
        ctrl.Rule(perc_custo['baixo'] & perc_prazo['medio'] & taxa_conclusao['alta'], 
                  nivel_sucesso['moderado']),
        
        # Regra 6: Projeto preocupante - saldo baixo ou prazo baixo
        ctrl.Rule(perc_custo['alto'] | perc_prazo['alto'], 
                  nivel_sucesso['baixo']),
        
        # Regra 7: Projeto preocupante - taxa de conclusão baixa
        ctrl.Rule(taxa_conclusao['baixa'], 
                  nivel_sucesso['baixo']),
        
        # Regra 8: Projeto crítico - múltiplos indicadores baixos
        ctrl.Rule(perc_custo['alto'] & perc_prazo['alto']& taxa_conclusao['media'],
                  nivel_sucesso['muito_baixo']),
        
        # Regra 9: Projeto crítico - saldo ou prazo baixo com conclusão baixa
        ctrl.Rule((perc_custo['alto'] | perc_prazo['alto']) & taxa_conclusao['baixa'], 
                  nivel_sucesso['muito_baixo']),
        
        # Regra 10: Projeto bom - alta taxa de conclusão compensa outros fatores médios
        ctrl.Rule(taxa_conclusao['alta'] & perc_custo['medio'] & perc_prazo['medio'], 
                  nivel_sucesso['alto']),

        # Regra 11: Projeto CRÍTICO - ALGUNS indicadores CHAVES  altos
        ctrl.Rule(perc_custo['alto'] | perc_custo['medio'] & taxa_conclusao['baixa'], 
                  nivel_sucesso['muito_baixo']),
        
        # Regra 12: Projeto CRÍTICO - ALGUNS indicadores CHAVES  altos
        ctrl.Rule(perc_prazo['alto'] | perc_prazo['medio'] & taxa_conclusao['baixa'], 
                  nivel_sucesso['muito_baixo']),
    ]

    sistema_ctrl = ctrl.ControlSystem(regras)
    sistema = ctrl.ControlSystemSimulation(sistema_ctrl)
    return sistema

def get_classificacao(nivel: float) -> str:
    if nivel >= 80:
        return "Excelente"
    elif nivel >= 60:
        return "Bom"
    elif nivel >= 40:
        return "Regular"
    elif nivel >= 20:
        return "Preocupante"
    else:
        return "Crítico"

def get_recomendacoes(nivel: float, detalhes: dict) -> str:
    recomendacoes = []
    
    if detalhes['percentual_custo'] > 75:
        recomendacoes.append("Orçamento do Projeto compromete significativamente o orçamento do Convênio com riscos dos recursos serem insuficientes. Revisar o orçamento do projeto e buscar otimização de recursos")
    if detalhes['percentual_prazo'] > 80:
        recomendacoes.append("Prazo do Projeto compromete significativamente o prazo do Convênio com riscos do prazo ser insuficiente. Revisar o cronograma e identificar possibilidades de aceleração")

    if detalhes['percentual_prazo'] > 45 and detalhes['percentual_prazo'] < 80:
        recomendacoes.append("Prazo do Projeto compromete razoavelmente o prazo do Convênio. Atenção ao cronograma e identificar possibilidades de aceleração")

    if detalhes['percentual_custo'] > 45 and detalhes['percentual_custo'] < 80:
        recomendacoes.append("Custo do Projeto compromete razoavelmente o custo do Convênio. Atenção ao orçamento e identificar possibilidades de otimização")



    if detalhes['taxa_conclusao'] < 50:
        recomendacoes.append("Reforçar métodos de Gestão para melhorar a Performance do Convênio")

    if detalhes['percentual_prazo'] < 50 and detalhes['percentual_custo'] < 50:
        recomendacoes.append("Indicadores principais em níveis críticos, revisar a gestão do projeto imediatamente")

    if not recomendacoes:
        return "Projeto em bom andamento. Manter as práticas atuais."
    
    return " | ".join(recomendacoes)

@app.post("/avaliar")
async def avaliar_projeto(projeto: ProjetoData):
    try:
        print("\n=== Nova Avaliação de Projeto ===")
        print("Dados recebidos:", projeto.dict())
        
        # Validação adicional dos dados
        if projeto.saldo_convenio <= 0:
            raise ValueError("Saldo do convênio deve ser maior que zero")
        if projeto.prazo_convenio <= 0:
            raise ValueError("Prazo do convênio deve ser maior que zero")
        if projeto.valor_projeto <= 0:
            raise ValueError("Valor do projeto deve ser maior que zero")
        if projeto.prazo_projeto <= 0:
            raise ValueError("Prazo do projeto deve ser maior que zero")
        if not (0 <= projeto.taxa_conclusao <= 100):
            raise ValueError("Taxa de conclusão deve estar entre 0 e 100")
        # Campos opcionais removidos do backend
        # Calcular percentuais
        percentual_custo =  ((projeto.valor_projeto / projeto.saldo_convenio) * 100)
        percentual_prazo = ((projeto.prazo_projeto / projeto.prazo_convenio) * 100)
        
    # Campos opcionais removidos: não computamos eficiência/qualidade

        # Criar e executar sistema fuzzy
        sistema = criar_sistema_fuzzy()
        sistema.input['percentual_custo'] = percentual_custo
        sistema.input['percentual_prazo'] = percentual_prazo
        sistema.input['taxa_conclusao'] = projeto.taxa_conclusao
        
        sistema.compute()
        nivel_sucesso = float(sistema.output['nivel_sucesso'])
        
        detalhes = {
            "percentual_custo": percentual_custo,
            "percentual_prazo": percentual_prazo,
            "taxa_conclusao": projeto.taxa_conclusao
        }
        
        classificacao = get_classificacao(nivel_sucesso)
        recomendacoes = get_recomendacoes(nivel_sucesso, detalhes)

        return {
            "nivel_sucesso": nivel_sucesso,
            "classificacao": classificacao,
            "recomendacoes": recomendacoes,
            "detalhes": detalhes
        }

    except ValueError as ve:
        print("Erro de validação:", str(ve))
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        print("Erro na avaliação:", str(e))
        print("Tipo do erro:", type(e))
        import traceback
        print("Traceback:", traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Erro interno: {str(e)}")


@app.post("/gerar-grafico")
async def gerar_grafico(projeto: ProjetoData):
    try:
        print("\n=== Gerando Gráfico Fuzzy ===")
        
        # Calcular percentuais
        percentual_custo =  ((projeto.valor_projeto / projeto.saldo_convenio) * 100)
        percentual_prazo =  ((projeto.prazo_projeto / projeto.prazo_convenio) * 100)
        
        # Campos opcionais removidos: eficiência/risco não são usados no gráfico
        
        # Criar sistema fuzzy
        sistema = criar_sistema_fuzzy()
        sistema.input['percentual_custo'] = percentual_custo
        sistema.input['percentual_prazo'] = percentual_prazo
        sistema.input['taxa_conclusao'] = projeto.taxa_conclusao
        
        sistema.compute()
        nivel_sucesso_val = sistema.output['nivel_sucesso']
        
        # Criar diretório para gráficos se não existir
        os.makedirs("graficos", exist_ok=True)
        
        # Gerar timestamp para nome único
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        # Criar gráficos simplificados
        fig, axes = plt.subplots(2, 2, figsize=(12, 10))
        fig.suptitle('Sistema Fuzzy - Avaliação de Projeto', fontsize=16, fontweight='bold')
        
        # Criar antecedentes e consequente novamente para plotagem
        # IMPORTANTE: Usar as MESMAS funções de pertinência da função criar_sistema_fuzzy()
        perc_custo = ctrl.Antecedent(np.arange(0, 101, 1), 'percentual_custo')
        perc_prazo = ctrl.Antecedent(np.arange(0, 101, 1), 'percentual_prazo')
        taxa_conclusao_ant = ctrl.Antecedent(np.arange(0, 101, 1), 'taxa_conclusao')
        nivel_sucesso_cons = ctrl.Consequent(np.arange(0, 101, 1), 'nivel_sucesso')
        
        # Funções de pertinência para percentual do saldo (MESMAS DA criar_sistema_fuzzy)
        perc_custo['baixo'] = fuzz.trimf(perc_custo.universe, [0, 2, 45])
        perc_custo['medio'] = fuzz.gaussmf(perc_custo.universe, 50, 25)
        perc_custo['alto'] = fuzz.trapmf(perc_custo.universe, [60, 80, 90, 100])
        
        # Funções de pertinência para percentual do prazo (MESMAS DA criar_sistema_fuzzy)
        perc_prazo['baixo'] = fuzz.gaussmf(perc_prazo.universe, 0, 25)
        perc_prazo['medio'] = fuzz.gaussmf(perc_prazo.universe, 50, 15)
        perc_prazo['alto'] = fuzz.gaussmf(perc_prazo.universe, 100, 25)
        
        # Funções de pertinência para taxa de conclusão (MESMAS DA criar_sistema_fuzzy)
        taxa_conclusao_ant['baixa'] = fuzz.trapmf(taxa_conclusao_ant.universe, [0, 0, 30, 50])
        taxa_conclusao_ant['media'] = fuzz.trimf(taxa_conclusao_ant.universe, [30, 50, 70])
        taxa_conclusao_ant['alta'] = fuzz.trapmf(taxa_conclusao_ant.universe, [50, 70, 100, 100])
        
        # Funções de pertinência para nível de sucesso (MESMAS DA criar_sistema_fuzzy)
        nivel_sucesso_cons['muito_baixo'] = fuzz.trimf(nivel_sucesso_cons.universe, [0, 0, 25])
        nivel_sucesso_cons['baixo'] = fuzz.trimf(nivel_sucesso_cons.universe, [0, 25, 50])
        nivel_sucesso_cons['moderado'] = fuzz.trimf(nivel_sucesso_cons.universe, [25, 50, 75])
        nivel_sucesso_cons['alto'] = fuzz.trimf(nivel_sucesso_cons.universe, [50, 75, 100])
        nivel_sucesso_cons['muito_alto'] = fuzz.trimf(nivel_sucesso_cons.universe, [75, 100, 100])
        
        # Plot 1: Percentual Custo
        ax = axes[0, 0]
        ax.plot(perc_custo.universe, perc_custo['baixo'].mf, 'b', linewidth=1.5, label='Baixo')
        ax.plot(perc_custo.universe, perc_custo['medio'].mf, 'g', linewidth=1.5, label='Médio')
        ax.plot(perc_custo.universe, perc_custo['alto'].mf, 'r', linewidth=1.5, label='Alto')
        ax.axvline(x=percentual_custo, color='orange', linestyle='--', linewidth=2, label='Valor atual')
        ax.set_title('Percentual do Custo do Projeto')
        ax.set_xlabel('Percentual (%)')
        ax.set_ylabel('Pertinência')
        ax.legend()
        ax.grid(True, alpha=0.3)
        
        # Plot 2: Percentual Prazo
        ax = axes[0, 1]
        ax.plot(perc_prazo.universe, perc_prazo['baixo'].mf, 'b', linewidth=1.5, label='Baixo')
        ax.plot(perc_prazo.universe, perc_prazo['medio'].mf, 'g', linewidth=1.5, label='Médio')
        ax.plot(perc_prazo.universe, perc_prazo['alto'].mf, 'r', linewidth=1.5, label='Alto')
        ax.axvline(x=percentual_prazo, color='orange', linestyle='--', linewidth=2, label='Valor atual')
        ax.set_title('Percentual do Prazo do Projeto')
        ax.set_xlabel('Percentual (%)')
        ax.set_ylabel('Pertinência')
        ax.legend()
        ax.grid(True, alpha=0.3)
        
        # Plot 3: Taxa de Conclusão
        ax = axes[1, 0]
        ax.plot(taxa_conclusao_ant.universe, taxa_conclusao_ant['baixa'].mf, 'b', linewidth=1.5, label='Baixa')
        ax.plot(taxa_conclusao_ant.universe, taxa_conclusao_ant['media'].mf, 'g', linewidth=1.5, label='Média')
        ax.plot(taxa_conclusao_ant.universe, taxa_conclusao_ant['alta'].mf, 'r', linewidth=1.5, label='Alta')
        ax.axvline(x=projeto.taxa_conclusao, color='orange', linestyle='--', linewidth=2, label='Valor atual')
        ax.set_title('Taxa de Conclusão')
        ax.set_xlabel('Taxa (%)')
        ax.set_ylabel('Pertinência')
        ax.legend()
        ax.grid(True, alpha=0.3)
        
        # Plot 4: Nível de Sucesso (Saída)
        ax = axes[1, 1]
        ax.plot(nivel_sucesso_cons.universe, nivel_sucesso_cons['muito_baixo'].mf, 'darkred', linewidth=1.5, label='Muito Baixo')
        ax.plot(nivel_sucesso_cons.universe, nivel_sucesso_cons['baixo'].mf, 'red', linewidth=1.5, label='Baixo')
        ax.plot(nivel_sucesso_cons.universe, nivel_sucesso_cons['moderado'].mf, 'yellow', linewidth=1.5, label='Moderado')
        ax.plot(nivel_sucesso_cons.universe, nivel_sucesso_cons['alto'].mf, 'lightgreen', linewidth=1.5, label='Alto')
        ax.plot(nivel_sucesso_cons.universe, nivel_sucesso_cons['muito_alto'].mf, 'green', linewidth=1.5, label='Muito Alto')
        ax.axvline(x=nivel_sucesso_val, color='orange', linestyle='--', linewidth=3, label=f'Resultado: {nivel_sucesso_val:.1f}%')
        ax.set_title('Nível de Sucesso do Projeto (Saída)')
        ax.set_xlabel('Nível de Sucesso (%)')
        ax.set_ylabel('Pertinência')
        ax.legend()
        ax.grid(True, alpha=0.3)
        
        plt.tight_layout()
        
        # Salvar arquivo
        file_path = f"graficos/grafico_fuzzy_{timestamp}.png"
        plt.savefig(file_path, dpi=150, bbox_inches='tight')
        plt.close(fig)
        
        print(f"Gráfico salvo em: {file_path}")
        
        return {
            "file_path": file_path,
            "timestamp": timestamp,
            "message": "Gráfico gerado com sucesso"
        }
        
    except Exception as e:
        print("Erro ao gerar gráfico:", str(e))
        import traceback
        print("Traceback:", traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Erro ao gerar gráfico: {str(e)}")


@app.get("/download-grafico/{filename}")
async def download_grafico(filename: str):
    try:
        file_path = f"graficos/{filename}"
        if os.path.exists(file_path):
            return FileResponse(
                path=file_path,
                filename=filename,
                media_type="image/png"
            )
        else:
            raise HTTPException(status_code=404, detail="Arquivo não encontrado")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
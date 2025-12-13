# 🤖 Recrutador-IA

> **O seu Headhunter Pessoal movido a Inteligência Artificial.**

O **Recrutador-IA** é uma API Backend robusta desenvolvida com **Node.js**, **TypeScript** e **Clean Architecture**. O objetivo é automatizar a busca de emprego: o sistema lê seu currículo (PDF), entende suas habilidades, busca vagas reais na internet (LinkedIn, Gupy, Greenhouse) e usa Inteligência Artificial para filtrar apenas as oportunidades que realmente dão "Match" com seu perfil.

---

## 🚀 Funcionalidades Principais

- **📄 Leitura de Currículo (PDF):** Utiliza a biblioteca `pdf-extraction` para converter arquivos PDF em texto bruto.
- **🧠 Extração de Perfil (AI):** O **Google Gemini** analisa o texto e extrai:
  - Cargo Sugerido (Role)
  - Senioridade (Junior/Pleno/Senior)
  - Tech Stack (Keywords)
  - Localização e Idiomas
- **🔎 Busca "Premium" (Google Dorking):** Ao invés de feeds limitados, utilizamos a API do Google para buscar vagas diretamente no **LinkedIn**, **Gupy**, **Programathor** e **Greenhouse** em tempo real.
- **🎯 Match Inteligente (AI Filter):** A IA lê a descrição de cada vaga encontrada e dá uma nota (0-100%) de compatibilidade, aplicando filtros de:
  - **Domínio:** (Backend não recebe vaga de Frontend).
  - **Geolocalização:** (Filtra vagas que não aceitam BR/LatAm).
  - **Senioridade:** (Junior não recebe vaga Sênior/Lead).

---

## 🛠️ Stack Tecnológica

- **Linguagem:** TypeScript
- **Runtime:** Node.js (v18+)
- **Web Framework:** Express
- **AI Model:** Google Gemini 1.5 Flash Lite (`gemini-flash-lite-latest`)
- **Search Engine:** Google Custom Search API
- **Design Patterns:** Clean Architecture, DDD, Strategy Pattern.

---

## 🏗️ Estrutura do Projeto

```text
src/
├── config/                  # Configurações externas
├── modules/                 # 📦 MÓDULOS DE NEGÓCIO (DDD)
│   └── candidates/          # Contexto de Candidatos
│       ├── dtos/            # Interfaces de Entrada
│       ├── infra/           # Camada Web (Controllers)
│       └── useCases/        # ❤️ Regra de Negócio (Fluxo Principal)
│
├── shared/                  # 🔧 FERRAMENTAS
│   ├── container/           # Injeção de Dependência
│   └── infra/               # Configuração do Server
│       └── providers/       # Plugins Externos
│           ├── AIProvider/  # Google Gemini
│           └── JobProvider/ # Google Custom Search


# 🧠 Recrutador IA --- Análise Inteligente de Currículos

Projeto que utiliza **IA (Gemini)** + **Busca Google** para analisar
currículos, buscar vagas relevantes automaticamente e gerar um ranking
inteligente com base no perfil do candidato.

## 📦 Instalação e Configuração

### 1. Pré-requisitos

-   **Node.js v18+**
-   **Gemini API Key** --- Obtenha em:
    https://aistudio.google.com/app/apikey\
-   **Google Search API Key** --- Ative a *Custom Search API* no Google
    Cloud Console\
-   **Search Engine ID (CX)** --- Configure um buscador em *Programmable
    Search Engine* com: **Pesquisar em toda a web**

### 2. Instalação

``` bash
git clone https://github.com/seu-usuario/recrutador-ia.git
cd recrutador-ia
npm install
```

### 3. Configuração (.env)

Crie um arquivo `.env` na raiz do projeto:

``` env
PORT=3333

# Chave da IA (Cérebro)
GEMINI_API_KEY=Cole_Sua_Chave_Gemini_Aqui

# Chaves de Busca (Olhos)
GOOGLE_SEARCH_API_KEY=Cole_Sua_Chave_Cloud_Aqui
GOOGLE_SEARCH_ENGINE_ID=Cole_Seu_CX_ID_Aqui
```

### 4. Rodar o Projeto

``` bash
npm run dev
```

## 🔌 Documentação da API

### Analisar Candidato --- POST /candidates/analyze

Formato: **Multipart Form-Data**

### Parâmetros

  Campo       Obrigatório   Descrição
  ----------- ------------- --------------------------------------
  file        ✅            Arquivo PDF do currículo
  limit       ❌            Máx. de vagas retornadas (padrão 10)
  daysAgo     ❌            Vagas dos últimos X dias (padrão 30)
  seniority   ❌            Força uma senioridade (ex: "Junior")

### Exemplo de Resposta

``` json
{
  "candidato": {
    "cargo_detectado": "Desenvolvedor Backend",
    "senioridade_alvo": "Junior",
    "localizacao": "Brazil"
  },
  "estatisticas": {
    "vagas_encontradas_google": 10,
    "vagas_aprovadas_ia": 2
  },
  "ranking_vagas": [
    {
      "jobTitle": "Backend Developer Node.js",
      "company": "Tech Start",
      "link": "https://www.linkedin.com/jobs/view/...",
      "source": "LinkedIn",
      "matchPercentage": 95,
      "reason": "Vaga Junior, Remota, Stack Node+AWS compatível."
    }
  ]
}
```

## 📝 Licença

Projeto desenvolvido para fins de estudo.

# 🤖 Recrutador-IA

> **Seu Headhunter Pessoal movido a Inteligência Artificial.**

O **Recrutador-IA** é uma API Backend desenvolvida com **Node.js**, **TypeScript** e **Clean Architecture**. O sistema lê seu currículo (PDF), gera uma busca inteligente de vagas e usa IA para filtrar apenas as oportunidades com alto potencial de "Match".

---

## 🚀 Funcionalidades Principais

- **📄 Leitura de Currículo (PDF):** Extrai texto do PDF em memória para análise.
- **🧠 IA (Mistral):**
  - Gera queries Boolean para busca com frescor (usa `after:YYYY-MM-DD`).
  - Analisa cada vaga encontrada e atribui um percentual de compatibilidade.
- **🔎 Busca de Vagas (Tavily):** Faz busca avançada na web (LinkedIn, Gupy, Programathor, etc.) com filtro por recência.
- **🎯 Ranking de Vagas:** Retorna lista de oportunidades com `matchPercentage`, motivo e indicação se é remoto.

---

## 🛠️ Stack Tecnológica

- **Linguagem:** TypeScript
- **Runtime:** Node.js (v18+)
- **Web Framework:** Express
- **IA:** Mistral (`mistral-small`)
- **Busca:** Tavily Web Search API
- **Arquitetura:** Clean Architecture, DDD, Strategy Pattern.

---

## 🏗️ Estrutura do Projeto

```text
src/
├── config/                  # Configuração de ambiente (dotenv + zod)
├── modules/                 # 📦 Módulos de negócio (DDD)
│   └── recruiter/           # Contexto de Recrutamento
│       ├── infra/           # Camada Web (Controllers, Rotas)
│       └── useCases/        # Fluxos de aplicação (FindJobs)
│
├── shared/                  # 🔧 Infra compartilhada
│   ├── container/           # Injeção de dependências (tsyringe)
│   └── infra/               # App/Server e Providers
│       └── providers/
│           ├── AIProvider/      # MistralProvider
│           └── SearchProvider/  # TavilySearchProvider


# 🧠 Recrutador IA --- Análise Inteligente de Currículos

Projeto que utiliza **IA (Mistral)** + **Busca Tavily** para analisar
currículos, buscar vagas relevantes automaticamente e gerar um ranking
inteligente com base no perfil do candidato.

## 📦 Instalação e Configuração

### 1. Pré-requisitos

- **Node.js v18+**
- **Mistral API Key** — Obtenha em https://console.mistral.ai/
- **Tavily API Key** — Obtenha em https://tavily.com/

### 2. Instalação

``` bash
git clone https://github.com/aleviannaf/recruter-ai.git
cd recruter-ai
npm install
```

### 3. Configuração (.env)

Crie um arquivo `.env` na raiz do projeto:

``` env
NODE_ENV=dev
PORT=3333

# IA: Mistral
MISTRAL_API_KEY=Sua_Chave_Mistral_Aqui

# Busca: Tavily
TAVILY_API_KEY=Sua_Chave_Tavily_Aqui
```

### 4. Rodar o Projeto

``` bash
npm run dev
```

## 🔌 Documentação da API

### Encontrar Vagas — POST /recruiter/find-jobs

Formato: **Multipart Form-Data**

### Parâmetros

  - `file` (obrigatório): arquivo PDF do currículo
  - `seniority` (opcional): força uma senioridade (`Junior`, `Pleno`, `Senior`)
  - `daysAgo` (opcional): filtra vagas dos últimos X dias (padrão 7)
  - `onlyRemote` (opcional): `true`/`false` para priorizar vagas remotas
  - `location` (opcional): cidade/estado para direcionar a busca (ex.: `Manaus`)

### Exemplo de Resposta

``` json
{
  "metadata": {
    "analyzed": 10,
    "approved": 3,
    "queryUsed": "Vaga (Node OR Node.js) Pleno Brasil after:2025-12-12"
  },
  "jobs": [
    {
      "jobTitle": "Backend Developer Node.js",
      "company": "Tech Start",
      "link": "https://www.linkedin.com/jobs/view/...",
      "source": "LinkedIn",
      "matchPercentage": 92,
      "reason": "Stack Node + AWS. Vaga Pleno. Remoto para BR.",
      "salary": "Não informado",
      "isRemote": true
    }
  ]
}
```

## 📝 Licença

Projeto desenvolvido para fins de estudo.

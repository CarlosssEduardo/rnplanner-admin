# 💻 RN Planner - Admin Dashboard

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
![Azure](https://img.shields.io/badge/azure-%230072C6.svg?style=for-the-badge&logo=microsoftazure&logoColor=white)

> **Painel Gerencial (Backoffice) para monitoramento global de KPIs e administração do ecossistema RN Planner.**

## 📖 Sobre o Projeto

O **Admin Dashboard** é a interface web voltada para a gerência e liderança comercial. Enquanto os Representantes de Negócios utilizam a versão Web Mobile no campo, os gestores utilizam este portal para ter uma visão macro e estratégica da operação.

A plataforma permite visualizar o atingimento de metas do time, monitorar o volume de vendas e gerenciar cadastros sensíveis (como novos PDVs e parametrização de metas), fechando o ciclo do fluxo de dados corporativo.

---

## 🚀 Tecnologias e Arquitetura

* **Biblioteca UI:** React.js
* **Build Tool:** Vite
* **Linguagem:** JavaScript (ES6+) e JSX
* **Roteamento:** React Router DOM
* **Integração HTTP:** Axios (com interceptores para segurança/tokens)
* **Estilização:** CSS3 (Layout Responsivo para Desktop)
* **Deploy:** Microsoft Azure (Static Web Apps)

---

## ⚡ Funcionalidades Principais (Visão Gerencial)

* **Visão 360º de Performance:** Painéis consolidados exibindo a somatória das Tasks, Ofertas e Missões executadas pelo time de campo.
* **Gestão de PDVs (CRUD):** Interface administrativa para criação, leitura, atualização e inativação de Pontos de Venda na base de dados PostgreSQL.
* **Monitoramento de Acordos:** Visão global das pendências registradas nos clientes (PDVs), permitindo que a liderança auxilie no destravamento de negociações críticas.
* **Segurança e Acessos:** Interface protegida, consumindo rotas da API que exigem nível hierárquico adequado para visualização e edição de metas globais.

---

## 🛠️ Como executar localmente

### Pré-requisitos
* Node.js instalado (v16 ou superior)
* NPM ou Yarn

### Passos para rodar:

1. **Clone este repositório:**
   ```bash
   git clone https://github.com/CarlosssEduardo/rnplanner-admin.git
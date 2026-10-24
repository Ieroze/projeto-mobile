# Comece aqui - Codex

Voce esta trabalhando no **Gatos da Corte V2**.

## Contexto

O projeto anterior foi um prototipo React Web gerado pelo Figma Make. O V2 e uma reimplementacao limpa em React Native + TypeScript, usando o prototipo apenas como referencia visual e funcional.

## Arquitetura escolhida

```text
React Native (Expo)
       |
       | REST/JSON (futuro)
       v
FastAPI (Python)
       |
       v
PostgreSQL
```

Nesta fase, o frontend usa mocks locais.

## Primeira tarefa sugerida

1. Rode o app e confirme que a navegacao funciona.
2. Revise `src/theme` e padronize todos os componentes com esses tokens.
3. Trabalhe primeiro na Home e na lista de gatos.
4. Em seguida refine o perfil do gato.
5. Depois implemente o formulario de adocao com validacao local.
6. So depois substitua mocks por services HTTP quando a API existir.

## Prompt sugerido para a primeira sessao

> Analise este repositorio antes de modificar arquivos. Preserve a arquitetura existente. O frontend e React Native + TypeScript com Expo e React Navigation. Os dados ainda sao mocks locais. Nao implemente backend e nao conecte PostgreSQL ao app. Primeiro execute uma revisao da estrutura, identifique problemas pequenos de build/tipagem e proponha um plano incremental. Depois implemente apenas a primeira tarefa aprovada.

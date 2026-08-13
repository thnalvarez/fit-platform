# Contexto permanente do produto

Este documento registra decisões de produto já fechadas para evitar que sejam reabertas ou perguntadas novamente sem conflito técnico real ou nova exigência.

## Produto

O fit-platform é um aplicativo de acompanhamento de treino, nutrição, progresso e saúde.

O produto não deve se apresentar como “treino gerado por IA”. A inteligência artificial funciona nos bastidores e não deve ser destacada na comunicação ao usuário.

- Área de treinamento: **Meu Treino**.
- Serviço: **Programa Personalizado**.

## Principais pilares

- Hoje
- Meu Treino
- Nutrição
- Progresso
- Health e wearables
- Assessoria futura

## Treinamento

Estão definidos conceitualmente:

- programa personalizado;
- registro de séries, repetições e cargas;
- progressão;
- cronômetro;
- substituição de exercícios;
- treino livre;
- histórico;
- check-in;
- medidas;
- fotos privadas opcionais;
- integração com HealthKit e Health Connect;
- programa externo de personal trainer.

## Nutrição

Estão definidos conceitualmente:

- plano alimentar personalizado;
- horários;
- substituições;
- lembretes;
- registro;
- lista de compras;
- plano externo de nutricionista;
- check-in integrado.

## Profissionais — futuro

- personal trainers;
- nutricionistas;
- marketplace;
- assessoria;
- painel profissional;
- pagamentos;
- comissão;
- chat.

Esses recursos não fazem parte do primeiro desenvolvimento imediato do core.

## Onboarding planejado

1. Sobre você
2. Objetivo
3. Rotina e disponibilidade
4. Experiência
5. Local e equipamentos
6. Preferências
7. Limitações e cuidados
8. Medidas opcionais
9. Fotos opcionais
10. Health e dispositivos opcionais
11. Revisão
12. Finalização

## Decisões de UX

- Trabalhar mobile-first.
- Evitar campos de texto quando uma seleção for possível.
- Fotos e medidas adicionais são opcionais.
- Fotos são privadas por padrão.
- Integração Health é opcional.
- Um programa externo deve ser suportado futuramente.
- IA não deve ser destacada na comunicação ao usuário.

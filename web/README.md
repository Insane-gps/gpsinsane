# INSANE GPS Web (Next.js + Firebase)

Modulo web separado do app Expo, usando o mesmo projeto Firebase/Firestore.

## O que esta incluido

- Pagina inicial publica com CTA para carona/entrega.
- Login com Firebase Auth:
  - Google
  - E-mail e senha
- Pagina de ofertas ativas em Firestore (colecao ofertas).
- Solicitacao de reserva sem duplicar usuario na mesma oferta.
- Chat web compativel com o mobile em ofertas/{ofertaId}/mensagens.
- Criacao de oferta com mesmo formato base do app.
- Gate de recurso Premium para criar oferta publica.

## Estrutura

- src/app/page.tsx: landing publica
- src/app/login/page.tsx: autenticacao
- src/app/ofertas/page.tsx: listagem + reserva + chat
- src/app/criar-oferta/page.tsx: criacao de oferta (Premium)
- src/lib/firebase.ts: inicializacao Firebase Web

## Variaveis de ambiente

Copie .env.example para .env.local e preencha:

- NEXT_PUBLIC_FIREBASE_API_KEY
- NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
- NEXT_PUBLIC_FIREBASE_PROJECT_ID
- NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
- NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
- NEXT_PUBLIC_FIREBASE_APP_ID

As variaveis NEXT_PUBLIC sao publicas por natureza no frontend. Nao inclua chaves privadas/admin.

## Rodando local

1. Entre na pasta web
2. Instale dependencias
3. Rode em desenvolvimento

Comandos:

npm install
npm run dev

## Build

npm run build
npm run start

## Deploy na Vercel

1. Suba o repositorio para GitHub.
2. Na Vercel, clique em Add New Project.
3. Selecione este repositorio.
4. Configure Root Directory como web.
5. Adicione as variaveis NEXT_PUBLIC_FIREBASE_* no painel de Environment Variables.
6. Deploy.

## Dominio www.insane.com na Vercel

1. Abra o projeto na Vercel.
2. Entre em Settings > Domains.
3. Adicione www.insane.com.
4. A Vercel exibira os registros DNS necessarios (normalmente CNAME de www para cname.vercel-dns.com).
5. No provedor DNS do dominio insane.com, crie/atualize os registros solicitados.
6. Aguarde propagacao e valide HTTPS ativo.

## Observacoes de compatibilidade

- Este modulo nao altera o app mobile.
- Usa a mesma colecao ofertas e a subcolecao mensagens.
- Logica de planos foi mantida conservadora: Free solicita; Premium cria oferta publica.
- Se regras de assinatura mudarem no mobile, alinhar src/lib/plan.ts antes de liberar producao.

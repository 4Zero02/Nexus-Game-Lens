# NGL — Nexus Game Lens

App desktop Electron para HUDs de observer em eventos de e-sports ao vivo.
Captura dados dos jogos localmente e serve overlays via HTTP para Browser Source no OBS.

Projeto da **[Nexus Elite](https://github.com/4Zero02)** — empresa de produção de torneios de e-sports.

---

## Contexto de uso

```
[PC do Jogo — roda NGL]          [PC da Live — roda OBS]
  CS2 / LoL / Valorant     →      Browser Source
  NGL (Electron + Express)        http://[IP]:8765/output/cs2-hud
  porta 8765 exposta na rede      http://[IP]:8765/output/lol-hud
                                  http://[IP]:8765/output/valorant-hud
```

O NGL roda no mesmo PC do jogo porque as APIs locais de LoL e Valorant (`localhost:2999`) só respondem na mesma máquina onde o jogo está rodando.

---

## Jogos suportados

| Jogo | Status | Integração |
|------|--------|------------|
| CS2 | ✅ Funcional | Game State Integration (GSI) — POST na porta 8765 |
| League of Legends | 🚧 Em breve | Polling `localhost:2999` |
| Valorant | 🚧 Em breve | Polling `localhost:2999` |

---

## Instalação (Windows)

1. Baixe o instalador `.exe` na [página de releases](https://github.com/4Zero02/Nexus-Game-Lens/releases)
2. Execute o instalador e siga o assistente
3. O NGL aparece na bandeja do sistema após iniciar

---

## Configuração CS2 — GSI

Crie o arquivo `gamestate_integration_ngl.cfg` dentro da pasta de configurações do CS2:

```
C:\Program Files (x86)\Steam\steamapps\common\Counter-Strike Global Offensive\game\csgo\cfg\
```

Conteúdo do arquivo:

```
"NGL - Nexus Game Lens"
{
  "uri"              "http://127.0.0.1:8765/gsi/cs2"
  "timeout"          "5.0"
  "heartbeat"        "10.0"
  "buffer"           "0.1"
  "throttle"         "0.1"
  "data"
  {
    "map"            "1"
    "round"          "1"
    "player_id"      "1"
    "allplayers_id"  "1"
    "allplayers_state"  "1"
    "allplayers_match_stats" "1"
    "allplayers_weapons" "1"
    "bomb"           "1"
    "phase_countdowns" "1"
  }
}
```

Após configurar, reinicie o CS2. O painel do NGL mostrará CS2 como **Conectado** assim que uma partida iniciar.

---

## Configuração OBS

1. Adicione uma **Browser Source** na cena
2. Defina a URL para o overlay desejado:
   - CS2: `http://[IP-DO-PC-DO-JOGO]:8765/output/cs2-hud`
3. Resolução: **1920×1080** (overlay em tela cheia transparente)
4. Marque **"Shutdown source when not visible"** para economizar recursos

---

## Desenvolvimento

### Pré-requisitos

- [Node.js](https://nodejs.org) 20+
- [pnpm](https://pnpm.io) 10+

### Instalação

```bash
pnpm install
```

### Modo desenvolvimento

```bash
pnpm dev
```

Inicia o Vite em modo watch para o painel e os overlays, depois abre o Electron automaticamente.

### Build

```bash
pnpm build
```

Gera o instalador em `release/`.

---

## Publicar uma nova versão

1. Atualize o `"version"` no `package.json`
2. Commit e push das alterações
3. Crie e envie a tag:
   ```bash
   git tag v1.1.0
   git push origin v1.1.0
   ```
4. O GitHub Actions cria automaticamente o release com os instaladores Windows e Linux

---

## Stack técnica

| Camada | Tecnologia |
|--------|------------|
| Desktop | Electron |
| Servidor | Node.js + Express |
| Tempo real | Socket.io |
| Frontend | React + Vite |
| Estilização UI | Tailwind CSS + CSS custom |
| Componentes UI | shadcn/ui (base) |
| Estilização HUD | CSS Modules |
| Empacotamento | electron-builder |
| Package manager | pnpm |

---

## Estrutura do projeto

```
ngl/
├── electron/         ← processo principal, preload, tray, auto-update
├── server/           ← Express + Socket.io, integrações por jogo
│   ├── gsi/          ← parser e coordenadas do CS2
│   └── integrations/ ← cs2.js, lol.js, valorant.js
├── client/
│   ├── panel/        ← painel de controle (janela Electron)
│   └── output/       ← overlays servidos ao OBS
├── assets/           ← ícone do app, assets por jogo
└── package.json
```

---

## Licença

Propriedade da **Nexus Elite**. Todos os direitos reservados.

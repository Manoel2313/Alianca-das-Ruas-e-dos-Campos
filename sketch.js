  // ================= VARIÁVEIS GLOBAIS =================
// Variável que controla qual tela está sendo exibida (menu, mapa, boss, etc)
let tela = "menu";
// Objeto que representa o jogador
let player;
// Objeto para controlar teclas pressionadas
// Array de sprites dos NPCs
let npcSprites = [];
// Array de tiros do player
let tiros = [];
// Cooldown para evitar tiros em excesso
let cooldownTiro = 0;
// Array de tiros do boss
let tirosBoss = [];
// Cooldown dos tiros do boss
let cooldownTiroBoss = 3000;
// Variável para efeito de piscar do boss ao tomar dano
let bossPISCA = 0;
// Referência para o boss atual
let bossAtual = null;
// Sprites dos bosses organizados por tipo e ação
let bossSprites = {
    corvo: { idle: [], ataque1: [], ataque2: [] },
    arvore: { idle: [], ataque1: [] },
    touro: { idle: [], ataque1: [], ataque2: [] }
};
// Imagem de fundo da luta de boss
let bossBackground;
// Sprites do player para cada direção e para o projétil
let playerSprites = { direita: [], esquerda: [], cima: [], baixo: [], projetil: [] };
// Inventário do jogador, com moedas, vida, dano e recursos
let inventario = { moedas: 0, vida: 3, dano: 1, madeira: 0, bife: 0, milho: 0, medalhas: 0 };
// Vida máxima do player
let vidaMax = inventario.vida;
// Dano base do player
let dano = 1;
// Vida do boss (atualizada a cada luta)
let bossVida = 1;
// Imagens das placas de vida e dano no mercado
let imgPlacaVida, imgPlacaDano;
// Posições das placas no mercado
let placaVidaX, placaVidaY, placaDanoX, placaDanoY;
// Tamanho das placas
let placaLargura = 200;
let placaAltura = 200;
// Imagem do coração (vida)
let coracaoImg = null;
// Mensagens de limite de vida/dano no mercado
let mensagemVidaMax = "";
let mensagemDanoMax = "";
// Controle do diálogo do Empressario
let empressarioFalaParte = 1;
let empressarioFalaTimer = 0;
let empressarioPlayerPerto = false;
// Timers para animações de finais/contrato
let contratoTimer = 0;
let contratoMostrandoCarregando = false;
let jornalTimer = 0;
let jornalMostrandoCarregando = false;
let laranjaTimer = 0;
let laranjaMostrandoCarregando = false;
// Controle de digitação animada dos textos finais
let contratoTypeIndex = 0, contratoTypeTimer = 0, contratoTypeDone = false;
let jornalTypeIndex = 0, jornalTypeTimer = 0, jornalTypeDone = false;
let laranjaTypeIndex = 0, laranjaTypeTimer = 0, laranjaTypeDone = false;
// Velocidade da digitação animada
const typeSpeed = 30;
// Lista de NPCs do jogo, com posição, tipo e área
let npcs = [
    { x: 550, y: 450, spriteIndex: 0, nome: "Fazendeiro", tipo: "fazendeiro", tempoAnim: 0, area: "campo" },
    { x: 550, y: 300, spriteIndex: 0, nome: "Cowboy", tipo: "cowboy", tempoAnim: 0, area: "campo" },
    { x: 550, y: 150, spriteIndex: 0, nome: "Lenhador", tipo: "lenhador", tempoAnim: 0, area: "campo" },
    { x: 280, y: 110, spriteIndex: 0, nome: "Empressario", tipo: "empressario", tempoAnim: 0, area: "cidade" }
];
// Variável para controlar se pode interagir com estruturas
let podeInteragir = true;

// Estruturas do jogo (mercado, fábrica, etc)
let estruturas = [
    // ——— CIDADE ———
    {
        nome: "Mercado",
        x: 100,
        y: 10,
        tipo: "mercado",
        area: "cidade",
        img: null,
        arquivo: "Imagem/Estruturas/pixil-frame-0.png"
    },
    {
        nome: "Fábrica",
        x: 10,
        y: 130,
        tipo: "fabrica",
        area: "cidade",
        img: null,
        arquivo: "Imagem/Estruturas/pixil-frame-1.png"
    },
    {
        nome: "Açougue",
        x: 220,
        y: 400,
        tipo: "acougue",
        area: "cidade",
        img: null,
        arquivo: "Imagem/Estruturas/pixil-frame-2.png"
    },
    {
        nome: "Feira",
        x: 1,
        y: 300,
        tipo: "feira",
        area: "cidade",
        img: null,
        arquivo: "Imagem/Estruturas/pixil-frame-3.png"
    },
    // ——— CAMPO ———
    {
        nome: "Serraria",
        x: 600,
        y: 30,
        tipo: "serraria",
        area: "campo",
        img: null,
        arquivo: "Imagem/Estruturas/pixil-frame-5.png"
    },
    {
        nome: "Criação de Gado",
        x: 600,
        y: 230,
        tipo: "gado",
        area: "campo",
        img: null,
        arquivo: "Imagem/Estruturas/pixil-frame-6.png"
    },
    {
        nome: "Plantação",
        x: 600,
        y: 400,
        tipo: "plantacao",
        area: "campo",
        img: null,
        arquivo: "Imagem/Estruturas/pixil-frame-7.png"
    }
];

// Hitboxes das estruturas (usadas para colisão)
const mercadoSpriteW = 180, mercadoSpriteH = 200;
const mercadoHitbox = {
    x: 100 + mercadoSpriteW * 0.35,
    y: 10 + mercadoSpriteH * 0.35,
    width: mercadoSpriteW * 0.3,
    height: mercadoSpriteH * 0.3
};
// Fábrica
const fabricaSpriteW = 160, fabricaSpriteH = 180;
const fabricaHitbox = {
    x: 10 + fabricaSpriteW * 0.35,
    y: 130 + fabricaSpriteH * 0.35,
    width: fabricaSpriteW * 0.3,
    height: fabricaSpriteH * 0.3
};
// Feira
const feiraSpriteW = 160, feiraSpriteH = 240;
const feiraHitbox = {
    x: 1 + feiraSpriteW * 0.35,
    y: 300 + feiraSpriteH * 0.35,
    width: feiraSpriteW * 0.3,
    height: feiraSpriteH * 0.3
};
// Açougue
const acougueSpriteW = 200 * 1.1, acougueSpriteH = 220 * 1.1;
const acougueOffsetX = 200 * 0.25;
const acougueX = 220 - acougueOffsetX;
const acougueY = 400;
const acougueHitbox = {
    x: acougueX + acougueSpriteW * 0.425,
    y: acougueY + acougueSpriteH * 0.425,
    width: acougueSpriteW * 0.15,
    height: acougueSpriteH * 0.15
};
// Serraria
const serrariaSpriteW = 180, serrariaSpriteH = 180;
const serrariaHitbox = {
    x: 600 + serrariaSpriteW * 0.35,
    y: 30 + serrariaSpriteH * 0.35,
    width: serrariaSpriteW * 0.3,
    height: serrariaSpriteH * 0.3
};
// Gado
const gadoSpriteW = 180, gadoSpriteH = 180;
const gadoHitbox = {
    x: 600 + gadoSpriteW * 0.35,
    y: 230 + gadoSpriteH * 0.35,
    width: gadoSpriteW * 0.3,
    height: gadoSpriteH * 0.3
};
// Plantação
const plantacaoSpriteW = 180, plantacaoSpriteH = 180;
const plantacaoHitbox = {
    x: 600 + plantacaoSpriteW * 0.35,
    y: 400 + plantacaoSpriteH * 0.35,
    width: plantacaoSpriteW * 0.3,
    height: plantacaoSpriteH * 0.3
};

// Variáveis globais para animação do menu
let menuNPCFrame = 0;
let menuNPCAnimTimer = 0;
let menuBossFrame = 0;
let menuBossAnimTimer = 0;

// Variáveis para efeito de digitação do tutorial
let tutorialMsgs = [
    "Movimento --> WASD!",
    "Abrir Inventario --> Tecla Q",
    "Interação (NPCs e Estruturas) --> Tecla E!",
    "Disparar projeteis --> Clique o Mouse! (mira com a seta do Mouse..)",
    "Abrir Tela de Quest --> Tecla M!",
 "Pular Dialogos --> Tecla R!",
];
let tutorialTypeIndex = 0;
let tutorialTypeTimer = 0;
let tutorialTypeDone = false
const tutorialTypeSpeed = 30;

// Variável para controlar se a tela de Quest está aberta
let questAberta = false;

// Variável para controlar se a recompensa da quest já foi dada
let questBossRewardGiven = false;

// Variáveis para controle de bosses derrotados (independente do inventário)
let bossCorvoDerrotado = false;
let bossArvoreDerrotado = false;
let bossTouroDerrotado = false;

// Variável para controle da quest de aprimoramentos
let questUpgradeRewardGiven = false;

// Falas dos NPCs do campo
const npcFalas = {
    fazendeiro: [
        "Cuide bem das plantações!",
        "O corvo anda aprontando por aqui..."
    ],
    lenhador: [
        "As árvores são nossa riqueza!",
        "Cuida bem da Floresta!"
        
        
    ],
    cowboy: [
         "A vida no campo é dura, parceiro!",
        "Os Bois estão agitados.."
        
    ]
};

// Imagens finais
let imgFinalContrato, imgFinalJornal;
let finalImagemIndex = 0;
let finalImagemTimer = 0;
const finalImagemDuracao = 12000; // 12 segundos
let finalImagemPisca = false;
let finalImagemPiscaTimer = 0;
const finalImagemPiscaDuracao = 1000; // 1 segundo
let finalImagemShake = 20; // intensidade do tremor

// Controle de delay para Game Over
let gameOverDelay = 0;
let gameOverPodeVoltar = false;

// Controle de terremoto global para dano do player
let terremotoBossTimer = 0;
const terremotoBossDuracao = 500; // 0.5 segundo
let terremotoBossIntensidade = 20;

// Adicionar variável para controlar a tela de agradecimento final
let agradecimentoFinalMostrado = false;

// Feedback visual para compras no mercado
let mercadoPiscaCor = null; // 'red', 'yellow', 'green'
let mercadoPiscaTimer = 0;
let mercadoPiscaCount = 0;
let mercadoMensagem = '';
let mercadoMensagemTimer = 0;

// ... existing code ...
let somTiro, somDano;
let somTornado, somCorvos;
let somRaizes, somBoiRugido, somBoiRugidoMinion;
let somTeclado, somClique;
// Adicionar variáveis para músicas temáticas
let musicaMenu, musicaBoss;
let musicaAtual = null; // SoundFile ou null
let musicaAtualNome = null; // 'mapa' ou 'boss'
// Controle de abafo de música do boss
let bossMusicAbafadaTimer = 0;
const bossMusicAbafadaDuracao = 1000; // ms
const bossMusicVolumeNormal = 0.5; // 50% do volume
const bossMusicVolumeAbafado = 0.15;
// ... existing code ...

// ================= FUNÇÕES UTILITÁRIAS =================
// Abre o mercado, mudando a tela para 'mercado'
function abrirMercado() { tela = "mercado"; }

// Exibe o inventário do jogador na tela
function mostrarInventario() {
    // Fundo do inventário
    background(180, 180, 220);
    fill(0);
    textSize(24);
    textAlign(CENTER);
    text("Inventário", width / 2, 50);
    textSize(16);
    textAlign(LEFT);
    // Mostra os itens do inventário
    text("Madeira: " + inventario.madeira, 50, 100);
    text("Bife: " + inventario.bife, 50, 130);
    text("Milho: " + inventario.milho, 50, 160);
    // Instrução para sair do inventário
    textAlign(CENTER);
    text("Pressione Q para voltar", width / 2, height - 50);
}

// Função para atirar projéteis (usada na luta de boss)
function atirar() {
    // Calcula o ângulo entre o player e o mouse
    let angle = atan2(mouseY - (player.y + player.height / 2), mouseX - (player.x + player.width / 2));
    let velocidade = 7;
    // Adiciona um novo tiro ao array de tiros
    tiros.push({
        x: player.x + player.width / 2,
        y: player.y + player.height / 2,
        vx: cos(angle) * velocidade,
        vy: sin(angle) * velocidade,
        size: 80,
        frameIndex: 0,
        animCooldown: 0
    });
    somTiro.play();
    abafarMusicaBoss();
}

// ================= FUNÇÕES DE DESENHO =================
// Desenha o player com animação de acordo com a direção
function desenharPlayerAnimado() {
    let sprites = playerSprites[player.direcao];
    let frame = floor(player.frameIndex) % sprites.length;
    image(sprites[frame], player.x, player.y, player.width, player.height);
}

// Desenha todos os NPCs na tela, com animação e balão de fala
function desenharNPCs() {
    for (let npc of npcs) {
        // NPCs da cidade
        if (npc.area === "cidade" && player.x < width / 2 && tela === "mapa") {
            // Animação do NPC
            npc.tempoAnim += deltaTime;
            if (npc.tempoAnim >= 1000) {
                npc.spriteIndex++;
                npc.tempoAnim = 0;
            }
            let frameIndex = npc.spriteIndex % 2;
            let sprite = npcSprites[npc.tipo][frameIndex];
            // NPC especial: Empressario
            if (npc.tipo === "empressario") {
                let scale = 1.1;
                let baseW = 350, baseH = 350;
                let offsetX = 150, offsetY = 80;
                let extraW = baseW * (scale - 1);
                let extraH = baseH * (scale - 1);
                image(sprite, npc.x - offsetX - extraW/2, npc.y - offsetY - extraH/2, baseW * scale, baseH * scale);
                // Checa se o player está perto do Empressario
                let d = dist(player.x + player.width/2, player.y + player.height/2, npc.x + 20, npc.y + 20);
                let playerPerto = d < 120 && inventario.medalhas >= 12 && inventario.moedas >= 600;
                if (playerPerto) {
                    // Controle do diálogo do Empressario
                    if (!empressarioPlayerPerto) {
                        empressarioFalaParte = 1;
                        empressarioFalaTimer = 0;
                    }
                    empressarioPlayerPerto = true;
                    if (empressarioFalaParte < 4) {
                        empressarioFalaTimer += deltaTime;
                        if (empressarioFalaTimer > 3000) {
                            empressarioFalaParte++;
                            empressarioFalaTimer = 0;
                        }
                    }
                } else {
                    empressarioPlayerPerto = false;
                    empressarioFalaParte = 1;
                    empressarioFalaTimer = 0;
                }
                // Balão de fala do Empressario
                if (d < 120) {
                    let balaoX = npc.x + 60;
                    let balaoY = npc.y - 60;
                    let balaoW = 320;
                    let balaoH = 80;
                    stroke(60, 60, 60);
                    strokeWeight(3);
                    fill(255);
                    rect(balaoX, balaoY, balaoW, balaoH, 18);
                    noStroke();
                    fill(30, 100, 40);
                    textSize(16);
                    textAlign(CENTER, CENTER);
                    if (inventario.medalhas >= 12 && inventario.moedas >= 600) {
                        let fala = "";
                        if (empressarioFalaParte === 1) fala = "OTIMO!";
                        else if (empressarioFalaParte === 2) fala = "CASO QUEIRA COMPRAR MAQUINARIOS\nE AJUDAR OS CAMPOS";
                        else if (empressarioFalaParte === 3) fala = "BASTA ASSINAR O MEU CONTRATO!";
                        else fala = "Aperte a Tecla \"C\" para assinar!";
                        text(fala, balaoX + balaoW/2, balaoY + balaoH/2);
                    } else {
                        text("Ei Rapaz! Volte aqui quando\ntiver 12 Medalhas e 600 Moedas!", balaoX + balaoW/2, balaoY + balaoH/2);
                    }
                }
            } else {
                // NPCs normais
                image(sprite, npc.x - 150, npc.y - 80, 350, 350);
            }
        }
        // NPCs do campo
        if (npc.area === "campo" && player.x >= width / 2 && tela === "mapa") {
            npc.tempoAnim += deltaTime;
            if (npc.tempoAnim >= 1000) {
                npc.spriteIndex++;
                npc.tempoAnim = 0;
            }
            let frameIndex = npc.spriteIndex % 2;
            let sprite = npcSprites[npc.tipo][frameIndex];
            image(sprite, npc.x - 150, npc.y - 80, 350, 350);
            if (["fazendeiro", "lenhador", "cowboy"].includes(npc.tipo)) {
                let d = dist(player.x + player.width/2, player.y + player.height/2, npc.x + 20, npc.y + 20);
                let estado = npcDialogoEstado[npc.tipo]; // Corrige escopo da variável
                // Diminuir área de interação para 50 pixels
                if (d < 50) {
                    if (!estado.playerPerto) {
                        estado.index = 0;
                        estado.playerPerto = true;
                        estado.tempoUltimaFala = millis();
                    }
                    let balaoW = 320;
                    let balaoH = 80;
                    let balaoX = npc.x + 25 - balaoW/2;
                    let balaoY = npc.y - 110 + balaoH * 0.2; // 20% mais para baixo
                    stroke(60, 60, 60);
                    strokeWeight(3);
                    fill(255);
                    rect(balaoX, balaoY, balaoW, balaoH, 18);
                    noStroke();
                    fill(30, 100, 40);
                    textSize(16);
                    textAlign(CENTER, CENTER);
                    let falas = npcFalas[npc.tipo].slice();
                    falas.push("Para enfrentar o Boss, pressione E");
                    let fala = falas[estado.index];
                    text(fala, balaoX + balaoW/2, balaoY + balaoH/2);
                    if (estado.index < falas.length - 1 && millis() - estado.tempoUltimaFala > 5000) {
                        estado.index++;
                        estado.tempoUltimaFala = millis();
                    }
                    if (estado.index === falas.length - 1 && keyIsDown(69)) {
                        if (npc.tipo === "fazendeiro") bossAtual = new BossCorvo();
                        if (npc.tipo === "lenhador") bossAtual = new BossArvore();
                        if (npc.tipo === "cowboy") bossAtual = new BossTouro();
                        tela = "boss";
                        player.x = width / 4;
                        player.y = height / 2;
                        tiros = [];
                        player.vida = player.vidaMax;
                        estado.index = 0;
                        estado.playerPerto = false;
                    }
                } else {
                    estado.index = 0;
                    estado.playerPerto = false;
                }
            }
        }
    }
}

// Desenha as estruturas (mercado, fábrica, etc) na tela
function desenharEstruturas() {
    if (player.x < width / 2) {
        for (const e of estruturas) {
            if (e.area === "cidade") {
                if (e.tipo === "acougue") {
                    image(e.img, acougueX, acougueY, 200 * 1.1, 220 * 1.1);
                } else {
                    image(e.img, e.x, e.y);
                }
            }
        }
    } else {
        for (const e of estruturas) {
            if (e.area === "campo") {
                image(e.img, e.x, e.y);
            }
        }
    }
}

// Desenha a HUD (medalhas e moedas) no canto da tela
function desenharHUD() {
    noStroke();
    fill(0);
    textSize(18);
    textAlign(LEFT, TOP);
    // Medalhas acima das moedas
    text("Medalhas: " + inventario.medalhas, 20, 40);
    text("Moedas: " + inventario.moedas, 20, 80);
}

// Exibe instruções básicas na tela
function mostrarInstrucoes() {
    fill(255);
    textSize(20);
    textAlign(CENTER);
    text("Use W, A, S, D para mover. Pressione E para interagir.", width/2, height - 80);
    text("Objetivo: Colete recursos, vença bosses e una cidade e campo!", width/2, height - 50);
}

// ================= FUNÇÕES DE CONTROLE DE TELA =================
function preload() {
    playerSprites.direita.push(loadImage("Imagem/player/pixil-frame-1.png"));
    playerSprites.direita.push(loadImage("Imagem/player/pixil-frame-2.png"));
    playerSprites.esquerda.push(loadImage("Imagem/player/pixil-frame-4.png"));
    playerSprites.esquerda.push(loadImage("Imagem/player/pixil-frame-3.png"));
    playerSprites.baixo.push(loadImage("Imagem/player/pixil-frame-6.png"));
    playerSprites.baixo.push(loadImage("Imagem/player/pixil-frame-7.png"));
    playerSprites.cima.push(loadImage("Imagem/player/pixil-frame-8.png"));
    playerSprites.cima.push(loadImage("Imagem/player/pixil-frame-9.png"));
    playerSprites.projetil.push(loadImage("Imagem/player/pixil-frame-12.png"));
    playerSprites.projetil.push(loadImage("Imagem/player/pixil-frame-14.png"));
    for (let est of estruturas) {
        est.img = loadImage(est.arquivo);
    }
    imgPlacaVida = loadImage("Imagem/Placas/pixil-frame-0.png");
    imgPlacaDano = loadImage("Imagem/Placas/pixil-frame-1.png");
    npcSprites = {
        fazendeiro: [loadImage("Imagem/npc/pixil-frame-0.png"), loadImage("Imagem/npc/pixil-frame-1.png")],
        lenhador: [loadImage("Imagem/npc/pixil-frame-2.png"), loadImage("Imagem/npc/pixil-frame-3.png")],
        cowboy: [loadImage("Imagem/npc/pixil-frame-4.png"), loadImage("Imagem/npc/pixil-frame-5.png")],
        empressario: [loadImage("Imagem/npc/pixil-frame-6.png"), loadImage("Imagem/npc/pixil-frame-7.png")]
    };
    coracaoImg = loadImage("Imagem/player/coracao.png");
    bossBackground = loadImage("Imagem/Boss/pixil-frame-6.png");
    bossSprites.corvo.idle.push(loadImage("Imagem/Boss/pixil-frame-1.png"));
    bossSprites.corvo.idle.push(loadImage("Imagem/Boss/pixil-frame-2.png"));
    bossSprites.corvo.ataque1.push(loadImage("Imagem/Boss/pixil-frame-3.png"));
    bossSprites.corvo.ataque2.push(loadImage("Imagem/Boss/pixil-frame-4.png"));
    bossSprites.corvo.ataque2.push(loadImage("Imagem/Boss/pixil-frame-5.png"));
    bossSprites.arvore.idle.push(loadImage("Imagem/Boss/pixil-frame-7.png"));
    bossSprites.arvore.idle.push(loadImage("Imagem/Boss/pixil-frame-8.png"));
    bossSprites.arvore.ataque1.push(loadImage("Imagem/Boss/pixil-frame-9.png"));
    bossSprites.arvore.ataque1.push(loadImage("Imagem/Boss/pixil-frame-10.png"));
    bossSprites.arvore.ataque1.push(loadImage("Imagem/Boss/pixil-frame-11.png"));
    bossSprites.touro.idle.push(loadImage("Imagem/Boss/pixil-frame-13.png"));
    bossSprites.touro.idle.push(loadImage("Imagem/Boss/pixil-frame-14.png"));
    bossSprites.touro.ataque1.push(loadImage("Imagem/Boss/pixil-frame-15.png"));
    bossSprites.touro.ataque1.push(loadImage("Imagem/Boss/pixil-frame-16.png"));
    bossSprites.touro.ataque2.push(loadImage("Imagem/Boss/pixil-frame-18.png"));
    bossSprites.touro.ataque2.push(loadImage("Imagem/Boss/pixil-frame-19.png"));
    bossSprites.touro.ataque2.push(loadImage("Imagem/Boss/pixil-frame-20.png"));
    imgFinalContrato = loadImage("Imagem/Pacote Extra/Contrato PixelArt.png");
    imgFinalJornal = loadImage("Imagem/Pacote Extra/Jornal PixelArt.png");
    somTiro = loadSound("SOM/Player tiro som.wav");
    somDano = loadSound("SOM/Player Som/Dano.wav");
    somTornado = loadSound("SOM/Boss SOM/Tornado corvo.wav");
    somCorvos = loadSound("SOM/Boss SOM/Corvos.wav");
    somRaizes = loadSound("SOM/Boss SOM/Raizes som.wav");
    somBoiRugido = loadSound("SOM/Boss SOM/Boi rugido.wav");
    somBoiRugidoMinion = loadSound("SOM/Boss SOM/Boi rugido minion.wav");
    somTeclado = loadSound("SOM/Extra SOM/Teclado.wav");
    somClique = loadSound("SOM/Extra SOM/Clique.wav");
    // Carregar músicas temáticas
    musicaMenu = loadSound("SOM/Musicas Tematicas/Aliança das Ruas e do Campo musica thema.mp3");
    musicaBoss = loadSound("SOM/Musicas Tematicas/BOSS THEME!.mp3");
}
function setup() {
    // Cria o canvas do jogo com tamanho 800x600 pixels
    createCanvas(800, 600);
    // Desativa suavização de imagens para visual pixel art
    noSmooth();
    // Inicializa o objeto player com posição central, vida, tamanho e direção
    player = {
        x: width / 2,
        y: height / 2,
        velocidade: 3, // Velocidade de movimento do player
        vida: 3,       // Vida atual do player
        vidaMax: 3,    // Vida máxima do player
        width: 120,    // Largura do sprite do player
        height: 120,   // Altura do sprite do player
        direcao: "baixo", // Direção inicial
        frameIndex: 0,     // Frame de animação
        animCooldown: 0    // Cooldown da animação
    };
}
function draw() {
    // Atualiza cooldowns dos tiros sempre
    if (cooldownTiro > 0) cooldownTiro -= deltaTime;
    if (cooldownTiro < 0) cooldownTiro = 0;
    // Limpa a tela com cor de fundo
    background(220);
    // Controle de qual tela desenhar
    if (tela === "menu") {
        // Atualiza animação dos NPCs e bosses no menu
        menuNPCAnimTimer += deltaTime;
        if (menuNPCAnimTimer >= 1000) {
            menuNPCFrame = (menuNPCFrame + 1) % 2;
            menuNPCAnimTimer = 0;
        }
        menuBossAnimTimer += deltaTime;
        if (menuBossAnimTimer >= 200) {
            menuBossFrame = (menuBossFrame + 1) % 2;
            menuBossAnimTimer = 0;
        }
    }
    // Chama a função de acordo com a tela
    if (tela === "menu") {
        menu();
    } else if (tela === "tutorialInicial") {
        // Exibe tutorial inicial com efeito de digitação
        background(0);
        fill(255);
        textAlign(CENTER, TOP);
        textSize(36);
        text("TUTORIAL", width/2, 60);
        textSize(24);
        // Junta todas as mensagens em uma só string separada por '\n'
        let tutorialFullMsg = tutorialMsgs.join("\n");
        // Efeito de digitação
        if (!tutorialTypeDone) {
            tutorialTypeTimer += deltaTime;
            let maxIndex = min(tutorialFullMsg.length, Math.floor(tutorialTypeTimer / tutorialTypeSpeed));
            if (maxIndex >= tutorialFullMsg.length) {
                tutorialTypeDone = true;
                tutorialTypeIndex = tutorialFullMsg.length;
            } else {
                tutorialTypeIndex = maxIndex;
            }
            // Tocar som de teclado enquanto digita
            if (!somTeclado.isPlaying()) {
                somTeclado.loop();
            }
        } else {
            // Parar som de teclado quando terminar
            if (somTeclado.isPlaying()) {
                somTeclado.stop();
            }
        }
        // Mostra o texto digitando letra por letra
        text(tutorialFullMsg.substring(0, tutorialTypeIndex), width/2, 120);
        // Timer para sair do tutorial
        if (tutorialTypeDone) {
            tutorialInicialTimer += deltaTime;
            if (tutorialInicialTimer > 6000) {
                tela = "mapa";
                player.x = width / 2;
                player.y = height / 2;
                tutorialInicialAtivo = false;
                tutorialInicialTimer = 0;
                tutorialTypeIndex = 0;
                tutorialTypeTimer = 0;
                tutorialTypeDone = false;
                // Parar som de teclado ao sair
                if (somTeclado.isPlaying()) {
                    somTeclado.stop();
                }
            }
        }
        // Botão Pular
        let btnW = 200, btnH = 60;
        let btnX = width/2 - btnW/2;
        let btnY = height - 120;
        fill(255);
        stroke(0);
        strokeWeight(2);
        rect(btnX, btnY, btnW, btnH, 15);
        noStroke();
        fill(0);
        textSize(32);
        textAlign(CENTER, CENTER);
        text("Pular", width/2, btnY + btnH/2);
    } else if (tela === "mapa") {
        // Chama a função principal do mapa
        mapa();
        // NÃO desenhar a barra de quest aqui!
    } else if (tela === "boss") {
        // Efeito de tremor só na tela do boss
        if (terremotoBossTimer > 0) {
            let shakeX = random(-terremotoBossIntensidade, terremotoBossIntensidade);
            let shakeY = random(-terremotoBossIntensidade, terremotoBossIntensidade);
            push();
            translate(shakeX, shakeY);
            boss();
            pop();
            terremotoBossTimer -= deltaTime;
            if (terremotoBossTimer < 0) terremotoBossTimer = 0;
        } else {
            boss();
        }
        return;
    } else if (tela === "inventario") {
        // Exibe o inventário
        mostrarInventario();
    } else if (tela === "mercado") {
        // Exibe o mercado
        mostrarMercado();
    } else if (tela === "fim") {
        if (!gameOverPodeVoltar) {
            gameOverDelay += deltaTime;
            if (gameOverDelay > 2000) {
                gameOverPodeVoltar = true;
            }
        }
        fimDeJogo();
        return;
    } else if (tela === "final_imagens") {
        mostrarTelaFinalImagens();
        return;
    } else if (tela === "contrato") {
        // Exibe tela de contrato/finalização
        background(255, 255, 0);
        fill(60);
        textAlign(CENTER, TOP);
        textSize(36);
        text("PARABENS JOGADOR!", width/2, 80);
        textSize(22);
        let msg = "VOCE CONSEGIU UNIR AINDA MAIS A CIDADE E O CAMPO!\nISSO É UM FEITO INCRIVEL!! AGREDEÇO POR TER JOGADO!\nVEJA OQUE VOCE REALIZOU!!";
        // Animação de digitação do texto
        if (!contratoTypeDone) {
            contratoTypeTimer += deltaTime;
            let maxIndex = min(msg.length, Math.floor(contratoTypeTimer / typeSpeed));
            if (maxIndex >= msg.length) {
                contratoTypeDone = true;
                contratoTypeIndex = msg.length;
            } else {
                contratoTypeIndex = maxIndex;
            }
        }
        text(msg.substring(0, contratoTypeIndex), width/2, 140);
        // Após o texto, mostra mensagem de carregando e transita para finalização
        if (contratoTypeDone) {
            contratoTimer += deltaTime;
            if (contratoTimer > 6000) {
                contratoMostrandoCarregando = true;
                if (contratoTimer < 12000) {
                    if (floor(contratoTimer/400) % 2 === 0) {
                        fill(120, 60, 120);
                        textSize(28);
                        textAlign(CENTER, BOTTOM);
                        text("Carregando.... Aguarde!", width/2, height - 60);
                    }
                } else {
                    // Reseta variáveis e vai para próxima tela
                    tela = "final_imagens";
                    contratoTimer = 0;
                    contratoMostrandoCarregando = false;
                    jornalTimer = 0;
                    jornalMostrandoCarregando = false;
                    contratoTypeIndex = 0;
                    contratoTypeTimer = 0;
                    contratoTypeDone = false;
                    jornalTypeIndex = 0;
                    jornalTypeTimer = 0;
                    jornalTypeDone = false;
                }
            }
        }
    } else if (tela === "finalizacao") {
        // Tela de finalização simples
        background(180);
    } else if (tela === "finalizacaoRosa") {
        // Tela de jornal (final)
        background(255, 100, 200);
        fill(60);
        textAlign(CENTER, TOP);
        textSize(40);
        text("JORNAL!", width/2, 60);
        textSize(28);
        let jornalMsg = '"Graças a uma figura conhecido apenas como "JOGADOR" algo incrivel acontece! ele fez um contrato que ajudou o campo da melhor forma possivel!!"';
        let blocoW = 500;
        let blocoX = width/2 - blocoW/2 - 300;
        // Animação de digitação do texto
        if (!jornalTypeDone) {
            jornalTypeTimer += deltaTime;
            let maxIndex = min(jornalMsg.length, Math.floor(jornalTypeTimer / typeSpeed));
            if (maxIndex >= jornalMsg.length) {
                jornalTypeDone = true;
                jornalTypeIndex = jornalMsg.length;
            } else {
                jornalTypeIndex = maxIndex;
            }
        }
        text(jornalMsg.substring(0, jornalTypeIndex), blocoX + blocoW/2, 140, blocoW, 300);
        // Após o texto, mostra mensagem de carregando e transita para finalização
        if (jornalTypeDone) {
            jornalTimer += deltaTime;
            if (jornalTimer > 6000) {
                jornalMostrandoCarregando = true;
                if (jornalTimer < 10000) {
                    if (floor(jornalTimer/400) % 2 === 0) {
                        fill(120, 60, 120);
                        textSize(28);
                        textAlign(CENTER, BOTTOM);
                        text("Carregando.... Aguarde!", width/2, height - 60);
                    }
                } else {
                    // Reseta variáveis e vai para próxima tela
                    tela = "finalizacaoLaranja";
                    jornalTimer = 0;
                    jornalMostrandoCarregando = false;
                    jornalTypeIndex = 0;
                    jornalTypeTimer = 0;
                    jornalTypeDone = false;
                    laranjaTypeIndex = 0;
                    laranjaTypeTimer = 0;
                    laranjaTypeDone = false;
                }
            }
        }
    } else if (tela === "finalizacaoLaranja") {
        // Tela final com mensagem de prosperidade
        background(255, 150, 0);
        fill(60);
        textAlign(CENTER, TOP);
        textSize(38);
        text("A NOVA ERA DO CAMPO!", width/2, 60);
        textSize(24);
        let laranjaMsg = '"CAMPO PROSPERA!"\nSerraria ganha maquinarios novos!\nAs Plantações ganham drones e aviões para auxilio!\nAs produção de gado está recebendo produtos de ultima geração!\nJOGO FEITO POR MANOEL(1A)!\nCOM APOIO DE PROF WILLIAM!!\nARTE FEITO EM:https://www.pixilart.com/ ';
        let blocoW = 600;
        let blocoX = width/2 - blocoW/2 - 300;
        // Animação de digitação do texto
        if (!laranjaTypeDone) {
            laranjaTypeTimer += deltaTime;
            let maxIndex = min(laranjaMsg.length, Math.floor(laranjaTypeTimer / typeSpeed));
            if (maxIndex >= laranjaMsg.length) {
                laranjaTypeDone = true;
                laranjaTypeIndex = laranjaMsg.length;
            } else {
                laranjaTypeIndex = maxIndex;
            }
        }
        text(laranjaMsg.substring(0, laranjaTypeIndex), blocoX + blocoW/2, 140, blocoW, 300);
        // Mensagem de fim piscando
        if (laranjaTypeDone) {
            laranjaTimer += deltaTime;
            if (laranjaTimer > 5000) {
                laranjaMostrandoCarregando = true;
                if (laranjaTimer < 8000) {
                    if (floor(laranjaTimer/400) % 2 === 0) {
                        fill(120, 60, 120);
                        textSize(28);
                        textAlign(CENTER, BOTTOM);
                        text("Fim!", width/2, height - 60);
                    }
                } 
            }
        }
    } else if (tela === "quest") {
        // Tela de Quest
        background(120, 0, 0); // vermelho escuro
        fill(255);
        textAlign(CENTER, TOP);
        textSize(36);
        text("Pagina de Tarefas!", width/2, 60);
        textSize(20);
        text("Pressione M para sair", width/2, 140);

        // --- BOSS QUEST ---
        let bossesDerrotados = 0;
        if (bossCorvoDerrotado) bossesDerrotados++;
        if (bossArvoreDerrotado) bossesDerrotados++;
        if (bossTouroDerrotado) bossesDerrotados++;
        let bossFrames = [
            bossSprites.corvo.idle[(frameCount >> 3) % bossSprites.corvo.idle.length],
            bossSprites.arvore.idle[(frameCount >> 3) % bossSprites.arvore.idle.length],
            bossSprites.touro.idle[(frameCount >> 3) % bossSprites.touro.idle.length]
        ];
        let iconSize = 48;
        let startX = width/2 - 120;
        let y = 220;
        for (let i = 0; i < bossFrames.length; i++) {
            imageMode(CENTER);
            image(bossFrames[i], startX + i*70, y, iconSize, iconSize);
            if ((i === 0 && bossCorvoDerrotado) ||
                (i === 1 && bossArvoreDerrotado) ||
                (i === 2 && bossTouroDerrotado)) {
                fill(0,255,0,180);
                ellipse(startX + i*70, y, iconSize*0.7, iconSize*0.7);
                fill(255);
                textSize(16);
                text("OK", startX + i*70, y+2);
            }
        }
        imageMode(CORNER);
        let barraX = width/2 + 40;
        let barraY = y - 24;
        let barraW = 220;
        let barraH = 40;
        if (bossesDerrotados === 3) {
            fill(80,255,80); // verde
        } else {
            fill(255,80,80); // vermelho
        }
        rect(barraX, barraY, barraW, barraH, 12);
        fill(80,0,0);
        textSize(18);
        textAlign(LEFT, CENTER);
        let textoQuest = "Derrote os boss (" + bossesDerrotados + "/3)";
        if (bossesDerrotados === 3) textoQuest = "Tarefa Pronta! (3/3)";
        text(textoQuest, barraX + 16, barraY + barraH/2);
        if (bossesDerrotados === 3 && !questBossRewardGiven) {
            inventario.moedas += 30;
            questBossRewardGiven = true;
        }

        // --- UPGRADE QUEST ---
        // Conta upgrades comprados (vida e dano)
        let upgradesVida = player.vidaMax - 3;
        let upgradesDano = inventario.dano - 1;
        let upgradesComprados = max(0, upgradesVida) + max(0, upgradesDano);
        // Placas lado a lado
        let placaX1 = width/2 - 80;
        let placaX2 = width/2 + 40;
        let placaY = y + 100;
        imageMode(CENTER);
        if (imgPlacaVida) image(imgPlacaVida, placaX1, placaY, 64, 64);
        if (imgPlacaDano) image(imgPlacaDano, placaX2, placaY, 64, 64);
        // Bolinha verde se upgrade comprado
        if (upgradesVida > 0) {
            fill(0,255,0,180);
            ellipse(placaX1, placaY, 32, 32);
            fill(255);
            textSize(16);
            text("OK", placaX1, placaY+2);
        }
        if (upgradesDano > 0) {
            fill(0,255,0,180);
            ellipse(placaX2, placaY, 32, 32);
            fill(255);
            textSize(16);
            text("OK", placaX2, placaY+2);
        }
        imageMode(CORNER);
        // Barra de progresso (ainda maior)
        let barra2X = width/2 - 160;
        let barra2Y = placaY - 24;
        let barra2W = 420;
        let barra2H = 40;
        let placaIconSize = 48 * 1.4; // 40% maior
        let placaIconY1 = barra2Y + barra2H/2 - 28 * 1.4;
        let placaIconY2 = barra2Y + barra2H/2 + 28 * 1.4;
        let placaIconX = barra2X - 60;
        imageMode(CENTER);
        if (imgPlacaVida) image(imgPlacaVida, placaIconX, placaIconY1, placaIconSize, placaIconSize);
        if (imgPlacaDano) image(imgPlacaDano, placaIconX, placaIconY2, placaIconSize, placaIconSize);
        // Bolinha verde se upgrade comprado (ajustada para o novo tamanho)
        let okSize = 28 * 1.4;
        let okTextSize = 14 * 1.4;
        if (upgradesVida > 0) {
            fill(0,255,0,180);
            ellipse(placaIconX, placaIconY1, okSize, okSize);
            fill(255);
            textSize(okTextSize);
            text("OK", placaIconX, placaIconY1+2);
        }
        if (upgradesDano > 0) {
            fill(0,255,0,180);
            ellipse(placaIconX, placaIconY2, okSize, okSize);
            fill(255);
            textSize(okTextSize);
            text("OK", placaIconX, placaIconY2+2);
        }
        imageMode(CORNER);
        // Barra de progresso (ainda maior)
        if (upgradesComprados >= 2) {
            fill(80,255,80); // verde
        } else {
            fill(255,80,80); // vermelho
        }
        rect(barra2X, barra2Y, barra2W, barra2H, 12);
        fill(80,0,0);
        textSize(18);
        textAlign(LEFT, CENTER);
        let textoUpgrade = "Compre dois aprimoramentos! {Hp/dano} (" + min(upgradesComprados,2) + "/2)";
        if (upgradesComprados >= 2) textoUpgrade = "Tarefa Pronta! (2/2)";
        text(textoUpgrade, barra2X + 16, barra2Y + barra2H/2);
        if (upgradesComprados >= 2 && !questUpgradeRewardGiven) {
            inventario.moedas += 30;
            questUpgradeRewardGiven = true;
        }
    } 
    // Permite interagir novamente com o mercado se afastar
    if (!playerPertoDe("mercado")) {
        podeInteragirComMercado = true;
    }
    // Efeito de terremoto global (quando leva dano do boss)
    let shakeX = 0, shakeY = 0;
    if (terremotoBossTimer > 0) {
        shakeX = random(-terremotoBossIntensidade, terremotoBossIntensidade);
        shakeY = random(-terremotoBossIntensidade, terremotoBossIntensidade);
        terremotoBossTimer -= deltaTime;
        if (terremotoBossTimer < 0) terremotoBossTimer = 0;
        push();
        translate(shakeX, shakeY);
    }
    if (tela === "mapa" || tela === "boss") {
        playerMovimento();
    }
    if (tela === "agradecimento_final") {
        mostrarTelaAgradecimentoFinal();
        return;
    }
    // Atualizar timers do mercado no draw
    if (mercadoMensagemTimer > 0) {
        mercadoMensagemTimer -= deltaTime;
        if (mercadoMensagemTimer < 0) mercadoMensagemTimer = 0;
    }
    let musicaDesejada = null;
    let musicaDesejadaNome = null;
    if (tela === "mapa") {
        musicaDesejada = musicaMenu;
        musicaDesejadaNome = 'mapa';
    } else if (tela === "boss") {
        musicaDesejada = musicaBoss;
        musicaDesejadaNome = 'boss';
    }
    // Troca de música só se mudou
    if (musicaDesejada !== musicaAtual) {
        // Se tinha uma música tocando, pause (não stop)
        if (musicaAtual && musicaAtual.isPlaying()) {
            musicaAtual.pause();
        }
        // Se for uma nova música, reinicia do zero
        if (musicaDesejada && musicaDesejada !== musicaAtual) {
            if (musicaDesejadaNome === 'boss') {
                // Ajusta volume conforme abafado ou não
                if (bossMusicAbafadaTimer > 0) {
                    musicaDesejada.setVolume(bossMusicVolumeAbafado);
                } else {
                    musicaDesejada.setVolume(bossMusicVolumeNormal);
                }
                musicaDesejada.loop();
            } else {
                musicaDesejada.setVolume(1.0);
                musicaDesejada.play();
            }
        }
        musicaAtual = musicaDesejada;
        musicaAtualNome = musicaDesejadaNome;
    } else if (musicaDesejada && !musicaDesejada.isPlaying()) {
        // Se a música desejada existe mas está pausada, retome
        if (musicaDesejadaNome === 'boss') {
            if (bossMusicAbafadaTimer > 0) {
                musicaDesejada.setVolume(bossMusicVolumeAbafado);
            } else {
                musicaDesejada.setVolume(bossMusicVolumeNormal);
            }
            musicaDesejada.loop();
        } else {
            musicaDesejada.setVolume(1.0);
            musicaDesejada.play();
        }
    }
    // Controle do volume da música do boss (fora do bloco de troca)
    if (musicaAtualNome === 'boss' && musicaAtual && musicaAtual.isPlaying()) {
        if (bossMusicAbafadaTimer > 0) {
            musicaAtual.setVolume(bossMusicVolumeAbafado);
            bossMusicAbafadaTimer -= deltaTime;
            if (bossMusicAbafadaTimer < 0) bossMusicAbafadaTimer = 0;
        } else {
            musicaAtual.setVolume(bossMusicVolumeNormal); // Força o volume todo frame
        }
    }
    // Se não for mapa/boss, pause a música
    if (!musicaDesejada && musicaAtual && musicaAtual.isPlaying()) {
        musicaAtual.pause();
    }
}
function mostrarMercado() {
    // Piscar tela se necessário
    if (mercadoPiscaCor && mercadoPiscaTimer > 0) {
        let t = 1 - (mercadoPiscaTimer / 1000);
        let flash = Math.floor(t * 6) % 2 === 0; // 3 flashes em 1s
        if (flash) {
            if (mercadoPiscaCor === 'red') background(255,0,0,120);
            if (mercadoPiscaCor === 'yellow') background(255,255,0,120);
            if (mercadoPiscaCor === 'green') background(0,255,0,120);
        }
        mercadoPiscaTimer -= deltaTime;
        if (mercadoPiscaTimer <= 0) mercadoPiscaCor = null;
    } else {
        background(150, 200, 150);
    }
    fill(0);
    textSize(32);
    textAlign(CENTER);
    text("Mercado", width / 2, 50);
    imageMode(CENTER);
    placaVidaX = width / 2;
    placaVidaY = height / 2 - 100;
    placaDanoX = width / 2;
    placaDanoY = height / 2 + 100;
    image(imgPlacaVida, placaVidaX, placaVidaY, 200, 200);
    image(imgPlacaDano, placaDanoX, placaDanoY, 200, 200);
    imageMode(CORNER);
    textSize(16);
    text("Pressione E para sair", width / 2, height - 50);
    if (mercadoMensagem && mercadoMensagemTimer > 0) {
        fill(0);
        textSize(28);
        textAlign(CENTER, CENTER);
        text(mercadoMensagem, width/2, height/2);
    }
}
function menu() {
    background(70, 160, 255);
    let gramaY = height * 0.4;
    fill(80, 200, 80);
    rect(0, gramaY, width, height - gramaY);
    let estruturaY = gramaY + 20 + height * 0.05;
    let espacamentoEstruturas = width / (estruturas.filter(e => e.area === "cidade" || e.area === "campo").length + 1);
    let idxEstrutura = 1;
    for (let e of estruturas) {
        let x = espacamentoEstruturas * idxEstrutura;
        imageMode(CENTER);
        image(e.img, x, estruturaY, 100, 100);
        idxEstrutura++;
    }
    imageMode(CORNER);
    let bosses = [
        bossSprites.corvo.idle[menuBossFrame],
        bossSprites.arvore.idle[menuBossFrame],
        bossSprites.touro.idle[menuBossFrame]
    ];
    let bossColX = width * 0.82;
    let bossColTop = gramaY + 100;
    let bossColH = height - bossColTop - 60;
    let bossEspaco = bossColH / ((bosses.length - 1) * 2) * 1.1;
    for (let i = 0; i < bosses.length; i++) {
        let y = bossColTop + i * bossEspaco;
        imageMode(CENTER);
        image(bosses[i], bossColX, y, 80, 80);
    }
    imageMode(CORNER);
    let npcsMenu = npcs;
    let col1X = width * 0.13;
    let col2X = width * 0.28;
    let nCol1 = Math.ceil(npcsMenu.length / 2);
    let nCol2 = Math.floor(npcsMenu.length / 2);
    let npcColTop = gramaY + 120 + height * 0.18;
    let npcColH = height - npcColTop - 60;
    let npcEspaco = npcColH / Math.max(nCol1, nCol2, 1) * 1.2;
    for (let i = 0; i < npcsMenu.length; i++) {
        let col = (i < nCol1) ? 1 : 2;
        let idx = (col === 1) ? i : i - nCol1;
        let x = (col === 1) ? col1X : col2X;
        let y = npcColTop + idx * npcEspaco;
        let npc = npcsMenu[i];
        let frameIndex = menuNPCFrame;
        let sprite = npcSprites[npc.tipo][frameIndex];
        let scale = (npc.tipo === "empressario") ? 1.1 : 1.0;
        let w = 70 * scale * 3, h = 70 * scale * 3;
        imageMode(CENTER);
        image(sprite, x, y, w, h);
    }
    imageMode(CORNER);
    let playerY = gramaY + 180;
    let playerX = width / 2;
    let playerSprite = playerSprites.baixo[0];
    imageMode(CENTER);
    image(playerSprite, playerX, playerY, 90 * 1.8, 90 * 1.8);
    imageMode(CORNER);
    let botaoW = 200, botaoH = 60;
    let botaoX = width / 2 - botaoW / 2;
    let botaoY = 90 + height * 0.1;
    fill(255);
    stroke(0);
    strokeWeight(2);
    rect(botaoX, botaoY, botaoW, botaoH, 15);
    noStroke();
    fill(0);
    textSize(32);
    textAlign(CENTER, CENTER);
    text("JOGAR", width / 2, botaoY + botaoH / 2);
    let fraseY = botaoY - 30 + height * 0.02;
    textSize(30);
    fill(255);
    stroke(0);
    strokeWeight(4);
    textAlign(CENTER, BOTTOM);
    text("ALIANÇA DAS RUAS E DOS CAMPOS!", width / 2, fraseY);
    textSize(36);
    fill(255, 255, 0);
    text("AGRINHO!", width / 2, fraseY - 40);
    noStroke();
    textAlign(CENTER, CENTER);
}
function mapa() {
    background(180);
    noStroke();
    fill(100, 200, 100);
    rect(width / 2, 0, width / 2, height);
    stroke(0);
    strokeWeight(2);
    line(width / 2, 0, width / 2, height);
    fill(0);
    textSize(32);
    textAlign(CENTER, TOP);
    text("CIDADE", width / 4, 10);
    text("CAMPO", 3 * width / 4, 10);
    desenharEstruturas();
    desenharNPCs();
    playerMovimento();
    desenharPlayerAnimado();
    desenharHUD();
    npcs.forEach((npc) => {
        let dNpc = dist(
            player.x + player.width / 2,
            player.y + player.height / 2,
            npc.x + 20,
            npc.y + 20
        );
        // Remover bloco que exibia 'Para enfrentar o Boss \n Pressione E' aqui
        // (não exibir mais nada aqui para os NPCs do campo)
    });
    for (const e of estruturas) {
        const estaNaCidade = player.x < width / 2 && e.area === "cidade";
        const estaNoCampo = player.x >= width / 2 && e.area === "campo";
        if (estaNaCidade || estaNoCampo) {
            let d = null;
            switch (e.tipo) {
                case "mercado":
                    d = dist(
                        player.x + player.width / 2,
                        player.y + player.height / 2,
                        e.x + 90,
                        e.y + 100
                    );
                    break;
                case "fabrica":
                    d = dist(
                        player.x + player.width / 2,
                        player.y + player.height / 2,
                        e.x + 80,
                        e.y + 90
                    );
                    break;
                case "acougue":
                    d = dist(
                        player.x + player.width / 2,
                        player.y + player.height / 2,
                        acougueX + (acougueSpriteW / 2),
                        acougueY + (acougueSpriteH / 2)
                    );
                    break;
                case "feira":
                    d = dist(
                        player.x + player.width / 2,
                        player.y + player.height / 2,
                        e.x + 80,
                        e.y + 160
                    );
                    break;
            }
            if (d < 120) {
                fill(0);
                textSize(12);
                textAlign(CENTER);
                switch (e.tipo) {
                    case "mercado":
                        text("Pressione E para comprar", e.x + 100, e.y + 170);
                        if (keyIsDown(69) && podeInteragir) {
                            abrirMercado();
                            podeInteragir = false;
                        }
                        break;
                    case "fabrica":
                        if (inventario.madeira > 0) {
                            text("Pressione E para vender madeira", e.x + 100, e.y + 170);
                            if (keyIsDown(69) && podeInteragir) {
                                inventario.moedas += inventario.madeira * 5;
                                inventario.madeira = 0;
                                podeInteragir = false;
                            }
                        }
                        break;
                    case "acougue":
                        if (inventario.bife > 0) {
                            text("Pressione E para vender bife", e.x + 100, e.y + 170);
                            if (keyIsDown(69) && podeInteragir) {
                                inventario.moedas += inventario.bife * 5;
                                inventario.bife = 0;
                                podeInteragir = false;
                            }
                        }
                        break;
                    case "feira":
                        if (inventario.milho > 0) {
                            text("Pressione E para vender milho", e.x + 100, e.y + 180);
                            if (keyIsDown(69) && podeInteragir) {
                                inventario.moedas += inventario.milho * 5;
                                inventario.milho = 0;
                                podeInteragir = false;
                            }
                        }
                        break;
                }
            }
        }
    }
}
function boss() {
    background(bossBackground);
    textAlign(CENTER);
    fill(0);
    fill(255, 0, 0);
    rect(width / 2 - 100, 30, 200, 20);
    fill(0, 255, 0);
    let hpWidth = map(bossAtual.vida, 0, bossAtual.vidaMax, 0, 200);
    rect(width / 2 - 100, 30, hpWidth, 20);
    fill(0);
    textSize(18);
    text("Boss: " + bossAtual.tipo + "  Vida: " + bossAtual.vida, width / 2, 20);
    for (let i = 1; i <= player.vida; i++) {
        image(coracaoImg, 50 * i, 20, 50, 50);
    }
    desenharPlayerAnimado();
    for (let i = tiros.length - 1; i >= 0; i--) {
        let t = tiros[i];
        t.x += t.vx;
        t.y += t.vy;
        t.animCooldown += deltaTime;
        if (t.animCooldown >= 100) {
            t.frameIndex = (t.frameIndex + 1) % playerSprites.projetil.length;
            t.animCooldown = 0;
        }
        let spriteProj = playerSprites.projetil[t.frameIndex];
        image(spriteProj, t.x - t.size / 2, t.y - t.size / 2, t.size, t.size);
        let bossHitboxL = bossAtual.x - 90;
        let bossHitboxR = bossAtual.x + 90;
        let bossHitboxT = bossAtual.y - 90;
        let bossHitboxB = bossAtual.y + 90;
        if (
            t.x > bossHitboxL &&
            t.x < bossHitboxR &&
            t.y > bossHitboxT &&
            t.y < bossHitboxB
        ) {
            if (bossAtual.tomarDano(dano)) {
                inventario.medalhas++;
                if (bossAtual.tipo === "corvo") bossCorvoDerrotado = true;
                if (bossAtual.tipo === "arvore") bossArvoreDerrotado = true;
                if (bossAtual.tipo === "touro") bossTouroDerrotado = true;
                switch (bossAtual.tipo) {
                    case "corvo":
                        inventario.milho += 10;
                        break;
                    case "arvore":
                        inventario.madeira += 10;
                        break;
                    case "touro":
                        inventario.bife += 10;
                        break;
                }
                alert("Você venceu o boss " + bossAtual.tipo + "!\nRecebeu 10 unidades de recurso!");
                tela = "mapa";
                player.x = width / 2;
                player.y = height / 2;
            }
            tiros.splice(i, 1);
            continue;
        }
        if (t.x < 0 || t.x > width || t.y < 0 || t.y > height) {
            tiros.splice(i, 1);
        }
    }
    bossAtual.update();
    bossAtual.draw();
    bossAtual.atacar();
    let danoRecebido = 0;
    for (let i = bossAtual.ataques.length - 1; i >= 0; i--) {
        let ataque = bossAtual.ataques[i];
        if (ataque.checarColisao(player)) {
            danoRecebido += 1;
            ataque.remover = true;
        }
    }
    if (danoRecebido > 0) {
        player.vida -= danoRecebido;
        somDano.play();
        abafarMusicaBoss();
        terremotoBossTimer = terremotoBossDuracao;
        if (player.vida <= 0) {
            tela = "fim";
            gameOverDelay = 0;
            gameOverPodeVoltar = false;
        }
    }
    playerMovimento();
}

// ================= CLASSES =================
class Boss {
    constructor(tipo, vida) {
        this.tipo = tipo;
        this.vida = vida;
        this.vidaMax = vida;
        this.x = width - 180 / 2 - 30;
        this.y = height / 2;
        this.frameIndex = 0;
        this.animCooldown = 0;
        this.ataqueCooldown = 0;
        this.ataqueAtual = 1;
        this.ataques = [];
        this.tempoEsperaInicial = 2000;
        this.esperando = true;
        this.tempoDecorrido = 0;
    }
    update() {
        if (this.esperando) {
            this.tempoDecorrido += deltaTime;
            if (this.tempoDecorrido >= this.tempoEsperaInicial) {
                this.esperando = false;
            } else {
                this.animCooldown += deltaTime;
                if (this.animCooldown >= 200) {
                    this.frameIndex = (this.frameIndex + 1) % 2;
                    this.animCooldown = 0;
                }
                return;
            }
        }
        this.animCooldown += deltaTime;
        if (this.animCooldown >= 200) {
            this.frameIndex = (this.frameIndex + 1) % 2;
            this.animCooldown = 0;
        }
        if (this.ataqueCooldown > 0) {
            this.ataqueCooldown -= deltaTime;
        }
        for (let i = this.ataques.length - 1; i >= 0; i--) {
            let ataque = this.ataques[i];
            ataque.update();
            if (ataque.remover) {
                this.ataques.splice(i, 1);
            }
        }
    }
    draw() {
        let sprite = bossSprites[this.tipo].idle[this.frameIndex];
        image(sprite, this.x - 90, this.y - 90, 180, 180);
        for (let ataque of this.ataques) {
            ataque.draw();
        }
    }
    atacar() {
        if (!this.esperando && this.ataqueCooldown <= 0 && this.ataques.length === 0) {
            this.ataqueAtual = this.ataqueAtual === 1 ? 2 : 1;
            this.ataqueCooldown = 2000;
            this.executarAtaque();
        }
    }
    executarAtaque() {
        if (this.ataqueAtual === 1) {
            this.ataques.push(new AtaqueGrito(this.x, this.y));
        } else {
            let baseX = player.x + player.width/2;
            let offsets = [-100, 0, 100];
            for (let dx of offsets) {
                this.ataques.push(new AtaqueBezerro(baseX + dx, 0, dx));
            }
        }
    }
    tomarDano(dano) {
        this.vida -= dano;
        bossPISCA = 10;
        return this.vida <= 0;
    }
}
class BossCorvo extends Boss {
    constructor() {
        super("corvo", 30);
    }
    executarAtaque() {
        if (this.ataqueAtual === 1) {
            let baseX = player.x + player.width/2;
            let offsets = [-60, 0, 60];
            for (let dx of offsets) {
                this.ataques.push(new AtaqueCorvo(baseX + dx, 0));
            }
            somCorvos.play();
            abafarMusicaBoss();
        } else {
            console.log('Tornado na altura:', player.y + player.height/2);
            this.ataques.push(new AtaqueTornado(width, player.y + player.height/2));
            somTornado.play();
            abafarMusicaBoss();
        }
    }
}
class AtaqueCorvo {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.velocidade = 7;
        this.frameIndex = 0;
        this.animCooldown = 0;
        this.remover = false;
        this.zigzagAmplitude = 150;
        this.zigzagFrequencia = 0.04;
        this.tempo = 0;
    }
    update() {
        this.y += this.velocidade;
        this.tempo += this.velocidade;
        this.x += Math.sin(this.tempo * this.zigzagFrequencia) * 5;
        if (this.y > height) {
            this.remover = true;
        }
        this.animCooldown += deltaTime;
        if (this.animCooldown >= 100) {
            this.frameIndex = (this.frameIndex + 1) % bossSprites.corvo.ataque1.length;
            this.animCooldown = 0;
        }
    }
    draw() {
        let sprite = bossSprites.corvo.ataque1[this.frameIndex];
        image(sprite, this.x - 60, this.y - 60, 120, 120);
    }
    checarColisao(player) {
        let d = dist(this.x, this.y, player.x + player.width/2, player.y + player.height/2);
        return d < 40;
    }
}
class AtaqueTornado {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.velocidade = 4;
        this.frameIndex = 0;
        this.animCooldown = 0;
        this.remover = false;
    }
    update() {
        this.x -= this.velocidade;
        if (this.x < -100) {
            this.remover = true;
        }
        this.animCooldown += deltaTime;
        if (this.animCooldown >= 100) {
            this.frameIndex = (this.frameIndex + 1) % bossSprites.corvo.ataque2.length;
            this.animCooldown = 0;
        }
    }
    draw() {
        let sprite = bossSprites.corvo.ataque2[this.frameIndex];
        image(sprite, this.x - 180, this.y - 180, 360, 360);
    }
    checarColisao(player) {
        let d = dist(this.x, this.y, player.x + player.width/2, player.y + player.height/2);
        return d < 50;
    }
}
class BossArvore extends Boss {
    constructor() {
        super("arvore", 30);
    }
    executarAtaque() {
        this.ataques.push(new AtaqueRaiz(player.x + player.width/2, player.y + player.height/2));
        let offset = 100;
        this.ataques.push(new AtaqueRaiz(player.x + player.width/2 + offset, player.y + player.height/2));
        this.ataques.push(new AtaqueRaiz(player.x + player.width/2 - offset, player.y + player.height/2));
        this.ataques.push(new AtaqueRaiz(player.x + player.width/2, player.y + player.height/2 + offset));
        this.ataques.push(new AtaqueRaiz(player.x + player.width/2, player.y + player.height/2 - offset));
        somRaizes.play();
        abafarMusicaBoss();
    }
}
class AtaqueRaiz {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.frameIndex = 0;
        this.animCooldown = 0;
        this.tempoTotal = 0;
        this.remover = false;
    }
    update() {
        this.tempoTotal += deltaTime;
        if (this.tempoTotal >= 1000) {
            this.remover = true;
            return;
        }
        this.animCooldown += deltaTime;
        if (this.animCooldown >= 300) {
            this.frameIndex = Math.min(this.frameIndex + 1, 2);
            this.animCooldown = 0;
        }
    }
    draw() {
        let sprite = bossSprites.arvore.ataque1[this.frameIndex];
        image(sprite, this.x - 60, this.y - 60, 120, 120);
    }
    checarColisao(player) {
        if (this.frameIndex !== 2) return false;
        let d = dist(this.x, this.y, player.x + player.width/2, player.y + player.height/2);
        return d < 40;
    }
}
class BossTouro extends Boss {
    constructor() {
        super("touro", 30);
        this.turnoBezerro = 0;
    }
    executarAtaque() {
        let centroPlayer = player.x + player.width / 2;
        let offsets = [-100, 0, 100];
        if (this.ataqueAtual === 1) {
            this.ataques.push(new AtaqueGrito(this.x, this.y));
            somBoiRugido.play();
            abafarMusicaBoss();
        } else {
            if (this.turnoBezerro < 3) {
                this.ataques.push(new AtaqueBezerro(centroPlayer, 0, this.turnoBezerro));
                somBoiRugidoMinion.play();
                this.turnoBezerro++;
                abafarMusicaBoss();
            } else {
                for (let i = 0; i < 3; i++) {
                    let posX = centroPlayer + offsets[i];
                    this.ataques.push(new AtaqueBezerro(posX, 0, i));
                    somBoiRugidoMinion.play();
                    abafarMusicaBoss();
                }
                this.turnoBezerro = 0;
            }
        }
    }
}
class AtaqueGrito {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.frameIndex = 0;
        this.animCooldown = 0;
        this.tempoTotal = 0;
        this.remover = false;
        this.velocidade = 7;
        this.angulo = atan2(player.y + player.height/2 - y, player.x + player.width/2 - x);
    }
    update() {
        this.x += cos(this.angulo) * this.velocidade;
        this.y += sin(this.angulo) * this.velocidade;
        if (this.x < -100 || this.x > width + 100 || this.y < -100 || this.y > height + 100) {
            this.remover = true;
            return;
        }
        this.animCooldown += deltaTime;
        if (this.animCooldown >= 200) {
            this.frameIndex = Math.min(this.frameIndex + 1, 1);
            this.animCooldown = 0;
        }
    }
    draw() {
        let sprite = bossSprites.touro.ataque1[this.frameIndex];
        image(sprite, this.x - 60, this.y - 60, 120, 120);
    }
    checarColisao(player) {
        if (this.frameIndex !== 1) return false;
        let d = dist(this.x, this.y, player.x + player.width/2, player.y + player.height/2);
        return d < 40;
    }
}
class AtaqueBezerro {
    constructor(x, y, frameFixo = 0) {
        this.x = x;
        this.y = y;
        this.velocidade = 6;
        this.frameFixo = frameFixo;
        this.remover = false;
    }
    update() {
        this.y += this.velocidade;
        if (this.y > height) {
            this.remover = true;
        }
    }
    draw() {
        let sprite = bossSprites.touro.ataque2[this.frameFixo];
        image(sprite, this.x - 60, this.y - 60, 120, 120);
    }
    checarColisao(player) {
        let d = dist(this.x, this.y, player.x + player.width / 2, player.y + player.height / 2);
        return d < 50;
    }
}

// ================= FUNÇÕES DE COLISÃO E OUTRAS =================
function colideComEstruturas(nx, ny) {
    let px = nx, py = ny, pw = player.width, ph = player.height;
    let mx = mercadoHitbox.x, my = mercadoHitbox.y, mw = mercadoHitbox.width, mh = mercadoHitbox.height;
    let fx = fabricaHitbox.x, fy = fabricaHitbox.y, fw = fabricaHitbox.width, fh = fabricaHitbox.height;
    let feirax = feiraHitbox.x, feiray = feiraHitbox.y, feiraw = feiraHitbox.width, feirah = feiraHitbox.height;
    let ax = acougueHitbox.x, ay = acougueHitbox.y, aw = acougueHitbox.width, ah = acougueHitbox.height;
    let sx = serrariaHitbox.x, sy = serrariaHitbox.y, sw = serrariaHitbox.width, sh = serrariaHitbox.height;
    let gx = gadoHitbox.x, gy = gadoHitbox.y, gw = gadoHitbox.width, gh = gadoHitbox.height;
    let px2 = plantacaoHitbox.x, py2 = plantacaoHitbox.y, pw2 = plantacaoHitbox.width, ph2 = plantacaoHitbox.height;
    let colideMercado = (
        px < mx + mw &&
        px + pw > mx &&
        py < my + mh &&
        py + ph > my
    );
    let colideFabrica = (
        px < fx + fw &&
        px + pw > fx &&
        py < fy + fh &&
        py + ph > fy
    );
    let colideFeira = (
        px < feirax + feiraw &&
        px + pw > feirax &&
        py < feiray + feirah &&
        py + ph > feiray
    );
    let colideAcougue = (
        px < ax + aw &&
        px + pw > ax &&
        py < ay + ah &&
        py + ph > ay
    );
    let colideSerraria = (
        px < sx + sw &&
        px + pw > sx &&
        py < sy + sh &&
        py + ph > sy
    );
    let colideGado = (
        px < gx + gw &&
        px + pw > gx &&
        py < gy + gh &&
        py + ph > gy
    );
    let colidePlantacao = (
        px < px2 + pw2 &&
        px + pw > px2 &&
        py < py2 + ph2 &&
        py + ph > py2
    );
    return colideMercado || colideFabrica || colideFeira || colideAcougue || colideSerraria || colideGado || colidePlantacao;
}
function playerMovimento() {
    player.velocidade = 3;
    let seMovendo = false;
    let nx = player.x;
    let ny = player.y;
    if (keyIsDown(87)) {
        ny -= player.velocidade;
        player.direcao = "cima";
        seMovendo = true;
    }
    if (keyIsDown(83)) {
        ny += player.velocidade;
        player.direcao = "baixo";
        seMovendo = true;
    }
    if (keyIsDown(65)) {
        nx -= player.velocidade;
        player.direcao = "esquerda";
        seMovendo = true;
    }
    if (keyIsDown(68)) {
        nx += player.velocidade;
        player.direcao = "direita";
        seMovendo = true;
    }
    if (!tela.startsWith("boss")) {
        if (!colideComEstruturas(nx, ny)) {
            player.x = nx;
            player.y = ny;
        }
    } else {
        player.x = nx;
        player.y = ny;
    }
    if (seMovendo) {
        player.animCooldown += deltaTime;
        if (player.animCooldown >= 200) {
            player.frameIndex = (player.frameIndex + 1) % 2;
            player.animCooldown = 0;
        }
    } else {
        player.frameIndex = 0;
    }
    const bordaBuffer = 40;
    player.x = constrain(player.x, 0 - bordaBuffer, width - player.width + bordaBuffer);
    player.y = constrain(player.y, 0 - bordaBuffer, height - player.height + bordaBuffer);
}
function playerPertoDe(tipo) {
    if (tipo === "mercado" && estruturas.mercado) {
        return dist(player.x, player.y, estruturas.mercado.x, estruturas.mercado.y) < 60;
    }
    return false;
}
function verificarInteracaoComNPCs() {
    for (let nome in npcs) {
        let npc = npcs[nome];
        let d = dist(player.x, player.y, npc.x, npc.y);
        if (d < 50) {
            if (npc.nome === "cowboy") {
                tela = "bossTouro";
            } else if (npc.nome === "fazendeiro") {
                tela = "bossCorvo";
            } else if (npc.nome === "lenhador") {
                tela = "bossArvore";
            }
        }
    }
}
function verificarInteracaoComEstruturas() {
    if (tela !== "mapa") return;
    for (let nome in estruturas) {
        let estrutura = estruturas[nome];
        let d = dist(player.x, player.y, estrutura.x, estrutura.y);
        if (d < 50) {
            if (nome === "fabrica") {
                venderItem("Madeira");
            } else if (nome === "acougue") {
                venderItem("Carne");
            } else if (nome === "feira") {
                venderItem("Planta");
            }
        }
    }
}

// ================= EVENTOS DO p5.js =================
function keyPressed() {
    // Bloquear qualquer ação na tela de Game Over
    if (tela === "fim") {
        return;
    }
    if ((key === 'e' || key === 'E')) {
        if (tela === "mercado") {
            somClique.play();
            tela = "mapa";
            player.y += 80;
            return;
        }
        if (tela === "mapa") {
            for (const e of estruturas) {
                let d = dist(player.x + player.width / 2, player.y + player.height / 2, e.x + 90, e.y + 100);
                if (e.tipo === "mercado" && d < 120) {
                    somClique.play();
                    abrirMercado();
                    return;
                }
                if (e.tipo === "fabrica" && d < 120 && inventario.madeira > 0) {
                    somClique.play();
                    inventario.moedas += inventario.madeira * 5;
                    inventario.madeira = 0;
                    return;
                }
                if (e.tipo === "acougue" && d < 120 && inventario.bife > 0) {
                    somClique.play();
                    inventario.moedas += inventario.bife * 5;
                    inventario.bife = 0;
                    return;
                }
                if (e.tipo === "feira" && d < 120 && inventario.milho > 0) {
                    somClique.play();
                    inventario.moedas += inventario.milho * 5;
                    inventario.milho = 0;
                    return;
                }
            }
        }
    }
    if ((key === 'q' || key === 'Q')) {
        if (tela === "inventario") {
            tela = "mapa";
        } else if (tela === "mapa") {
            tela = "inventario";
        }
    }
    if ((key === 'c' || key === 'C')) {
        if (
            tela === "mapa" &&
            empressarioFalaParte === 4 &&
            empressarioPlayerPerto &&
            inventario.medalhas >= 12 &&
            inventario.moedas >= 600
        ) {
            tela = "final_imagens";
            finalImagemIndex = 0;
            finalImagemTimer = 0;
            return;
        }
    }
    if ((key === 'm' || key === 'M')) {
        if (tela === "mapa") {
            tela = "quest";
        } else if (tela === "quest") {
            tela = "mapa";
        }
    }
    if (tela === "fim") {
        return;
    }
    if ((key === 'z' || key === 'Z')) {
        // Removido hack de moedas e medalhas
        return;
    }
    // Pular qualquer diálogo animado ao pressionar R
    if (key === 'r' || key === 'R') {
        // Tutorial: pula direto para o mapa
        if (tela === 'tutorialInicial') {
            tela = 'mapa';
            player.x = width / 2;
            player.y = height / 2;
            tutorialInicialAtivo = false;
            tutorialInicialTimer = 0;
            tutorialTypeIndex = 0;
            tutorialTypeTimer = 0;
            tutorialTypeDone = false;
            // Parar som de teclado ao sair
            if (somTeclado.isPlaying()) {
                somTeclado.stop();
            }
            return;
        }
        // Fala com NPCs do campo: pula para a última fala
        if (tela === 'mapa') {
            for (let npc of npcs) {
                if (["fazendeiro", "lenhador", "cowboy"].includes(npc.tipo)) {
                    let estado = npcDialogoEstado[npc.tipo];
                    let falas = npcFalas[npc.tipo].slice();
                    falas.push("Para enfrentar o Boss, pressione E");
                    estado.index = falas.length - 1;
                    estado.playerPerto = true;
                    estado.tempoUltimaFala = millis();
                }
                // Empressario: pula para a última fala se tiver medalhas e moedas suficientes
                if (npc.tipo === "empressario") {
                    let d = dist(player.x + player.width/2, player.y + player.height/2, npc.x + 20, npc.y + 20);
                    if (d < 120 && inventario.medalhas >= 12 && inventario.moedas >= 600) {
                        empressarioFalaParte = 4;
                        empressarioFalaTimer = 0;
                        empressarioPlayerPerto = true;
                    }
                }
            }
            return;
        }
        // Contrato
        if (tela === 'contrato') {
            contratoTypeDone = true;
            let msg = "VOCE CONSEGIU UNIR AINDA MAIS A CIDADE E O CAMPO!\nISSO É UM FEITO INCRIVEL!! AGREDEÇO POR TER JOGADO!\nVEJA OQUE VOCE REALIZOU!!";
            contratoTypeIndex = msg.length;
            return;
        }
        // Jornal
        if (tela === 'finalizacaoRosa') {
            jornalTypeDone = true;
            let jornalMsg = '"Graças a uma figura conhecido apenas como "JOGADOR" algo incrivel acontece! ele fez um contrato que ajudou o campo da melhor forma possivel!!"';
            jornalTypeIndex = jornalMsg.length;
            return;
        }
        // Laranja
        if (tela === 'finalizacaoLaranja') {
            laranjaTypeDone = true;
            let laranjaMsg = '"CAMPO PROSPERA!"\nSerraria ganha maquinarios novos!\nAs Plantações ganham drones e aviões para auxilio!\nAs produção de gado está recebendo produtos de ultima geração!\nJOGO FEITO POR MANOEL(1A)!\nCOM APOIO DE PROF WILLIAM!!\nARTE FEITO EM:https://www.pixilart.com/ ';
            laranjaTypeIndex = laranjaMsg.length;
            return;
        }
        // Pular as 3 telas finais de imagens direto para os créditos
        if (tela === 'final_imagens') {
            tela = 'agradecimento_final';
            agradecimentoFinalMostrado = true;
            finalImagemIndex = 0;
            finalImagemTimer = 0;
            creditosOffsetY = 0;
            creditosFinalizado = false;
            posCreditosEstado = "esperando";
            posCreditosTimer = 0;
            return;
        }
    }
}
function mousePressed() {
    // Game Over: só pode voltar ao menu clicando no botão Voltar após 2 segundos
    if (tela === "fim") {
        if (gameOverPodeVoltar) {
            somClique.play();
            let btnW = 200, btnH = 60;
            let btnX = width/2 - btnW/2;
            let btnY = height/2 + 120; // mais embaixo
            if (mouseX > btnX && mouseX < btnX + btnW && mouseY > btnY && mouseY < btnY + btnH) {
                tela = "menu";
                player.vida = vidaMax;
                player.x = width / 2;
                player.y = height / 2;
                tiros = [];
                tirosBoss = [];
                // Opcional: resetar inventário ou não
            }
        }
        return;
    }
    // Tutorial: só permite pular ao clicar no botão 'Pular' (quando aparecer)
    if (tela === "tutorialInicial") {
        let btnW = 200, btnH = 60;
        let btnX = width/2 - btnW/2;
        let btnY = height - 120;
        if (mouseX > btnX && mouseX < btnX + btnW && mouseY > btnY && mouseY < btnY + btnH) {
            somClique.play();
            tela = 'mapa';
            player.x = width / 2;
            player.y = height / 2;
            tutorialInicialAtivo = false;
            tutorialInicialTimer = 0;
            tutorialTypeIndex = 0;
            tutorialTypeTimer = 0;
            tutorialTypeDone = false;
            // Parar som de teclado ao sair
            if (somTeclado.isPlaying()) {
                somTeclado.stop();
            }
        }
        return;
    }
    if (tela === "fim") {
        return;
    }
    if (tela === "menu" &&
        mouseX > width / 2 - 100 &&
        mouseX < width / 2 + 100 &&
        mouseY > 150 &&
        mouseY < 210
    ) {
        somClique.play();
        tela = "tutorialInicial";
        tutorialInicialAtivo = true;
        tutorialInicialTimer = 0;
        for (let npc of npcs) {
            npc.spriteIndex = 0;
            npc.tempoAnim = 0;
        }
    }
    if (tela === "mercado") {
        // Vida
        if (
            mouseX > placaVidaX - placaLargura / 2 &&
            mouseX < placaVidaX + placaLargura / 2 &&
            mouseY > placaVidaY - placaAltura / 2 &&
            mouseY < placaVidaY + placaAltura / 2
        ) {
            somClique.play();
            if (player.vidaMax >= 5) {
                mercadoPiscaCor = 'red';
                mercadoPiscaTimer = 1000;
                mercadoMensagem = 'Limite de compra!';
                mercadoMensagemTimer = 4000;
                return;
            }
            if (inventario.moedas < 100) {
                mercadoPiscaCor = 'yellow';
                mercadoPiscaTimer = 1000;
                mercadoMensagem = 'Você não tem dinheiro o suficiente!';
                mercadoMensagemTimer = 4000;
                return;
            }
            if (player.vidaMax - 3 >= 2) {
                mercadoPiscaCor = 'red';
                mercadoPiscaTimer = 1000;
                mercadoMensagem = 'Limite de compra!';
                mercadoMensagemTimer = 4000;
                return;
            }
            inventario.moedas -= 100;
            player.vidaMax += 1;
            player.vida = player.vidaMax;
            mercadoPiscaCor = 'green';
            mercadoPiscaTimer = 1000;
            mercadoMensagem = 'Item comprado!';
            mercadoMensagemTimer = 4000;
            return;
        }
        // Dano
        if (
            mouseX > placaDanoX - placaLargura / 2 &&
            mouseX < placaDanoX + placaLargura / 2 &&
            mouseY > placaDanoY - placaAltura / 2 &&
            mouseY < placaDanoY + placaAltura / 2
        ) {
            somClique.play();
            if (inventario.dano >= 3) {
                mercadoPiscaCor = 'red';
                mercadoPiscaTimer = 1000;
                mercadoMensagem = 'Limite de compra!';
                mercadoMensagemTimer = 4000;
                return;
            }
            if (inventario.moedas < 100) {
                mercadoPiscaCor = 'yellow';
                mercadoPiscaTimer = 1000;
                mercadoMensagem = 'Você não tem dinheiro o suficiente!';
                mercadoMensagemTimer = 4000;
                return;
            }
            if (inventario.dano - 1 >= 2) {
                mercadoPiscaCor = 'red';
                mercadoPiscaTimer = 1000;
                mercadoMensagem = 'Limite de compra!';
                mercadoMensagemTimer = 4000;
                return;
            }
            inventario.moedas -= 100;
            inventario.dano += 1;
            dano = inventario.dano;
            mercadoPiscaCor = 'green';
            mercadoPiscaTimer = 1000;
            mercadoMensagem = 'Item comprado!';
            mercadoMensagemTimer = 4000;
            return;
        }
        return;
    }
    if (tela.startsWith("boss") && mouseButton === LEFT && cooldownTiro <= 0) {
        atirar();
        cooldownTiro = 500;
    }
}

// Função para exibir a tela de Game Over
function fimDeJogo() {
    background(30, 0, 0); // fundo escuro
    fill(255, 60, 60);
    textAlign(CENTER, CENTER);
    textSize(60);
    text("GAME OVER", width/2, height/2 - 80);
    textSize(28);
    fill(255);
    textSize(22);
    text("Moedas: " + inventario.moedas + "   Medalhas: " + inventario.medalhas, width/2, height/2 + 50);
    // Botão Voltar
    if (gameOverPodeVoltar) {
        let btnW = 200, btnH = 60;
        let btnX = width/2 - btnW/2;
        let btnY = height/2 + 120; // mais embaixo
        fill(255);
        stroke(0);
        strokeWeight(2);
        rect(btnX, btnY, btnW, btnH, 15);
        noStroke();
        fill(0);
        textSize(32);
        textAlign(CENTER, CENTER);
        text("Voltar", width/2, btnY + btnH/2);
    }
}

// Desenha a barra de progresso dos bosses na HUD do mapa
function desenharQuestBarHUD() {
    // Só desenha no mapa
    if (tela !== "mapa") return;
    // Calcula progresso
    let bossesDerrotados = 0;
    if (inventario.milho >= 10) bossesDerrotados++; // Corvo
    if (inventario.madeira >= 10) bossesDerrotados++; // Arvore
    if (inventario.bife >= 10) bossesDerrotados++; // Touro
    // Ícones dos bosses
    let bossFrames = [
        bossSprites.corvo.idle[menuBossFrame],
        bossSprites.arvore.idle[menuBossFrame],
        bossSprites.touro.idle[menuBossFrame]
    ];
    let iconSize = 32;
    let startX = width - 220;
    let y = 30;
    for (let i = 0; i < bossFrames.length; i++) {
        imageMode(CENTER);
        image(bossFrames[i], startX + i*50, y, iconSize, iconSize);
        if ((i === 0 && inventario.milho >= 10) ||
            (i === 1 && inventario.madeira >= 10) ||
            (i === 2 && inventario.bife >= 10)) {
            fill(0,255,0,180);
            ellipse(startX + i*50, y, iconSize*0.7, iconSize*0.7);
            fill(255);
            textSize(12);
            text("OK", startX + i*50, y+2);
        }
    }
    imageMode(CORNER);
    // Barra e texto de progresso
    let barraX = startX + 3*50 + 10;
    let barraY = y - 18;
    let barraW = 90;
    let barraH = 32;
    fill(255,80,80);
    rect(barraX, barraY, barraW, barraH, 10);
    fill(80,0,0);
    textSize(14);
    textAlign(LEFT, CENTER);
    let textoQuest = "Boss: " + bossesDerrotados + "/3";
    if (bossesDerrotados === 3) textoQuest = "Tarefa Pronta! (3/3)";
    text(textoQuest, barraX + 10, barraY + barraH/2);
}

// Controle de diálogo dos NPCs do campo
let npcDialogoEstado = {
    fazendeiro: { index: 0, playerPerto: false },
    lenhador: { index: 0, playerPerto: false },
    cowboy: { index: 0, playerPerto: false }
};

// Nova função para mostrar as imagens finais
function mostrarTelaFinalImagens() {
    // Efeito de piscar antes de trocar de imagem
    if (finalImagemPisca) {
        // Calcula frequência do piscar: começa lento e acelera
        let t = finalImagemPiscaTimer / finalImagemPiscaDuracao;
        // Frequência vai de 1Hz até 5Hz (mais devagar)
        let freq = lerp(1, 5, t);
        // Calcula se deve ser preto ou mostrar a imagem neste frame
        let blink = floor(finalImagemPiscaTimer / (1000/(freq*2))) % 2 === 0;
        // Efeito de tremor
        let shakeX = random(-finalImagemShake, finalImagemShake);
        let shakeY = random(-finalImagemShake, finalImagemShake);
        push();
        translate(shakeX, shakeY);
        if (blink) {
            background(0);
        } else {
            let img = null;
            if (finalImagemIndex === 0) img = imgFinalContrato;
            else if (finalImagemIndex === 1) img = imgFinalJornal;
            if (img) {
                imageMode(CENTER);
                image(img, width/2, height/2, min(width, img.width), min(height, img.height));
                imageMode(CORNER);
            }
        }
        pop();
        finalImagemPiscaTimer += deltaTime;
        if (finalImagemPiscaTimer >= finalImagemPiscaDuracao) {
            finalImagemPisca = false;
            finalImagemPiscaTimer = 0;
            finalImagemIndex++;
            finalImagemTimer = 0;
            if (finalImagemIndex > 1) {
                // Em vez de voltar ao menu, vai para a tela de agradecimento
                tela = "agradecimento_final";
                agradecimentoFinalMostrado = true;
                finalImagemIndex = 0;
                finalImagemTimer = 0;
                // Resetar créditos
                creditosOffsetY = 0;
                creditosFinalizado = false;
            }
        }
        return;
    }
    background(0);
    let img = null;
    if (finalImagemIndex === 0) img = imgFinalContrato;
    else if (finalImagemIndex === 1) img = imgFinalJornal;
    if (img) {
        imageMode(CENTER);
        image(img, width/2, height/2, min(width, img.width), min(height, img.height));
        imageMode(CORNER);
    }
    finalImagemTimer += deltaTime;
    if (finalImagemTimer > finalImagemDuracao) {
        finalImagemPisca = true;
        finalImagemPiscaTimer = 0;
        return;
    }
}

// Nova função para mostrar a tela de agradecimento final com efeito de créditos rolando
let creditosOffsetY = 0;
let creditosVelocidade = 0.5; // pixels por frame (lento)
let creditosFinalizado = false;

// Pós-créditos animado
let posCreditosEstado = "esperando"; // esperando, entrando, parado, falando, saindo, fim
let posCreditosTimer = 0;
let posCreditosPlayerX = 0;
let posCreditosPlayerY = 0;
let posCreditosFrame = 0;
let posCreditosAnimTimer = 0;

function mostrarTelaAgradecimentoFinal() {
    background(0);
    fill(255);
    textAlign(CENTER, TOP);
    let linhas = [
        "ALIANÇA DA RUA E DA CIDADE",
        "",
        "Obrigado por jogar!",
        "",
        "Agradeço a todos que estiveram ao meu lado" ,
"nessa jornada!",
" A experiência que eu ganhei até",
 "aqui não tem preço.",
        "Obrigado, professor Willian Schon Lopes",
"",
 "foi justamente você quem me trouxe essa oportunidade!",
"",
        "Espero, de verdade, que eu",
" tenha conseguido te orgulhar.",
        "",
        "Também agradeço a todos os meus amigos",
"",
 "que me apoiaram e acompanharam meu",
" desenvolvimento neste projeto.",
"",
        "Tudo isso foi como um sonho para mim.",
        "",
        "Agradeço de coração aos jogadores",
" que estão lendo esta mensagem.",
"",
        "Vocês chegaram até aqui. Muito obrigado.",
        "",
        "Agradeço ao Agrinho pela oportunidade.",
        "",
        "Gratidão total!",
        "",
        "JOGO FEITO POR:",
        "Manoel Eduardo Chicouski da Cruz",
        "Aluno da Escola Professor Pedro Carli — 1º ano do Ensino Médio.",
        "Com apoio do professor Willian.",
        "",
        "Arte do jogo criada no PixelArt.com",
        "Efeitos sonoros criados em Suno.com",
        "",
        "Obrigado por ter chegado até aqui.",
        "",
        "❤"
    ];
    let espacamento = 38;
    let blocoW = width * 0.6;
    let blocoX = width/2 - blocoW/2;
    let totalAltura = linhas.length * espacamento + 100;
    // Calcular velocidade para durar 32 segundos
    let tempoTotal = 32000; // ms
    let distancia = totalAltura + height;
    let creditosVelocidade = distancia / (tempoTotal / (1000/60)); // px/frame (aprox 60fps)
    // Inicializa offset se for a primeira vez
    if (creditosOffsetY === 0) {
        creditosOffsetY = height + 40;
        creditosFinalizado = false;
        posCreditosEstado = "esperando";
        posCreditosTimer = 0;
    }
    // Atualiza offset para rolar para cima
    if (!creditosFinalizado) {
        creditosOffsetY -= creditosVelocidade;
        if (creditosOffsetY < -totalAltura) {
            creditosFinalizado = true;
            posCreditosEstado = "esperando";
            posCreditosTimer = 0;
        }
    }
    textSize(22);
    for (let i = 0; i < linhas.length; i++) {
        let y = creditosOffsetY + i * espacamento + 40;
        text(linhas[i], blocoX, y, blocoW, espacamento);
    }
    // Pós-créditos animado
    if (creditosFinalizado) {
        posCreditosTimer += deltaTime;
        if (posCreditosEstado === "esperando" && posCreditosTimer > 5000) {
            posCreditosEstado = "entrando";
            posCreditosPlayerX = -180;
            posCreditosPlayerY = height - 220;
            posCreditosAnimTimer = 0;
            posCreditosFrame = 0;
        }
        if (posCreditosEstado === "entrando") {
            // Animação andando para a direita
            posCreditosPlayerX += 2.2;
            posCreditosAnimTimer += deltaTime;
            if (posCreditosAnimTimer > 180) {
                posCreditosFrame = (posCreditosFrame + 1) % playerSprites.direita.length;
                posCreditosAnimTimer = 0;
            }
            let sprite = playerSprites.direita[posCreditosFrame];
            image(sprite, posCreditosPlayerX, posCreditosPlayerY, 180, 180);
            if (posCreditosPlayerX >= width/2 - 90) {
                posCreditosEstado = "parado";
                posCreditosTimer = 0;
            }
        } else if (posCreditosEstado === "parado") {
            // Parado olhando para frente
            let sprite = playerSprites.baixo[0];
            image(sprite, posCreditosPlayerX, posCreditosPlayerY, 180, 180);
            posCreditosTimer += deltaTime;
            if (posCreditosTimer > 400) {
                posCreditosEstado = "falando";
                posCreditosTimer = 0;
            }
        } else if (posCreditosEstado === "falando") {
            // Parado olhando para frente + balão de fala
            let sprite = playerSprites.baixo[0];
            image(sprite, posCreditosPlayerX, posCreditosPlayerY, 180, 180);
            // Balão de fala
            let fala = "Aliança da Rua e Dos campos\nParte 2 sera feito nos proximos anos!!";
            let balaoW = 420, balaoH = 120;
            let balaoX = posCreditosPlayerX + 90 - balaoW/2 + 90;
            let balaoY = posCreditosPlayerY - balaoH - 30;
            // Centralizar o balão acima do player
            balaoX = posCreditosPlayerX + 90 - balaoW/2;
            fill(255);
            stroke(60,60,60);
            strokeWeight(3);
            rect(balaoX, balaoY, balaoW, balaoH, 24);
            noStroke();
            fill(30, 100, 40);
            textSize(24);
            textAlign(CENTER, CENTER);
            // Ajuste para centralizar melhor o texto no balão
            let textoOffsetX = -170;
            let textoOffsetY = -60;
            text(fala, balaoX + balaoW/2 + textoOffsetX, balaoY + balaoH/2 + textoOffsetY, balaoW-24, balaoH-24);
            posCreditosTimer += deltaTime;
            if (posCreditosTimer > 10000) {
                posCreditosEstado = "saindo";
                posCreditosTimer = 0;
            }
        } else if (posCreditosEstado === "saindo") {
            // Andando para a direita
            posCreditosPlayerX += 2.2;
            posCreditosAnimTimer += deltaTime;
            if (posCreditosAnimTimer > 180) {
                posCreditosFrame = (posCreditosFrame + 1) % playerSprites.direita.length;
                posCreditosAnimTimer = 0;
            }
            let sprite = playerSprites.direita[posCreditosFrame];
            image(sprite, posCreditosPlayerX, posCreditosPlayerY, 180, 180);
            if (posCreditosPlayerX > width + 180) {
                posCreditosEstado = "fim";
            }
        }
    }
}

// Controle de música temática
function tocarMusica(musica) {
    if (musica && !musica.isPlaying()) {
        musica.loop();
    }
}

// Função para abafar a música do boss
function abafarMusicaBoss() {
    if (tela === "boss" && musicaBoss.isPlaying()) {
        bossMusicAbafadaTimer = bossMusicAbafadaDuracao;
    }
}


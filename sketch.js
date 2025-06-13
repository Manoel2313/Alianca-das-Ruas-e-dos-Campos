// Variáveis gerais
let tela = "menu";
let player;

let keys = {};
let npcSprites = [];

let tiros = [];
let cooldownTiro = 0;

let tirosBoss = [];
let cooldownTiroBoss = 3000;

let bossPISCA = 0;

// Variáveis para os bosses
let bossAtual = null;
let bossSprites = {
    corvo: {
        idle: [],
        ataque1: [],
        ataque2: []
    },
    arvore: {
        idle: [],
        ataque1: []
    },
    touro: {
        idle: [],
        ataque1: [],
        ataque2: []
    }
};
let bossBackground;

// Classe base para os bosses
class Boss {
    constructor(tipo, vida) {
        this.tipo = tipo;
        this.vida = vida;
        this.vidaMax = vida;
        this.x = width - 180 / 2 - 30; // 30px de margem da direita
        this.y = height / 2;
        this.frameIndex = 0;
        this.animCooldown = 0;
        this.ataqueCooldown = 0;
        this.ataqueAtual = 1;
        this.ataques = [];
        // Delay inicial antes de atacar
        this.tempoEsperaInicial = 2000; // 2 segundos
        this.esperando = true;
        this.tempoDecorrido = 0;
    }

    update() {
        // Delay inicial antes de atacar
        if (this.esperando) {
            this.tempoDecorrido += deltaTime;
            if (this.tempoDecorrido >= this.tempoEsperaInicial) {
                this.esperando = false;
            } else {
                // Atualiza animação mesmo esperando
                this.animCooldown += deltaTime;
                if (this.animCooldown >= 200) {
                    this.frameIndex = (this.frameIndex + 1) % 2;
                    this.animCooldown = 0;
                }
                return; // Não faz nada até acabar o delay
            }
        }

        // Atualiza animação
        this.animCooldown += deltaTime;
        if (this.animCooldown >= 200) {
            this.frameIndex = (this.frameIndex + 1) % 2;
            this.animCooldown = 0;
        }

        // Atualiza cooldown do ataque
        if (this.ataqueCooldown > 0) {
            this.ataqueCooldown -= deltaTime;
        }

        // Atualiza ataques ativos
        for (let i = this.ataques.length - 1; i >= 0; i--) {
            let ataque = this.ataques[i];
            ataque.update();
            if (ataque.remover) {
                this.ataques.splice(i, 1);
            }
        }
    }

    draw() {
        // Desenha o boss 3x maior
        let sprite = bossSprites[this.tipo].idle[this.frameIndex];
        image(sprite, this.x - 90, this.y - 90, 180, 180);

        // Desenha ataques ativos
        for (let ataque of this.ataques) {
            ataque.draw();
        }
    }

    atacar() {
        // Só ataca se não estiver esperando, cooldown acabou e não há ataques ativos
        if (!this.esperando && this.ataqueCooldown <= 0 && this.ataques.length === 0) {
            this.ataqueAtual = this.ataqueAtual === 1 ? 2 : 1;
            this.ataqueCooldown = 2000; // 2 segundos entre ataques
            this.executarAtaque();
        }
    }

    executarAtaque() {
        if (this.ataqueAtual === 1) {
            // Ataque do grito
            this.ataques.push(new AtaqueGrito(this.x, this.y));
        } else {
            // Ataque dos bezerros, lado a lado centralizados no player
            let baseX = player.x + player.width/2;
            let offsets = [-100, 0, 100];
            for (let i = 0; i < 3; i++) {
                this.ataques.push(new AtaqueBezerro(baseX + offsets[i], 0, i));
            }
        }
    }

    tomarDano(dano) {
        this.vida -= dano;
        bossPISCA = 10;
        return this.vida <= 0;
    }
}

let playerSprites = {
    direita: [],
    esquerda: [],
    cima: [],
    baixo: [],
    projetil: []
};

// Inventário e atributos do jogador
let inventario = {
  moedas: 0,  
  vida: 3,      // vida inicial
  dano: 1,       // dano inicial
  madeira: 0,
  bife: 0,
  milho: 0,
  medalhas: 0,
};

let vidaMax = inventario.vida;
let dano = 1;

let bossVida = 1;
let imgPlacaVida, imgPlacaDano;

let placaVidaX, placaVidaY, placaDanoX, placaDanoY;
let placaLargura = 200;
let placaAltura = 200;

let coracaoImg = null;

// Variável global para mensagem do mercado
let mensagemVidaMax = "";
let mensagemDanoMax = "";

// Variáveis globais para o balão do Empressario
let empressarioFalaParte = 1;
let empressarioFalaTimer = 0;
let empressarioPlayerPerto = false;

// Variável global para controlar o tempo na tela de contrato
let contratoTimer = 0;
let contratoMostrandoCarregando = false;

// Variável global para controlar o tempo na tela rosa
let jornalTimer = 0;
let jornalMostrandoCarregando = false;

// Variável global para controlar o tempo na tela laranja
let laranjaTimer = 0;
let laranjaMostrandoCarregando = false;

// Variáveis globais para efeito typewriter nas telas finais
let contratoTypeIndex = 0, contratoTypeTimer = 0, contratoTypeDone = false;
let jornalTypeIndex = 0, jornalTypeTimer = 0, jornalTypeDone = false;
let laranjaTypeIndex = 0, laranjaTypeTimer = 0, laranjaTypeDone = false;
const typeSpeed = 30; // ms por letra

// NPCs no campo (fixos)
npcs = [{
        x: 550,
        y: 450,
        spriteIndex: 0,
        nome: "Fazendeiro",
        tipo: "fazendeiro",
        tempoAnim: 0,
        area: "campo"
    },
    {
        x: 550,
        y: 300,
        spriteIndex: 0,
        nome: "Cowboy",
        tipo: "cowboy",
        tempoAnim: 0,
        area: "campo"
    },
    {
        x: 550,
        y: 150,
        spriteIndex: 0,
        nome: "Lenhador",
        tipo: "lenhador",
        tempoAnim: 0,
        area: "campo"
    },
    // Novo NPC Empressario ao lado direito do mercado
    {
        x: 280, // lado direito do mercado
        y: 110, // alinhado com o mercado
        spriteIndex: 0,
        nome: "Empressario",
        tipo: "empressario",
        tempoAnim: 0,
        area: "cidade"
    }
];


let podeInteragir = true; // trava para não repetir a ação várias vezes

document.addEventListener("keydown", (e) => {
    if (e.code === "KeyE") {
        keys["KeyE"] = true;
    }
});

document.addEventListener("keyup", (e) => {
    if (e.code === "KeyE") {
        keys["KeyE"] = false;
        podeInteragir = true; // libera a interação quando soltar o E
    }
});




const estruturas = [
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
    },
];


function preload() {
    // Direita
    playerSprites.direita.push(loadImage("Imagem/player/pixil-frame-1.png"));
    playerSprites.direita.push(loadImage("Imagem/player/pixil-frame-2.png"));

    // Esquerda
    playerSprites.esquerda.push(loadImage("Imagem/player/pixil-frame-4.png"));
    playerSprites.esquerda.push(loadImage("Imagem/player/pixil-frame-3.png"));

    // Baixo
    playerSprites.baixo.push(loadImage("Imagem/player/pixil-frame-6.png"));
    playerSprites.baixo.push(loadImage("Imagem/player/pixil-frame-7.png"));

    // Cima
    playerSprites.cima.push(loadImage("Imagem/player/pixil-frame-8.png"));
    playerSprites.cima.push(loadImage("Imagem/player/pixil-frame-9.png"));

    // Projétil
    playerSprites.projetil.push(loadImage("Imagem/player/pixil-frame-12.png"));
    playerSprites.projetil.push(loadImage("Imagem/player/pixil-frame-14.png"));

    // Estruturas
    for (let est of estruturas) {
        est.img = loadImage(est.arquivo);
    }

    imgPlacaVida = loadImage("Imagem/Placas/pixil-frame-0.png");
    imgPlacaDano = loadImage("Imagem/Placas/pixil-frame-1.png");

    // NPC sprites 
    npcSprites = {
        fazendeiro: [loadImage("Imagem/npc/pixil-frame-0.png"), loadImage("Imagem/npc/pixil-frame-1.png")],
        lenhador: [loadImage("Imagem/npc/pixil-frame-2.png"), loadImage("Imagem/npc/pixil-frame-3.png")],
        cowboy: [loadImage("Imagem/npc/pixil-frame-4.png"), loadImage("Imagem/npc/pixil-frame-5.png")],
        empressario: [loadImage("Imagem/npc/pixil-frame-6.png"), loadImage("Imagem/npc/pixil-frame-7.png")]
    };
  
    coracaoImg = loadImage("Imagem/player/coracao.png");

    // Boss sprites
    bossBackground = loadImage("Imagem/Boss/pixil-frame-6.png");

    // Corvo
    bossSprites.corvo.idle.push(loadImage("Imagem/Boss/pixil-frame-1.png"));
    bossSprites.corvo.idle.push(loadImage("Imagem/Boss/pixil-frame-2.png"));
    bossSprites.corvo.ataque1.push(loadImage("Imagem/Boss/pixil-frame-3.png"));
    bossSprites.corvo.ataque2.push(loadImage("Imagem/Boss/pixil-frame-4.png"));
    bossSprites.corvo.ataque2.push(loadImage("Imagem/Boss/pixil-frame-5.png"));

    // Árvore
    bossSprites.arvore.idle.push(loadImage("Imagem/Boss/pixil-frame-7.png"));
    bossSprites.arvore.idle.push(loadImage("Imagem/Boss/pixil-frame-8.png"));
    bossSprites.arvore.ataque1.push(loadImage("Imagem/Boss/pixil-frame-9.png"));
    bossSprites.arvore.ataque1.push(loadImage("Imagem/Boss/pixil-frame-10.png"));
    bossSprites.arvore.ataque1.push(loadImage("Imagem/Boss/pixil-frame-11.png"));

    // Touro
    bossSprites.touro.idle.push(loadImage("Imagem/Boss/pixil-frame-13.png"));
    bossSprites.touro.idle.push(loadImage("Imagem/Boss/pixil-frame-14.png"));
    bossSprites.touro.ataque1.push(loadImage("Imagem/Boss/pixil-frame-15.png"));
    bossSprites.touro.ataque1.push(loadImage("Imagem/Boss/pixil-frame-16.png"));
    bossSprites.touro.ataque2.push(loadImage("Imagem/Boss/pixil-frame-18.png"));
    bossSprites.touro.ataque2.push(loadImage("Imagem/Boss/pixil-frame-19.png"));
    bossSprites.touro.ataque2.push(loadImage("Imagem/Boss/pixil-frame-20.png"));
}


// Mercado
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
    x: acougueX + acougueSpriteW * 0.425, // centraliza 15% (0.5 - 0.15/2)
    y: acougueY + acougueSpriteH * 0.425,
    width: acougueSpriteW * 0.15,
    height: acougueSpriteH * 0.15
};

function desenharEstruturas() {
    if (player.x < width / 2) {
        // mostrar apenas estruturas da cidade
        for (const e of estruturas) {
            if (e.area === "cidade") {
                if (e.tipo === "acougue") {
                    // Aumenta o sprite do açougue em 10% e move para a esquerda
                    image(e.img, acougueX, acougueY, 200 * 1.1, 220 * 1.1);
                } else {
                    image(e.img, e.x, e.y);
                }
            }
        }
    } else {
        // mostrar apenas estruturas do campo
        for (const e of estruturas) {
            if (e.area === "campo") {
                image(e.img, e.x, e.y);
            }
        }
    }
}

function setup() {
    createCanvas(800, 600);
    player = {
        x: width / 2,
        y: height / 2,
        velocidade: 3,
        vida: 3,
        vidaMax: 3,
        width: 120,
        height: 120,
        direcao: "baixo",
        frameIndex: 0,
        animCooldown: 0
    };
}

// Variáveis globais para animação do menu
let menuNPCFrame = 0;
let menuNPCAnimTimer = 0;
let menuBossFrame = 0;
let menuBossAnimTimer = 0;

// Variáveis globais para tutorial inicial
let tutorialInicialAtivo = false;
let tutorialInicialTimer = 0;

function draw() {
    background(220);

    // Atualiza animação do menu (NPCs: 1s, Bosses: 200ms)
    if (tela === "menu") {
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

    if (tela === "menu") {
        menu();
    } else if (tela === "tutorialInicial") {
        // Tela preta de tutorial
        background(0);
        fill(255);
        textAlign(CENTER, TOP);
        textSize(36);
        text("TUTORIAL", width/2, 60);
        textSize(24);
        let tutMsg = "WASD = MOVIMENTO! \nESPAÇO = DISPARAR PROJETIL! (somente nos boss!) \nQ = INVENTARIO! \nE = INTERAGIR!";
        text(tutMsg, width/2, 100, 40, 800);
        tutorialInicialTimer += deltaTime;
        if (tutorialInicialTimer > 10000) {
            tela = "mapa";
            player.x = width / 2;
            player.y = height / 2;
            tutorialInicialAtivo = false;
            tutorialInicialTimer = 0;
        }
    } else if (tela === "mapa") {
        mapa();
    } else if (tela.startsWith("boss")) {
        boss();
    } else if (tela === "inventario") {
        mostrarInventario();
    } else if (tela === "mercado") {
        mostrarMercado();
    } else if (tela === "fim") {
        fimDeJogo();
    } else if (tela === "contrato") {
        background(255, 255, 0);
        fill(60);
        textAlign(CENTER, TOP);
        textSize(36);
        text("PARABENS JOGADOR!", width/2, 80);
        textSize(22);
        let msg = "VOCE CONSEGIU UNIR AINDA MAIS A CIDADE E O CAMPO!\nISSO É UM FEITO INCRIVEL!! AGREDEÇO POR TER JOGADO!\nVEJA OQUE VOCE REALIZOU!!";
        // Typewriter effect
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
        // Só começa o timer de carregando depois do texto completo
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
                    tela = "finalizacaoRosa";
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
        // Tela cinza final
        background(180);
    } else if (tela === "finalizacaoRosa") {
        background(255, 100, 200);
        fill(60);
        textAlign(CENTER, TOP);
        textSize(40);
        text("JORNAL!", width/2, 60);
        textSize(28);
        let jornalMsg = '"Graças a uma figura conhecido apenas como \"JOGADOR\" algo incrivel acontece! ele fez um contrato que ajudou o campo da melhor forma possivel!!"';
        let blocoW = 500;
        let blocoX = width/2 - blocoW/2 - 300;
        // Typewriter effect
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
        // Só começa o timer de carregando depois do texto completo
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
        background(255, 150, 0);
        fill(60);
        textAlign(CENTER, TOP);
        textSize(38);
        text("A NOVA ERA DO CAMPO!", width/2, 60);
        textSize(24);
        let laranjaMsg = '"CAMPO PROSPERA!"\nSerraria ganha maquinarios novos!\nAs Plantações ganham drones e aviões para auxilio!\nAs produção de gado está recebendo produtos de ultima geração!\nJOGO FEITO POR MANOEL(1A)!\nCOM APOIO DE PROF WILLIAM!!\nARTE FEITO EM:https://www.pixilart.com/ ';
        let blocoW = 600;
        let blocoX = width/2 - blocoW/2 - 300;
        // Typewriter effect
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
        // Só começa o timer de carregando depois do texto completo
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
    } 


    if (cooldownTiro > 0) cooldownTiro -= deltaTime;
    if (cooldownTiroBoss > 0) cooldownTiroBoss -= deltaTime;

if (!playerPertoDe("mercado")) {
    podeInteragirComMercado = true;
  }

}

function mostrarMercado() {
  background(150, 200, 150); // cor de fundo do mercado

  fill(0);
  textSize(32);
  textAlign(CENTER);
  text("Mercado", width / 2, 50);

  imageMode(CENTER);

  // Definindo posições
  placaVidaX = width / 2;
  placaVidaY = height / 2 - 100;
  placaDanoX = width / 2;
  placaDanoY = height / 2 + 100;

  // Desenha as placas
  image(imgPlacaVida, placaVidaX, placaVidaY, 200, 200);
  image(imgPlacaDano, placaDanoX, placaDanoY, 200, 200);

  imageMode(CORNER);

  textSize(16);
  text("Pressione E para sair", width / 2, height - 50);

  // Mensagem de limite de vida máxima
  if (mensagemVidaMax) {
    fill(255, 0, 0);
    text(mensagemVidaMax, placaVidaX, placaVidaY + 25);
    fill(0);
  }
  // Mensagem de limite de dano
  if (mensagemDanoMax) {
    fill(255, 0, 0);
    text(mensagemDanoMax, placaDanoX, placaDanoY + 25);
    fill(0);
  }
}


function desenharNPCs() {
    for (let npc of npcs) {
        // NPCs da cidade: aparecem na cidade e na tela 'mapa'
        if (npc.area === "cidade" && player.x < width / 2 && tela === "mapa") {
            npc.tempoAnim += deltaTime;
            if (npc.tempoAnim >= 1000) { // troca de frame a cada 1 segundo
                npc.spriteIndex++;
                npc.tempoAnim = 0;
            }
            let frameIndex = npc.spriteIndex % 2;
            let sprite = npcSprites[npc.tipo][frameIndex];
            if (npc.tipo === "empressario") {
                // Mantém o centro igual ao dos outros NPCs
                let scale = 1.1;
                let baseW = 350, baseH = 350;
                let offsetX = 150, offsetY = 80;
                let extraW = baseW * (scale - 1);
                let extraH = baseH * (scale - 1);
                image(sprite, npc.x - offsetX - extraW/2, npc.y - offsetY - extraH/2, baseW * scale, baseH * scale);
                // Balão de conversa se player estiver perto
                let d = dist(player.x + player.width/2, player.y + player.height/2, npc.x + 20, npc.y + 20);
                let playerPerto = d < 120 && inventario.medalhas >= 12 && inventario.moedas >= 600;
                if (playerPerto) {
                    if (!empressarioPlayerPerto) {
                        // Reset ao se aproximar
                        empressarioFalaParte = 1;
                        empressarioFalaTimer = 0;
                    }
                    empressarioPlayerPerto = true;
                    // Avança as partes a cada 3 segundos, até a 4
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
                image(sprite, npc.x - 150, npc.y - 80, 350, 350);
            }
        }
        // NPCs do campo: aparecem só no campo e na tela 'mapa'
        if (npc.area === "campo" && player.x >= width / 2 && tela === "mapa") {
            npc.tempoAnim += deltaTime;
            if (npc.tempoAnim >= 1000) { // troca de frame a cada 1 segundo
                npc.spriteIndex++;
                npc.tempoAnim = 0;
            }
            let frameIndex = npc.spriteIndex % 2;
            let sprite = npcSprites[npc.tipo][frameIndex];
            image(sprite, npc.x - 150, npc.y - 80, 350, 350);
        }
    }
}

// MENU
function menu() {
    // Fundo céu
    background(70, 160, 255);
    // Grama (parte de baixo) - subir 30% da tela
    let gramaY = height * 0.4; // era 0.7, subiu 30%
    fill(80, 200, 80);
    rect(0, gramaY, width, height - gramaY);

    // --- Estruturas (ao fundo, linha na base do céu/grama) ---
    let estruturaY = gramaY + 20 + height * 0.05; // desce 5% da tela
    let espacamentoEstruturas = width / (estruturas.filter(e => e.area === "cidade" || e.area === "campo").length + 1);
    let idxEstrutura = 1;
    for (let e of estruturas) {
        let x = espacamentoEstruturas * idxEstrutura;
        imageMode(CENTER);
        image(e.img, x, estruturaY, 100, 100);
        idxEstrutura++;
    }
    imageMode(CORNER);

    // --- Bosses (em coluna no lado direito) ---
    let bosses = [
        bossSprites.corvo.idle[menuBossFrame],
        bossSprites.arvore.idle[menuBossFrame],
        bossSprites.touro.idle[menuBossFrame]
    ];
    let bossColX = width * 0.82; // lado direito, mas não encostado
    let bossColTop = gramaY + 100; // bosses mais para baixo (era +40)
    let bossColH = height - bossColTop - 60;
    let bossEspaco = bossColH / ((bosses.length - 1) * 2) * 1.1; // bosses mais afastados 10%
    for (let i = 0; i < bosses.length; i++) {
        let y = bossColTop + i * bossEspaco;
        imageMode(CENTER);
        image(bosses[i], bossColX, y, 80, 80);
    }
    imageMode(CORNER);

    // --- NPCs (duas colunas, mais afastados) ---
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
        let w = 70 * scale * 3, h = 70 * scale * 3; // 3x maior
        imageMode(CENTER);
        image(sprite, x, y, w, h);
    }
    imageMode(CORNER);

    // --- Player imóvel centralizado na parte de baixo ---
    let playerY = gramaY + 180; // era height * 0.7 + 60, agora mais baixo
    let playerX = width / 2;
    let playerSprite = playerSprites.baixo[0];
    imageMode(CENTER);
    image(playerSprite, playerX, playerY, 90 * 1.8, 90 * 1.8); // aumenta o player em 80%
    imageMode(CORNER);

    // --- Botão JOGAR no topo ---
    let botaoW = 200, botaoH = 60;
    let botaoX = width / 2 - botaoW / 2;
    let botaoY = 90 + height * 0.1; // 10% mais para baixo
    fill(255);
    stroke(0);
    strokeWeight(2);
    rect(botaoX, botaoY, botaoW, botaoH, 15);
    noStroke();
    fill(0);
    textSize(32);
    textAlign(CENTER, CENTER);
    text("JOGAR", width / 2, botaoY + botaoH / 2);

    // --- Frase estilizada acima do botão ---
    let fraseY = botaoY - 30 + height * 0.02; // um pouco mais acima (reduzido de 0.1 para 0.02)
    textSize(30);
    fill(255);
    stroke(0);
    strokeWeight(4);
    textAlign(CENTER, BOTTOM);
    text("Aliança das ruas e dos campos", width / 2, fraseY);
    textSize(36);
    fill(255, 255, 0);
    text("Agrinho!", width / 2, fraseY - 40);
    noStroke();
    textAlign(CENTER, CENTER);
}

// Detecta clique no botão JOGAR
function mousePressed() {
    if (tela === "fim") {
        tela = "menu";
        player.vida = vidaMax;
        player.x = width / 2;
        player.y = height / 2;
        tiros = [];
        tirosBoss = [];
    } else if (
        tela === "menu" &&
        mouseX > width / 2 - 100 &&
        mouseX < width / 2 + 100 &&
        mouseY > 150 &&
        mouseY < 210
    ) {
        tela = "tutorialInicial";
        tutorialInicialAtivo = true;
        tutorialInicialTimer = 0;
        // Resetar animação dos NPCs ao sair do menu
        for (let npc of npcs) {
            npc.spriteIndex = 0;
            npc.tempoAnim = 0;
        }
    }

    // 💰 Interações com o MERCADO
    if (tela === "mercado") {
        // Clicou na placa de vida
        if (
            mouseX > placaVidaX - placaLargura / 2 &&
            mouseX < placaVidaX + placaLargura / 2 &&
            mouseY > placaVidaY - placaAltura / 2 &&
            mouseY < placaVidaY + placaAltura / 2
        ) {
            if (player.vidaMax >= 5) {
                mensagemVidaMax = "Limite de vida máxima atingido!";
                return;
            }
            if (inventario.moedas >= 100) {
                inventario.moedas -= 100;
                player.vidaMax += 1;
                player.vida = player.vidaMax;
                mensagemVidaMax = "";
                console.log("Comprou +1 de vida máxima!");
            }
        }

        // Clicou na placa de dano
        if (
            mouseX > placaDanoX - placaLargura / 2 &&
            mouseX < placaDanoX + placaLargura / 2 &&
            mouseY > placaDanoY - placaAltura / 2 &&
            mouseY < placaDanoY + placaAltura / 2
        ) {
            if (inventario.dano >= 3) {
                mensagemDanoMax = "Limite de dano atingido!";
                return;
            }
            if (inventario.moedas >= 100) {
                inventario.moedas -= 100;
                inventario.dano += 1;
                dano = inventario.dano;
                mensagemDanoMax = "";
                console.log("Comprou +1 de dano!");
            }
        }
    }
}

function desenharPlayerAnimado() {
    let sprites = playerSprites[player.direcao];
    let frame = floor(player.frameIndex) % sprites.length;
    image(sprites[frame], player.x, player.y, player.width, player.height);
}




// MAPAfunction
function mapa() {
    // Fundo cinza (cidade)
    background(180);

    // Fundo verde (campo)
    noStroke();
    fill(100, 200, 100);
    rect(width / 2, 0, width / 2, height);

    // Linha preta no meio
    stroke(0);
    strokeWeight(2);
    line(width / 2, 0, width / 2, height);

    // Títulos
    fill(0);
    textSize(32);
    textAlign(CENTER, TOP);
    text("CIDADE", width / 4, 10);
    text("CAMPO", 3 * width / 4, 10);

    // Desenha apenas as estruturas do lado correto
    desenharEstruturas();

    // NPCs no campo (apenas se o player estiver no campo)
    desenharNPCs();

    // Desenha o player e aplica movimentação
    playerMovimento();
    desenharPlayerAnimado();

    // Interações com NPCs
    npcs.forEach((npc) => {
        let dNpc = dist(
            player.x + player.width / 2,
            player.y + player.height / 2,
            npc.x + 20,
            npc.y + 20
        );
        if (player.x >= width / 2 && dNpc < 40) {
            fill(0);
            textSize(12);
            textAlign(CENTER);
            text("Pressione E para enfrentar o boss", npc.x + 20, npc.y + 60);
            if (keyIsDown(69)) {
                switch (npc.tipo) {
                    case "fazendeiro":
                        bossAtual = new BossCorvo();
                        break;
                    case "lenhador":
                        bossAtual = new BossArvore();
                        break;
                    case "cowboy":
                        bossAtual = new BossTouro();
                        break;
                }
                tela = "boss";
                player.x = width / 4;
                player.y = height / 2;
                tiros = [];
                player.vida = player.vidaMax;
            }
        }
    });


      // —————— INTERAÇÃO COM AS ESTRUTURAS ——————
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
                          text("Pressione E para comprar", e.x + 100, e.y + 170)
                          if (keys["KeyE"] && podeInteragir) {
                              abrirMercado();
                              podeInteragir = false;
                          }
                          break;

                      case "fabrica":
                          if (inventario.madeira > 0) {
                              text("Pressione E para vender madeira", e.x + 100, e.y + 170);
                              if (keys["KeyE"] && podeInteragir) {
                                  inventario.moedas += inventario.madeira * 5;
                                  inventario.madeira = 0;
                                  podeInteragir = false;
                              }
                          }
                          break;

                      case "acougue":
                          if (inventario.bife > 0) {
                              text("Pressione E para vender bife", e.x + 100, e.y + 170);
                              if (keys["KeyE"] && podeInteragir) {
                                  inventario.moedas += inventario.bife * 5;
                                  inventario.bife = 0;
                                  podeInteragir = false;
                              }
                          }
                          break;

                      case "feira":
                          if (inventario.milho > 0) {
                              text("Pressione E para vender milho", e.x + 100, e.y + 170);
                              if (keys["KeyE"] && podeInteragir) {
                                  inventario.moedas += inventario.milho * 5;
                                  inventario.milho = 0;
                                  podeInteragir = false;
                              }
                          }
                          break;
                  }
              }
          }
      } // <<< Fecha função mapa() !!
}

function abrirMercado() {
    tela = "mercado";
}

// Função que controla o movimento do player com WASD
function playerMovimento() {
    let seMovendo = false;
    let nx = player.x;
    let ny = player.y;

    if (keyIsDown(87)) { // W
        ny -= player.velocidade;
        player.direcao = "cima";
        seMovendo = true;
    }
    if (keyIsDown(83)) { // S
        ny += player.velocidade;
        player.direcao = "baixo";
        seMovendo = true;
    }
    if (keyIsDown(65)) { // A
        nx -= player.velocidade;
        player.direcao = "esquerda";
        seMovendo = true;
    }
    if (keyIsDown(68)) { // D
        nx += player.velocidade;
        player.direcao = "direita";
        seMovendo = true;
    }

    // Só aplica colisão das estruturas fora da fase de boss
    if (!tela.startsWith("boss")) {
        if (!colideComEstruturas(nx, ny)) {
            player.x = nx;
            player.y = ny;
        }
    } else {
        // Em fase de boss, só move livremente (apenas bordas limitam)
        player.x = nx;
        player.y = ny;
    }

    // Animação só quando está se movendo
    if (seMovendo) {
        player.animCooldown += deltaTime;
        if (player.animCooldown >= 200) { // troca de frame a cada 200ms
            player.frameIndex = (player.frameIndex + 1) % 2; // 2 frames por direção
            player.animCooldown = 0;
        }
    } else {
        player.frameIndex = 0; // parado = primeiro frame
    }

    // Limitar player dentro da tela com borda pequena
    const bordaBuffer = 40; // quanto menor, mais próximo do limite real
    player.x = constrain(player.x, 0 - bordaBuffer, width - player.width + bordaBuffer);
    player.y = constrain(player.y, 0 - bordaBuffer, height - player.height + bordaBuffer);
}

// Função que mostra o inventário (quando tecla Q é apertada)
function mostrarInventario() {
    background(180, 180, 220);
    fill(0);
    textSize(24);
    textAlign(CENTER);
    text("Inventário", width / 2, 50);
    textSize(16);
    textAlign(LEFT);
    text("Madeira: " + inventario.madeira, 50, 100);
    text("Bife: " + inventario.bife, 50, 130);
    text("Milho: " + inventario.milho, 50, 160);
    text("Moedas: " + inventario.moedas, 50, 190);
    text("Medalhas: " + inventario.medalhas, 50, 220);
    textAlign(CENTER);
    text("Pressione Q para voltar", width / 2, height - 50);
}

// não é um "function keyPressed!"
function keyReleased() {
  if (key === 'e' || key === 'E') {
    podeInteragirComMercado = true;
  }
}


// Let faz parte do codigo abaixo!
let podeInteragirComMercado = true;

//teclas gerais
function keyPressed() {
  if (key === 'e' || key === 'E') {
    if (tela === "mapa" && playerPertoDe("mercado") && podeInteragirComMercado) {
      tela = "mercado";
      podeInteragirComMercado = false;
      return;
    }

    if (tela === "mercado") {
      tela = "mapa";
      podeInteragirComMercado = false;

      // Empurra o player um pouco pra baixo, pra fora da zona do mercado
      player.y += 80;

      return;
    }

    verificarInteracaoComNPCs();
    verificarInteracaoComEstruturas();
  }

  if (key === "q" || key === "Q") {
    if (tela === "inventario") {
      tela = "mapa";
    } else if (tela === "mapa") {
      tela = "inventario";
    }
  }

  if (key === " " && cooldownTiro <= 0 && (tela === "mapa" || tela.startsWith("boss"))) {
    atirar();
    cooldownTiro = 500;
  }

  // --- NOVO: Assinar contrato com o Empressario ---
  if (key === "c" || key === "C") {
    if (
      tela === "mapa" &&
      empressarioFalaParte === 4 &&
      empressarioPlayerPerto &&
      inventario.medalhas >= 12 &&
      inventario.moedas >= 600
    ) {
      tela = "contrato";
      contratoTimer = 0;
      contratoMostrandoCarregando = false;
    }
  }
}


// Função que cria um projétil na direção do mouse
function atirar() {
    let angle = atan2(mouseY - (player.y + player.height / 2), mouseX - (player.x + player.width / 2));
    let velocidade = 7;

    tiros.push({
        x: player.x + player.width / 2,
        y: player.y + player.height / 2,
        vx: cos(angle) * velocidade,
        vy: sin(angle) * velocidade,
        size: 80, // tamanho do sprite do projétil
        frameIndex: 0,
        animCooldown: 0
    });
}


// Função do combate contra o boss
function boss() {
    background(bossBackground);
    textAlign(CENTER);
    fill(0);

    // Barra de vida do boss
    fill(255, 0, 0);
    rect(width / 2 - 100, 30, 200, 20);
    fill(0, 255, 0);
    let hpWidth = map(bossAtual.vida, 0, bossAtual.vidaMax, 0, 200);
    rect(width / 2 - 100, 30, hpWidth, 20);
    fill(0);
    textSize(18);
    text("Boss: " + bossAtual.tipo + "  Vida: " + bossAtual.vida, width / 2, 20);
  
    // vida player
    for (let i = 1; i <= player.vida; i++) {
        image(coracaoImg, 50 * i, 20, 50, 50);
    }

    // Player
    desenharPlayerAnimado();

    // Atualiza e desenha projéteis do player
    for (let i = tiros.length - 1; i >= 0; i--) {
        let t = tiros[i];

        // 1) Atualiza posição
        t.x += t.vx;
        t.y += t.vy;

        // 2) Atualiza animação do projétil
        t.animCooldown += deltaTime;
        if (t.animCooldown >= 100) {
            t.frameIndex = (t.frameIndex + 1) % playerSprites.projetil.length;
            t.animCooldown = 0;
        }

        // 3) Desenha o sprite animado do projétil
        let spriteProj = playerSprites.projetil[t.frameIndex];
        image(spriteProj, t.x - t.size / 2, t.y - t.size / 2, t.size, t.size);

        // 4) Checa colisão com o boss (usando a posição real e tamanho do boss)
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
                // Boss derrotado
                inventario.medalhas++;

                // Recompensas por tipo de boss
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
                // Centraliza o player ao voltar para o mapa
                player.x = width / 2;
                player.y = height / 2;
            }
            tiros.splice(i, 1);
            continue;
        }

        // 5) Remove projéteis que saíram da tela
        if (t.x < 0 || t.x > width || t.y < 0 || t.y > height) {
            tiros.splice(i, 1);
        }
    }

    // Atualiza e desenha o boss
    bossAtual.update();
    bossAtual.draw();
    bossAtual.atacar();

    // Checa colisão com ataques do boss
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
        if (player.vida <= 0) {
            tela = "fim";
        }
    }

    // Movimenta player dentro da arena
    playerMovimento();
}

function fimDeJogo() {
    background(0);
    fill(255);
    textAlign(CENTER);
    textSize(36);
    text("Fim de Jogo", width / 2, height / 2 - 40);
    textSize(20);
    text("Você foi derrotado!", width / 2, height / 2);
    text("Clique para voltar ao menu", width / 2, height / 2 + 40);
}

function mousePressed() {
  if (tela === "fim") {
    tela = "menu";
    player.vida = vidaMax;
    player.x = width / 2;
    player.y = height / 2;
    tiros = [];
    tirosBoss = [];
  } else if (
    tela === "menu" &&
    mouseX > width / 2 - 100 &&
    mouseX < width / 2 + 100 &&
    mouseY > 150 &&
    mouseY < 210
  ) {
    tela = "tutorialInicial";
    tutorialInicialAtivo = true;
    tutorialInicialTimer = 0;
    // Resetar animação dos NPCs ao sair do menu
    for (let npc of npcs) {
        npc.spriteIndex = 0;
        npc.tempoAnim = 0;
    }
  }

  // 💰 Interações com o MERCADO
  if (tela === "mercado") {
    // Clicou na placa de vida
    if (
      mouseX > placaVidaX - placaLargura / 2 &&
      mouseX < placaVidaX + placaLargura / 2 &&
      mouseY > placaVidaY - placaAltura / 2 &&
      mouseY < placaVidaY + placaAltura / 2
    ) {
      if (player.vidaMax >= 5) {
        mensagemVidaMax = "Limite de vida máxima atingido!";
        return;
      }
      if (inventario.moedas >= 100) {
        inventario.moedas -= 100;
        player.vidaMax += 1;
        player.vida = player.vidaMax;
        mensagemVidaMax = "";
        console.log("Comprou +1 de vida máxima!");
      }
    }

    // Clicou na placa de dano
    if (
      mouseX > placaDanoX - placaLargura / 2 &&
      mouseX < placaDanoX + placaLargura / 2 &&
      mouseY > placaDanoY - placaAltura / 2 &&
      mouseY < placaDanoY + placaAltura / 2
    ) {
      if (inventario.dano >= 3) {
        mensagemDanoMax = "Limite de dano atingido!";
        return;
      }
      if (inventario.moedas >= 100) {
        inventario.moedas -= 100;
        inventario.dano += 1;
        dano = inventario.dano;
        mensagemDanoMax = "";
        console.log("Comprou +1 de dano!");
      }
    }
  }
}

//Funções extras... 

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

  // Vender itens se estiver perto da estrutura certa
  for (let nome in estruturas) {
    let estrutura = estruturas[nome];
    let d = dist(player.x, player.y, estrutura.x, estrutura.y);

    if (d < 50) {
      // Verifica o tipo da estrutura para abrir tela de venda
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

// Classe para o Boss Corvo
class BossCorvo extends Boss {
    constructor() {
        super("corvo", 30);
    }

    executarAtaque() {
        if (this.ataqueAtual === 1) {
            // 3 corvos: central, esquerda e direita
            let baseX = player.x + player.width/2;
            let offsets = [-60, 0, 60];
            for (let dx of offsets) {
                this.ataques.push(new AtaqueCorvo(baseX + dx, 0));
            }
        } else {
            // Ataque do tornado
            console.log('Tornado na altura:', player.y + player.height/2);
            this.ataques.push(new AtaqueTornado(width, player.y + player.height/2));
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

        // Atualiza animação
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

// Classe para o Boss Árvore
class BossArvore extends Boss {
    constructor() {
        super("arvore", 30);
    }

    executarAtaque() {
        // Posição central (player)
        this.ataques.push(new AtaqueRaiz(player.x + player.width/2, player.y + player.height/2));
        // Próximas posições (acima, abaixo, esquerda, direita)
        let offset = 100;
        this.ataques.push(new AtaqueRaiz(player.x + player.width/2 + offset, player.y + player.height/2)); // direita
        this.ataques.push(new AtaqueRaiz(player.x + player.width/2 - offset, player.y + player.height/2)); // esquerda
        this.ataques.push(new AtaqueRaiz(player.x + player.width/2, player.y + player.height/2 + offset)); // abaixo
        this.ataques.push(new AtaqueRaiz(player.x + player.width/2, player.y + player.height/2 - offset)); // acima
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

        // Atualiza animação
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

// Classe para o Boss Touro
class BossTouro extends Boss {
    constructor() {
        super("touro", 30);
        this.turnoBezerro = 0; // 0, 1, 2: um bezerro; 3: três bezerros
    }

    executarAtaque() {
        let centroPlayer = player.x + player.width / 2;
        let offsets = [-100, 0, 100];
        if (this.ataqueAtual === 1) {
            this.ataques.push(new AtaqueGrito(this.x, this.y));
        } else {
            if (this.turnoBezerro < 3) {
                // Um bezerro por vez, sempre no centro do player, mas com sprite diferente
                this.ataques.push(new AtaqueBezerro(centroPlayer, 0, this.turnoBezerro));
                this.turnoBezerro++;
            } else {
                // No quarto turno, três bezerros juntos (esquerda, centro, direita)
                for (let i = 0; i < 3; i++) {
                    let posX = centroPlayer + offsets[i];
                    this.ataques.push(new AtaqueBezerro(posX, 0, i));
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
        // Calcula o ângulo em direção ao player no momento do ataque
        this.angulo = atan2(player.y + player.height/2 - y, player.x + player.width/2 - x);
    }

    update() {
        // Move na direção do jogador SEMPRE
        this.x += cos(this.angulo) * this.velocidade;
        this.y += sin(this.angulo) * this.velocidade;

        // Remove se sair da tela
        if (this.x < -100 || this.x > width + 100 || this.y < -100 || this.y > height + 100) {
            this.remover = true;
            return;
        }

        // Atualiza animação
        this.animCooldown += deltaTime;
        if (this.animCooldown >= 200) {
            this.frameIndex = Math.min(this.frameIndex + 1, 1);
            this.animCooldown = 0;
        }
    }

    draw() {
        let sprite = bossSprites.touro.ataque1[this.frameIndex];
        image(sprite, this.x - 60, this.y - 60, 120, 120); // 3x maior
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
        this.frameFixo = frameFixo; // frame fixo para cada bezerro
        this.remover = false;
        // O X do bezerro é fixo, não muda durante o movimento
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
        // Centraliza a checagem na área do bezerro e do player
        let d = dist(this.x, this.y, player.x + player.width / 2, player.y + player.height / 2);
        return d < 50;
    }
}

function colideComEstruturas(nx, ny) {
    // Retângulo do player
    let px = nx, py = ny, pw = player.width, ph = player.height;
    // Mercado
    let mx = mercadoHitbox.x, my = mercadoHitbox.y, mw = mercadoHitbox.width, mh = mercadoHitbox.height;
    // Fábrica
    let fx = fabricaHitbox.x, fy = fabricaHitbox.y, fw = fabricaHitbox.width, fh = fabricaHitbox.height;
    // Feira
    let feirax = feiraHitbox.x, feiray = feiraHitbox.y, feiraw = feiraHitbox.width, feirah = feiraHitbox.height;
    // Açougue
    let ax = acougueHitbox.x, ay = acougueHitbox.y, aw = acougueHitbox.width, ah = acougueHitbox.height;
    // Serraria
    let sx = serrariaHitbox.x, sy = serrariaHitbox.y, sw = serrariaHitbox.width, sh = serrariaHitbox.height;
    // Gado
    let gx = gadoHitbox.x, gy = gadoHitbox.y, gw = gadoHitbox.width, gh = gadoHitbox.height;
    // Plantação
    let px2 = plantacaoHitbox.x, py2 = plantacaoHitbox.y, pw2 = plantacaoHitbox.width, ph2 = plantacaoHitbox.height;
    // Checa colisão com Mercado
    let colideMercado = (
        px < mx + mw &&
        px + pw > mx &&
        py < my + mh &&
        py + ph > my
    );
    // Checa colisão com Fábrica
    let colideFabrica = (
        px < fx + fw &&
        px + pw > fx &&
        py < fy + fh &&
        py + ph > fy
    );
    // Checa colisão com Feira
    let colideFeira = (
        px < feirax + feiraw &&
        px + pw > feirax &&
        py < feiray + feirah &&
        py + ph > feiray
    );
    // Checa colisão com Açougue
    let colideAcougue = (
        px < ax + aw &&
        px + pw > ax &&
        py < ay + ah &&
        py + ph > ay
    );
    // Checa colisão com Serraria
    let colideSerraria = (
        px < sx + sw &&
        px + pw > sx &&
        py < sy + sh &&
        py + ph > sy
    );
    // Checa colisão com Gado
    let colideGado = (
        px < gx + gw &&
        px + pw > gx &&
        py < gy + gh &&
        py + ph > gy
    );
    // Checa colisão com Plantação
    let colidePlantacao = (
        px < px2 + pw2 &&
        px + pw > px2 &&
        py < py2 + ph2 &&
        py + ph > py2
    );
    return colideMercado || colideFabrica || colideFeira || colideAcougue || colideSerraria || colideGado || colidePlantacao;
}

// Serraria
const serrariaSpriteW = 180, serrariaSpriteH = 180;
const serrariaHitbox = {
    x: 600 + serrariaSpriteW * 0.35,
    y: 30 + serrariaSpriteH * 0.35,
    width: serrariaSpriteW * 0.3,
    height: serrariaSpriteH * 0.3
};
// Criação de Gado
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

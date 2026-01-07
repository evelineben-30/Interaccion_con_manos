let handPose;
let video;
let hands = [];
let particles = [];

function preload() {
  handPose = ml5.handPose();
}

function setup() {
  // 1. Aumentamos el canvas para que haya espacio para el marco
  createCanvas(windowWidth, windowHeight); 
  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();
  handPose.detectStart(video, gotHands);
}

function draw() {
  drawBackground(); 

  // 2. Calcular coordenadas para centrar el video
  let camX = (width - video.width) / 2;
  let camY = (height - video.height) / 2;

  // 3. Dibujar un "Marco" decorativo (Sombra y borde blanco)
  fill(255);
  noStroke();
  rect(camX - 15, camY - 15, video.width + 30, video.height + 30, 20); // Marco blanco redondeado
  
  // Dibujar la cámara
  image(video, camX, camY);

  // --- Lógica de Partículas ---
  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].update();
    particles[i].display();
    if (particles[i].isDead()) {
      particles.splice(i, 1);
    }
  }

  for (let hand of hands) {
    let tip = hand.index_finger_tip;
    if (!tip) continue;

    // IMPORTANTE: Mapear las coordenadas del video al canvas centrado
    let cx = camX + tip.x;
    let cy = camY + tip.y;

    let count = 2; // Bajé un poco el count para no saturar el rendimiento
    let sizeMapped = 25;
    let shapeType = (hand.handedness === "Right") ? "heart" : "star";

    for (let i = 0; i < count; i++) {
      particles.push(new Particle(cx, cy, shapeType, sizeMapped));
    }
  }
}

// Fondo con degradado suave (Estilo estético)
function drawBackground() {
  for (let y = 0; y < height; y++) {
    let inter = map(y, 0, height, 0, 1);
    // Colores pastel: Rosa suave a Azul cielo
    let c = lerpColor(color(255, 209, 220), color(200, 220, 255), inter);
    stroke(c);
    line(0, y, width, y);
  }
}

class Particle {
  constructor(x, y, type, baseSize) {
    this.x = x + random(-5, 5);
    this.y = y + random(-5, 5);
    this.vx = random(-1, 1);
    this.vy = random(-1, 1);
    this.size = baseSize;
    this.type = type;
    this.life = 255;

    if (type === "heart") {
      this.r = random(250, 255);
      this.g = random(100, 180);
      this.b = random(180, 220);
    } else {
      this.r = random(150, 200);
      this.g = random(240, 255);
      this.b = random(150, 200);
    }
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.life -= 5;
  }

  display() {
    noStroke();
    fill(this.r, this.g, this.b, this.life);

    if (this.type === "heart") {
      push();
      translate(this.x, this.y);
      beginShape();
      let s = this.size * 0.08;
      vertex(0, -6 * s);
      bezierVertex(6 * s, -12 * s, 16 * s, -6 * s, 0, 6 * s);
      bezierVertex(-16 * s, -6 * s, -6 * s, -12 * s, 0, -6 * s);
      endShape(CLOSE);
      pop();
    } else {
      push();
      translate(this.x, this.y);
      let s = this.size * 0.4;
      beginShape();
      for (let i = 0; i < 10; i++) {
        let angle = i * PI / 5;
        let radius = (i % 2 === 0) ? s : s * 0.45;
        vertex(cos(angle) * radius, sin(angle) * radius);
      }
      endShape(CLOSE);
      pop();
    }
  }

  isDead() {
    return this.life <= 0;
  }
}

function gotHands(results) {
  hands = results;
}

// Función para ajustar el tamaño si cambias la ventana
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
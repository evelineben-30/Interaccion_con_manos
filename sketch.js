let handPose;
let video;
let hands = [];
let particles = [];

function preload() {
  handPose = ml5.handPose();
}

function setup() {
  // Creamos el lienzo al tamaño total de la ventana
  createCanvas(windowWidth, windowHeight);
  
  video = createCapture(VIDEO);
  video.size(640, 480);
  
  // Forzamos que el elemento HTML original no estorbe en la esquina
  video.style('position', 'absolute');
  video.style('top', '-1000px'); 
  video.hide();

  handPose.detectStart(video, gotHands);
}

function draw() {
  // 1. Dibujamos el fondo con el degradado decorativo
  drawBackground(); 

  // 2. Calculamos la posición central exacta para la cámara y el marco
  let camX = (width - 640) / 2;
  let camY = (height - 480) / 2;

  // 3. DISEÑO DEL MARCO (Para que se vea "bonito")
  // Sombra proyectada
  fill(0, 0, 0, 40);
  rect(camX - 10, camY + 10, 640 + 20, 480 + 20, 25); 
  
  // Marco Blanco tipo Polaroid
  fill(255);
  noStroke();
  rect(camX - 20, camY - 20, 640 + 40, 480 + 40, 25); 

  // 4. DIBUJAR LA CÁMARA CENTRADA
  image(video, camX, camY, 640, 480);

  // 5. LÓGICA DE PARTÍCULAS
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

    // Ajustamos la posición de las partículas para que coincidan con la cámara centrada
    let cx = camX + tip.x;
    let cy = camY + tip.y;

    let shapeType = (hand.handedness === "Right") ? "heart" : "star";
    
    // Agregamos partículas
    particles.push(new Particle(cx, cy, shapeType, 25));
  }
}

// Fondo degradado estético
function drawBackground() {
  for (let y = 0; y < height; y++) {
    let inter = map(y, 0, height, 0, 1);
    let c = lerpColor(color(255, 200, 220), color(180, 210, 255), inter);
    stroke(c);
    line(0, y, width, y);
  }
}

// Clase Particle completa con tus formas
class Particle {
  constructor(x, y, type, baseSize) {
    this.x = x + random(-5, 5);
    this.y = y + random(-5, 5);
    this.vx = random(-2, 2);
    this.vy = random(-2, 2);
    this.size = baseSize;
    this.type = type;
    this.life = 255;

    if (type === "heart") {
      this.r = random(240, 255);
      this.g = random(100, 150);
      this.b = random(180, 220);
    } else {
      this.r = random(150, 200);
      this.g = random(230, 255);
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
    push();
    translate(this.x, this.y);
    
    if (this.type === "heart") {
      let s = this.size * 0.08;
      beginShape();
      vertex(0, -6 * s);
      bezierVertex(6 * s, -12 * s, 16 * s, -6 * s, 0, 6 * s);
      bezierVertex(-16 * s, -6 * s, -6 * s, -12 * s, 0, -6 * s);
      endShape(CLOSE);
    } else {
      let s = this.size * 0.45;
      beginShape();
      for (let i = 0; i < 10; i++) {
        let angle = i * PI / 5;
        let radius = (i % 2 === 0) ? s : s * 0.45;
        vertex(cos(angle) * radius, sin(angle) * radius);
      }
      endShape(CLOSE);
    }
    pop();
  }

  isDead() {
    return this.life <= 0;
  }
}

function gotHands(results) {
  hands = results;
}

// Ajusta el tamaño si cambias el tamaño de la ventana del navegador
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
let handPose;
let video;
let hands = [];
let particles = [];

function preload() {
  handPose = ml5.handPose();
}

function setup() {
  createCanvas(800, 600); // lienzo más grande para ver el marco
  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();
  handPose.detectStart(video, gotHands);
}

function draw() {
  // Fondo decorativo
  drawBackground();

  // Centrar la cámara
  let camX = (width - video.width) / 2;
  let camY = (height - video.height) / 2;
  image(video, camX, camY);

  // Partículas
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

    let cx = camX + tip.x; // ajustar a posición centrada
    let cy = camY + tip.y;

    let count = 12;
    let sizeMapped = 25;
    let shapeType = (hand.handedness === "Right") ? "heart" : "star";

    for (let i = 0; i < count; i++) {
      particles.push(new Particle(cx, cy, shapeType, sizeMapped));
    }
  }
}

function drawBackground() {
  for (let y = 0; y < height; y++) {
    let inter = map(y, 0, height, 0, 1);
    let c = lerpColor(color(255, 220, 240), color(180, 200, 255), inter);
    stroke(c);
    line(0, y, width, y);
  }
}


class Particle {
  constructor(x, y, type, baseSize) {
    this.x = x + random(-10, 10);
    this.y = y + random(-10, 10);
    this.vx = random(-1.5, 1.5);
    this.vy = random(-1.5, 1.5);

    this.size = baseSize;
    this.type = type;
    this.life = 255;

    // Colores según la figura
    if (type === "heart") {
      this.r = random(240, 255);
      this.g = random(100, 150);
      this.b = random(180, 220);
    } else {
      this.r = random(120, 180);
      this.g = random(230, 255);
      this.b = random(120, 160);
    }
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.life -= 4;
  }

  display() {
    noStroke();
    fill(this.r, this.g, this.b, this.life);

    if (this.type === "heart") {
      //Corazón rosado
      push();
      translate(this.x, this.y);
      beginShape();
      let s = this.size * 0.08;
      vertex(0, -6*s);
      bezierVertex(6*s, -12*s, 16*s, -6*s, 0, 6*s);
      bezierVertex(-16*s, -6*s, -6*s, -12*s, 0, -6*s);
      endShape(CLOSE);
      pop();
    }

    if (this.type === "star") {
      //Estrella verde
      push();
      translate(this.x, this.y);
      let s = this.size * 0.45;
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

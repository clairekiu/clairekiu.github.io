let w = 800; // 가로 크기를 줄여서 더 확대된 모형을 만듦
let h = 600;
let t = 0;
let ks = [0.5, 0.6, 0.7, 0.8, 0.9]; // 파수 다양하게 설정
let omegas = [0.05, 0.07, 0.09, 0.11, 0.13]; // 각진동수도 다양하게 설정
let dt = 0.5; // 빠르게 움직이도록
let amplitude = 40; // 진폭을 키워서 더 확대된 모형을 만듦

function setup() {
  createCanvas(w, h);
  frameRate(30);
}

function draw() {
  background(255);
  
  translate(0, h / 2 - 50); // 여백을 줄이기 위해 50 픽셀 위로 이동

  // 각각의 파동 그리기
  stroke(150); // 회색
  noFill();
  for (let i = 0; i < ks.length; i++) {
    beginShape();
    for (let x = 0; x < w; x++) {
      let y = amplitude * sin(ks[i] * x - omegas[i] * t);
      vertex(x, y);
    }
    endShape();
  }

  // 중첩된 파동 그리기
  stroke(255, 0, 0); // 빨간색
  beginShape();
  for (let x = 0; x < w; x++) {
    let y = 0;
    for (let i = 0; i < ks.length; i++) {
      y += amplitude * sin(ks[i] * x - omegas[i] * t);
    }
    vertex(x, y);
  }
  endShape();

  t += dt;
}

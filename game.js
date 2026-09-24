
const gameArea = document.getElementById('gameArea');
const player = document.getElementById('player');
const dialogue = document.getElementById('dialogue');
const dialogueName = document.getElementById('dialogueName');
const dialogueText = document.getElementById('dialogueText');
const nextDialogue = document.getElementById('nextDialogue');
const xpText = document.getElementById('xpText');
const progressBar = document.getElementById('progressBar');
const progressText = document.getElementById('progressText');
const missionText = document.getElementById('missionText');
const actionBtn = document.getElementById('actionBtn');
const pauseBtn = document.getElementById('pauseBtn');
const pauseModal = document.getElementById('pauseModal');
const resumeBtn = document.getElementById('resumeBtn');
const fullscreenBtn = document.getElementById('fullscreenBtn');
const resetBtn = document.getElementById('resetBtn');
const miniPlayer = document.getElementById('miniPlayer');

let state = {
  x: 47,
  y: 69,
  xp: 0,
  progress: 25,
  paused: false,
  questStarted: false,
  dialogueStep: 0,
  lastDir: 'down'
};

const keys = {};
const speed = 0.16;
let last = performance.now();

function clamp(v,min,max){ return Math.max(min,Math.min(max,v)); }

function updatePlayer(){
  player.style.left = state.x + '%';
  player.style.top = state.y + '%';
  miniPlayer.style.left = clamp(state.x,5,90) + '%';
  miniPlayer.style.top = clamp(state.y,8,86) + '%';
}

function move(dx,dy){
  if(state.paused) return;
  state.x = clamp(state.x + dx, 2, 94);
  state.y = clamp(state.y + dy, 7, 84);
  player.classList.toggle('moving', Math.abs(dx)+Math.abs(dy)>0);
  if(dx<0) state.lastDir='left';
  if(dx>0) state.lastDir='right';
  if(dy<0) state.lastDir='up';
  if(dy>0) state.lastDir='down';
  updatePlayer();
}

function frame(now){
  const dt = Math.min(32, now-last);
  last = now;
  let dx=0,dy=0;
  if(keys['w']||keys['arrowup']) dy -= speed*dt/16;
  if(keys['s']||keys['arrowdown']) dy += speed*dt/16;
  if(keys['a']||keys['arrowleft']) dx -= speed*dt/16;
  if(keys['d']||keys['arrowright']) dx += speed*dt/16;
  if(dx||dy) move(dx,dy); else player.classList.remove('moving');
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

document.addEventListener('keydown', e=>{
  const k=e.key.toLowerCase();
  keys[k]=true;
  if([' ','e','enter'].includes(k)) {
    e.preventDefault();
    interact();
  }
  if(k==='escape') togglePause();
});
document.addEventListener('keyup', e=> keys[e.key.toLowerCase()]=false);

function distanceTo(el){
  const r1 = player.getBoundingClientRect();
  const r2 = el.getBoundingClientRect();
  const x1=r1.left+r1.width/2, y1=r1.top+r1.height/2;
  const x2=r2.left+r2.width/2, y2=r2.top+r2.height/2;
  return Math.hypot(x1-x2,y1-y2);
}

function interact(){
  const nadia=document.querySelector('.npc-nadia');
  const teacher=document.querySelector('.npc-teacher');
  if(distanceTo(nadia)<155){
    openDialogue('Nadia', state.questStarted
      ? 'Bagus! Sekarang coba temukan satu contoh perilaku yang menunjukkan musyawarah di sekolah.'
      : 'Ayo, kita jelajahi sekolah ini! Ada banyak nilai Pancasila yang bisa kamu temukan di sini.');
    return;
  }
  if(distanceTo(teacher)<155){
    openDialogue('Pak Budi','Ingat, nilai Pancasila terlihat dari cara kita memperlakukan orang lain, bekerja sama, dan mengambil keputusan.');
    return;
  }
  openDialogue('Petunjuk','Dekati Nadia atau Pak Budi lalu tekan E / Space / tombol AKSI.');
}

function openDialogue(name,text){
  dialogueName.textContent=name;
  dialogueText.textContent=text;
  dialogue.classList.remove('hidden');
}
function closeDialogue(){ dialogue.classList.add('hidden'); }

nextDialogue.addEventListener('click',()=>{
  if(dialogueName.textContent==='Nadia' && !state.questStarted){
    state.questStarted=true;
    state.xp=20;
    state.progress=40;
    xpText.textContent=state.xp+' XP';
    progressBar.style.width=state.progress+'%';
    progressText.textContent=state.progress+'%';
    missionText.textContent='Temukan perilaku yang mencerminkan musyawarah dan penghargaan terhadap perbedaan.';
  }
  closeDialogue();
});
actionBtn.addEventListener('click',interact);
document.getElementById('missionBtn').addEventListener('click',()=>openDialogue('Misi Saat Ini',missionText.textContent));

function togglePause(){
  state.paused=!state.paused;
  pauseModal.classList.toggle('hidden',!state.paused);
}
pauseBtn.addEventListener('click',togglePause);
resumeBtn.addEventListener('click',()=>{state.paused=false;pauseModal.classList.add('hidden')});
resetBtn.addEventListener('click',()=>location.reload());

fullscreenBtn.addEventListener('click',()=>{
  if(!document.fullscreenElement) document.documentElement.requestFullscreen?.();
  else document.exitFullscreen?.();
});

// Joystick
const joystick = document.getElementById('joystick');
const knob = document.getElementById('joystickKnob');
let joyActive=false, joyCenter={x:0,y:0};

function joyStart(clientX,clientY){
  const r=joystick.getBoundingClientRect();
  joyCenter={x:r.left+r.width/2,y:r.top+r.height/2};
  joyActive=true; joyMove(clientX,clientY);
}
function joyMove(clientX,clientY){
  if(!joyActive)return;
  let dx=clientX-joyCenter.x, dy=clientY-joyCenter.y;
  const max=34, len=Math.hypot(dx,dy)||1;
  if(len>max){dx=dx/len*max;dy=dy/len*max}
  knob.style.transform=`translate(${30+dx}px,${30+dy}px)`;
  move(dx/max*.75,dy/max*.75);
}
function joyEnd(){joyActive=false;knob.style.transform='translate(30px,30px)'}
joystick.addEventListener('pointerdown',e=>{joystick.setPointerCapture(e.pointerId);joyStart(e.clientX,e.clientY)});
joystick.addEventListener('pointermove',e=>joyMove(e.clientX,e.clientY));
joystick.addEventListener('pointerup',joyEnd);
joystick.addEventListener('pointercancel',joyEnd);

document.getElementById('guideBtn').addEventListener('click',()=>{
  alert('Laptop: WASD / panah untuk bergerak, E atau Space untuk interaksi.\\nHP: gunakan joystick analog dan tombol AKSI.');
});
document.getElementById('soundBtn').addEventListener('click',e=>{
  e.currentTarget.textContent = e.currentTarget.textContent==='🔊' ? '🔇' : '🔊';
});
document.getElementById('miniExpand').addEventListener('click',()=>openDialogue('Peta Sekolah','Lokasi penting: Sekolah, Perpustakaan, dan Taman. Ikuti jalur dan cari NPC bertanda !'));

updatePlayer();


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
const missionTitle = document.getElementById('missionTitle');
const actionBtn = document.getElementById('actionBtn');
const pauseBtn = document.getElementById('pauseBtn');
const pauseModal = document.getElementById('pauseModal');
const resumeBtn = document.getElementById('resumeBtn');
const fullscreenBtn = document.getElementById('fullscreenBtn');
const resetBtn = document.getElementById('resetBtn');
const miniPlayer = document.getElementById('miniPlayer');

const quizModal = document.getElementById('quizModal');
const quizTitle = document.getElementById('quizTitle');
const quizCase = document.getElementById('quizCase');
const quizOptions = document.getElementById('quizOptions');
const quizFeedback = document.getElementById('quizFeedback');
const quizBadge = document.getElementById('quizBadge');
const closeQuizBtn = document.getElementById('closeQuizBtn');

const libraryArea = document.getElementById('libraryArea');
const parkArea = document.getElementById('parkArea');
const schoolArea = document.getElementById('schoolArea');
const libraryQuestMark = document.getElementById('libraryQuestMark');
const parkQuestMark = document.getElementById('parkQuestMark');
const schoolQuestMark = document.getElementById('schoolQuestMark');
const libraryPrompt = document.getElementById('libraryPrompt');
const parkPrompt = document.getElementById('parkPrompt');
const schoolPrompt = document.getElementById('schoolPrompt');

let state = {
  x: 47,
  y: 69,
  xp: 0,
  progress: 25,
  paused: false,
  stage: 0, // 0 Nadia, 1 Library, 2 Pak Budi, 3 Park, 4 Final School, 5 Complete
  lastDir: 'down'
};

const keys = {};
const speed = 0.16;
let last = performance.now();
let activeQuiz = null;

const STAGES = [
  { title:'Kenali Nilai Pancasila', mission:'Temui Nadia untuk menerima misi pertama.', progress:25, xp:0 },
  { title:'Tantangan Perpustakaan', mission:'Pergi ke Perpustakaan. Berdiri dekat bangunan lalu tekan E / Space / AKSI.', progress:40, xp:20 },
  { title:'Analisis bersama Pak Budi', mission:'Temui Pak Budi dan analisis contoh perilaku Pancasila.', progress:55, xp:35 },
  { title:'Tantangan Taman', mission:'Pergi ke Taman dan pilih tindakan yang mencerminkan musyawarah.', progress:70, xp:50 },
  { title:'Final Mission', mission:'Kembali ke depan Sekolah untuk menyelesaikan Final Mission.', progress:85, xp:70 },
  { title:'Level 1 Selesai!', mission:'Kamu telah menemukan nilai toleransi, musyawarah, persatuan, dan keadilan.', progress:100, xp:100 }
];

function clamp(v,min,max){ return Math.max(min,Math.min(max,v)); }

function updateHUD(){
  const s = STAGES[state.stage];
  state.xp = s.xp;
  state.progress = s.progress;
  xpText.textContent = state.xp + ' XP';
  progressBar.style.width = state.progress + '%';
  progressText.textContent = state.progress + '%';
  missionTitle.textContent = s.title;
  missionText.textContent = s.mission;
  updateQuestMarkers();
}

function updateQuestMarkers(){
  libraryQuestMark.classList.toggle('hidden', state.stage !== 1);
  parkQuestMark.classList.toggle('hidden', state.stage !== 3);
  schoolQuestMark.classList.toggle('hidden', state.stage !== 4);
  document.querySelector('.npc-nadia .quest-mark')?.classList.toggle('hidden', state.stage !== 0);
  document.querySelector('.npc-teacher .talk-bubble')?.classList.toggle('hidden', state.stage !== 2);
}

function updatePlayer(){
  player.style.left = state.x + '%';
  player.style.top = state.y + '%';
  miniPlayer.style.left = clamp(state.x,5,90) + '%';
  miniPlayer.style.top = clamp(state.y,8,86) + '%';
}

function move(dx,dy){
  if(state.paused || !quizModal.classList.contains('hidden') || !dialogue.classList.contains('hidden')) return;
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
  updateNearPrompts();
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

function near(el, threshold=160){
  return distanceTo(el) < threshold;
}

// Mengukur jarak karakter ke TEPI objek, bukan hanya ke titik tengah.
// Ini membuat bangunan besar seperti Perpustakaan lebih mudah diinteraksikan.
function distanceToRect(el){
  const p = player.getBoundingClientRect();
  const r = el.getBoundingClientRect();
  const px = p.left + p.width/2;
  const py = p.top + p.height/2;
  const cx = Math.max(r.left, Math.min(px, r.right));
  const cy = Math.max(r.top, Math.min(py, r.bottom));
  return Math.hypot(px-cx, py-cy);
}
function nearRect(el, threshold=85){
  return distanceToRect(el) <= threshold;
}

function updateNearPrompts(){
  libraryPrompt.classList.toggle('hidden', !(state.stage===1 && nearRect(libraryArea,110)));
  parkPrompt.classList.toggle('hidden', !(state.stage===3 && nearRect(parkArea,110)));
  schoolPrompt.classList.toggle('hidden', !(state.stage===4 && nearRect(schoolArea,120)));
}

function interact(){
  const nadia=document.querySelector('.npc-nadia');
  const teacher=document.querySelector('.npc-teacher');

  // Stage-specific interactions take priority
  if(state.stage===0 && near(nadia,165)){
    openDialogue(
      'Nadia',
      'Ayo, kita jelajahi sekolah ini! Misi pertamamu adalah menemukan sikap yang menunjukkan toleransi dan penghargaan terhadap perbedaan.'
    );
    return;
  }

  if(state.stage===1 && nearRect(libraryArea,115)){
    openQuiz('library');
    return;
  }

  if(state.stage===2 && near(teacher,165)){
    openQuiz('teacher');
    return;
  }

  if(state.stage===3 && nearRect(parkArea,115)){
    openQuiz('park');
    return;
  }

  if(state.stage===4 && nearRect(schoolArea,130)){
    openQuiz('final');
    return;
  }

  // Helpful contextual hints
  if(near(nadia,165)){
    openDialogue('Nadia','Lanjutkan misi sesuai petunjuk di kiri bawah. Tanda ! menunjukkan lokasi berikutnya.');
    return;
  }
  if(nearRect(libraryArea,115)){
    openDialogue('Perpustakaan', state.stage < 1
      ? 'Temui Nadia terlebih dahulu untuk menerima misi.'
      : 'Tantangan di Perpustakaan sudah selesai. Lanjutkan ke lokasi berikutnya.');
    return;
  }
  if(near(teacher,165)){
    openDialogue('Pak Budi', state.stage < 2
      ? 'Selesaikan Tantangan Perpustakaan terlebih dahulu.'
      : 'Bagus. Ikuti misi berikutnya dan terus gunakan alasan berdasarkan nilai Pancasila.');
    return;
  }
  if(nearRect(parkArea,115)){
    openDialogue('Taman', state.stage < 3
      ? 'Masih ada misi sebelumnya yang perlu kamu selesaikan.'
      : 'Kamu sudah menyelesaikan misi di Taman.');
    return;
  }

  openDialogue('Petunjuk','Ikuti “Misi Saat Ini”. Untuk bangunan, cukup berdiri di dekat tepi bangunan sampai muncul label E / AKSI, lalu tekan tombol interaksi.');
}

function openDialogue(name,text){
  dialogueName.textContent=name;
  dialogueText.textContent=text;
  dialogue.classList.remove('hidden');
}
function closeDialogue(){ dialogue.classList.add('hidden'); }

nextDialogue.addEventListener('click',()=>{
  if(dialogueName.textContent==='Nadia' && state.stage===0){
    state.stage=1;
    updateHUD();
  }
  closeDialogue();
});

const QUIZZES = {
  library: {
    badge:'📚 Perpustakaan • C4',
    title:'Tantangan Toleransi',
    caseText:'Dua siswa memiliki kesukaan budaya yang berbeda. Salah satu siswa mengejek kesukaan temannya dan mengatakan bahwa hanya budayanya yang pantas dihargai. Sikap manakah yang paling mencerminkan kepribadian Pancasila?',
    options:[
      ['Membiarkan karena hanya bercanda.', false],
      ['Menghargai perbedaan dan tidak merendahkan pilihan orang lain.', true],
      ['Meminta seluruh teman memiliki kesukaan yang sama.', false],
      ['Menjauhi siswa yang memiliki kesukaan berbeda.', false]
    ],
    correctText:'✅ Tepat! Menghargai perbedaan menunjukkan sikap kemanusiaan dan toleransi.',
    nextStage:2
  },
  teacher: {
    badge:'👨‍🏫 Pak Budi • Analisis',
    title:'Analisis Perilaku',
    caseText:'Ketua kelompok memberi kesempatan kepada semua anggota untuk menyampaikan pendapat sebelum mengambil keputusan. Mengapa perilaku tersebut sesuai dengan Pancasila?',
    options:[
      ['Karena keputusan menjadi lebih cepat tanpa perlu berdiskusi.', false],
      ['Karena semua pendapat didengar dan keputusan dilakukan melalui musyawarah.', true],
      ['Karena ketua kelompok memiliki hak menentukan keputusan sendiri.', false],
      ['Karena pendapat mayoritas selalu harus diikuti tanpa pertimbangan.', false]
    ],
    correctText:'✅ Benar. Ini mencerminkan nilai musyawarah dan penghargaan terhadap pendapat.',
    nextStage:3
  },
  park: {
    badge:'🌳 Taman • C5',
    title:'Pilih Tindakan',
    caseText:'Dua kelompok kelas berselisih memilih pertunjukan budaya lokal atau budaya populer luar negeri. Apa tindakan yang paling tepat?',
    options:[
      ['Memilih berdasarkan suara terbanyak tanpa mendengar kelompok lain.', false],
      ['Membatalkan kegiatan agar tidak terjadi konflik.', false],
      ['Mendengarkan alasan semua pihak, membandingkan pilihan, lalu bermusyawarah.', true],
      ['Meminta guru menentukan pilihan tanpa melibatkan siswa.', false]
    ],
    correctText:'✅ Tepat! Solusi ini menjaga persatuan sekaligus memberi ruang musyawarah.',
    nextStage:4
  },
  final: {
    badge:'🏫 Final Mission • C6',
    title:'Final Mission — Kepribadian Pancasila',
    caseText:'Kelas ingin membuat pertunjukan yang mencerminkan kepribadian Pancasila. Rencana mana yang paling lengkap dan dapat dilaksanakan?',
    options:[
      ['Ketua memilih pertunjukan sendiri agar cepat selesai.', false],
      ['Kelompok berdiskusi, membagi tugas adil, menentukan waktu latihan, dan mengecek keberhasilan melalui keterlibatan semua anggota.', true],
      ['Semua siswa mengikuti ide kelompok yang paling populer.', false],
      ['Kegiatan ditunda sampai semua siswa memiliki pendapat yang sama.', false]
    ],
    correctText:'🏆 Luar biasa! Kamu berhasil menyelesaikan Level 1 dan menemukan nilai toleransi, musyawarah, persatuan, serta keadilan.',
    nextStage:5
  }
};

function openQuiz(id){
  activeQuiz=id;
  const q=QUIZZES[id];
  quizBadge.textContent=q.badge;
  quizTitle.textContent=q.title;
  quizCase.textContent=q.caseText;
  quizFeedback.textContent='';
  quizFeedback.className='quiz-feedback';
  quizOptions.innerHTML='';
  q.options.forEach(([label,correct],i)=>{
    const btn=document.createElement('button');
    btn.className='quiz-option';
    btn.textContent=String.fromCharCode(65+i)+'. '+label;
    btn.addEventListener('click',()=>answerQuiz(btn,correct,q));
    quizOptions.appendChild(btn);
  });
  quizModal.classList.remove('hidden');
}

function answerQuiz(btn,correct,q){
  const buttons=[...quizOptions.querySelectorAll('.quiz-option')];
  buttons.forEach(b=>b.disabled=true);
  if(correct){
    btn.classList.add('correct');
    quizFeedback.textContent=q.correctText;
    quizFeedback.className='quiz-feedback good';
    setTimeout(()=>{
      quizModal.classList.add('hidden');
      state.stage=q.nextStage;
      updateHUD();
      if(state.stage===5) completeLevel();
    },1250);
  }else{
    btn.classList.add('wrong');
    quizFeedback.textContent='Belum tepat. Baca kembali situasi dan perhatikan nilai Pancasila yang paling relevan.';
    quizFeedback.className='quiz-feedback bad';
    setTimeout(()=>{
      buttons.forEach(b=>{b.disabled=false;b.classList.remove('wrong')});
      quizFeedback.textContent='Coba sekali lagi.';
    },1000);
  }
}

function completeLevel(){
  missionTitle.textContent='Level 1 Selesai!';
  localStorage.setItem('pancaquest_level1', JSON.stringify({
    completed:true,
    xp:100,
    completed_at:new Date().toISOString()
  }));
  localStorage.setItem('pancapath_quest', JSON.stringify({
    completed:true,
    xp:100,
    badge:'🏅 Pancasila Pathfinder',
    route:'adventure-level-1',
    completed_at:new Date().toISOString()
  }));
  openDialogue('🏆 Level 1 Selesai','Kamu memperoleh 100 XP dan Badge Pancasila Pathfinder. Level berikutnya dapat dikembangkan dari sini.');
}

closeQuizBtn.addEventListener('click',()=>quizModal.classList.add('hidden'));
actionBtn.addEventListener('click',interact);
document.getElementById('missionBtn').addEventListener('click',()=>openDialogue('Misi Saat Ini',missionText.textContent));

function togglePause(){
  state.paused=!state.paused;
  pauseModal.classList.toggle('hidden',!state.paused);
}
pauseBtn.addEventListener('click',togglePause);
resumeBtn.addEventListener('click',()=>{state.paused=false;pauseModal.classList.add('hidden')});
resetBtn.addEventListener('click',()=>{
  localStorage.removeItem('pancaquest_level1');
  location.reload();
});

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
  alert('Laptop: WASD / panah untuk bergerak, E atau Space untuk interaksi.\\nHP: gunakan joystick analog dan tombol AKSI.\\nIkuti tanda ! dan teks Misi Saat Ini.');
});
document.getElementById('soundBtn').addEventListener('click',e=>{
  e.currentTarget.textContent = e.currentTarget.textContent==='🔊' ? '🔇' : '🔊';
});
document.getElementById('miniExpand').addEventListener('click',()=>openDialogue('Peta Sekolah','Urutan Level 1: Nadia → Perpustakaan → Pak Budi → Taman → Sekolah (Final Mission).'));

updatePlayer();
updateHUD();
updateNearPrompts();


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
const level2Portal = document.getElementById('level2Portal');
const levelCompleteModal = document.getElementById('levelCompleteModal');
const goLevel2Btn = document.getElementById('goLevel2Btn');
const level2Scene = document.getElementById('level2Scene');
const l2CollectedText = document.getElementById('l2Collected');
const l2Message = document.getElementById('l2Message');
const level2CompleteModal = document.getElementById('level2CompleteModal');
const l2TotalXp = document.getElementById('l2TotalXp');
const goLevel3Btn = document.getElementById('goLevel3Btn');
const level3Scene = document.getElementById('level3Scene');
const l3DoneText = document.getElementById('l3Done');
const l3Message = document.getElementById('l3Message');
const level3CompleteModal = document.getElementById('level3CompleteModal');
const l3TotalXp = document.getElementById('l3TotalXp');
const goLevel4Btn = document.getElementById('goLevel4Btn');
const level4Scene=document.getElementById('level4Scene');
const scenarioTitle=document.getElementById('scenarioTitle');
const scenarioText=document.getElementById('scenarioText');
const l4DoneText=document.getElementById('l4Done');
const l4Message=document.getElementById('l4Message');
const adventureCompleteModal=document.getElementById('adventureCompleteModal');
const finalBadge=document.getElementById('finalBadge');
const finalAdventureXp=document.getElementById('finalAdventureXp');
const finalScore=document.getElementById('finalScore');
const finalScenario=document.getElementById('finalScenario');
const finalAction=document.getElementById('finalAction');
const finalActor=document.getElementById('finalActor');
const finalTime=document.getElementById('finalTime');
const finalIndicator=document.getElementById('finalIndicator');
const saveReturnBtn=document.getElementById('saveReturnBtn');
const restartRandomBtn=document.getElementById('restartRandomBtn');

let state = {
  x: 47,
  y: 69,
  xp: 0,
  progress: 25,
  paused: false,
  stage: 0, // 0 Nadia, 1 Library, 2 Pak Budi, 3 Park, 4 Final School, 5 Complete
  lastDir: 'down',
  currentLevel: 1,
  level2Collected: [],
  totalXp: 100,
  lastHazardHit: 0,
  level3Step: 0,
  audioEnabled: true,
  audioStarted: false,
  level4Step:0, mistakes:0, level4Scenario:null, level4Plan:{}
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
  { title:'Level 1 Selesai!', mission:'Level berikutnya terbuka. Pergi ke portal LEVEL 2 di Taman atau tekan tombol Lanjut ke Level 2.', progress:100, xp:100 }
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
  level2Portal.classList.toggle('hidden', state.stage !== 5);
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
  if(state.currentLevel===2) checkLevel2Collisions();
  if(state.currentLevel===3) checkLevel3Interactions();
  if(state.currentLevel===4) checkLevel4Interactions();
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
  if(state.currentLevel!==1){
    libraryPrompt.classList.add('hidden');
    parkPrompt.classList.add('hidden');
    schoolPrompt.classList.add('hidden');
    return;
  }
  libraryPrompt.classList.toggle('hidden', !(state.stage===1 && nearRect(libraryArea,110)));
  parkPrompt.classList.toggle('hidden', !(state.stage===3 && nearRect(parkArea,110)));
  schoolPrompt.classList.toggle('hidden', !(state.stage===4 && nearRect(schoolArea,120)));
}

function interact(){
  ensureAudio();

  if(state.currentLevel===4){
    if(!interactLevel4()){l4Message.textContent='🛠️ Dekati stasiun aksi yang aktif lalu tekan E / Space / AKSI.';playSfx('interact');}
    return;
  }

  if(state.currentLevel===3){
    if(!interactLevel3()){
      l3Message.textContent='🗣️ Dekati titik musyawarah yang aktif lalu tekan E / Space / AKSI.';
      playSfx('interact');
    }
    return;
  }

  if(state.currentLevel===2){
    l2Message.textContent='🌳 Bergeraklah menuju nilai positif. Nilai akan otomatis terambil saat disentuh.';
    playSfx('interact');
    return;
  }

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

  // Setelah Level 1 selesai, portal Level 2 berada di Taman.
  if(state.stage===5 && state.currentLevel===1 && nearRect(parkArea,130)){
    startLevel2Preview();
    return;
  }

  // Helpful contextual hints
  if(near(nadia,165)){
    if(state.stage===5){
      openDialogue('Nadia','Level 1 sudah selesai. Gunakan tombol “Lanjut ke Level 2” atau pergi menuju portal LEVEL 2 di Taman.');
    }else{
      openDialogue('Nadia','Lanjutkan misi sesuai petunjuk di kiri bawah. Tanda ! menunjukkan lokasi berikutnya.');
    }
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


// RANDOMIZATION PER SESSION
function shuffleArray(arr){const a=[...arr];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function pickRandom(arr){return arr[Math.floor(Math.random()*arr.length)];}
const sessionQuestionCache={};
function pickSessionQuestion(key,bank){if(!sessionQuestionCache[key])sessionQuestionCache[key]=pickRandom(bank);return sessionQuestionCache[key];}
function shuffledOptions(options){return shuffleArray(options.map(x=>[x[0],x[1]]));}

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


const LEVEL1_VARIANTS={
 library:[
  {badge:'📚 Perpustakaan • C4',title:'Tantangan Menghargai Perbedaan',caseText:'Seorang siswa menertawakan logat daerah temannya saat presentasi. Sikap apa yang paling sesuai dengan kepribadian Pancasila?',options:[['Ikut tertawa agar suasana tidak tegang.',false],['Menghentikan ejekan dan menghargai cara bicara teman.',true],['Meminta teman tidak berbicara lagi.',false],['Membiarkannya karena bukan urusan kita.',false]],correctText:'✅ Tepat! Menghargai martabat dan perbedaan sesuai dengan Pancasila.',nextStage:2},
  {badge:'📚 Perpustakaan • C4',title:'Tantangan Sikap Toleran',caseText:'Dua teman berbeda pilihan kegiatan budaya. Salah satu memaksa temannya mengikuti pilihannya. Sikap paling tepat adalah...',options:[['Memaksa balik agar adil.',false],['Mendengarkan alasan masing-masing dan menghargai perbedaan.',true],['Tidak perlu berbicara lagi.',false],['Memilih pilihan yang paling populer.',false]],correctText:'✅ Benar. Toleransi berarti menghargai perbedaan tanpa memaksakan kehendak.',nextStage:2}],
 teacher:[
  {badge:'👨‍🏫 Pak Budi • Analisis',title:'Analisis Kerja Sama',caseText:'Dalam kerja kelompok, semua anggota mendapat tugas sesuai kesepakatan dan saling membantu. Mengapa perilaku tersebut mencerminkan Pancasila?',options:[['Karena tugas hanya perlu selesai.',false],['Karena mencerminkan gotong royong dan tanggung jawab bersama.',true],['Karena semua harus memiliki kemampuan sama.',false],['Karena ketua kelompok tidak perlu ikut bekerja.',false]],correctText:'✅ Tepat! Gotong royong tampak ketika anggota bekerja dan bertanggung jawab bersama.',nextStage:3},
  {badge:'👨‍🏫 Pak Budi • Analisis',title:'Analisis Keadilan',caseText:'Ketua kelas membagi kesempatan presentasi secara merata kepada seluruh kelompok. Nilai apa yang paling terlihat?',options:[['Keadilan karena setiap kelompok mendapat kesempatan yang layak.',true],['Persaingan karena semua ingin tampil.',false],['Kebebasan tanpa aturan.',false],['Kepatuhan kepada ketua kelas.',false]],correctText:'✅ Benar. Pembagian kesempatan secara proporsional menunjukkan keadilan.',nextStage:3}],
 park:[
  {badge:'🌳 Taman • C5',title:'Evaluasi Pilihan',caseText:'Kelas memiliki dua ide kegiatan: pameran budaya atau pertunjukan kolaborasi. Apa cara terbaik memilihnya?',options:[['Bandingkan manfaat, keterlibatan siswa, dan kesesuaiannya dengan tujuan.',true],['Pilih yang paling murah saja.',false],['Ikuti ide teman paling populer.',false],['Serahkan seluruh keputusan kepada satu orang.',false]],correctText:'✅ Tepat! Evaluasi memerlukan kriteria yang jelas.',nextStage:4},
  {badge:'🌳 Taman • C5',title:'Pilih Solusi Adil',caseText:'Ada siswa yang merasa tidak dilibatkan dalam persiapan kegiatan kelas. Apa solusi paling tepat?',options:[['Membiarkannya karena pembagian tugas sudah dibuat.',false],['Meninjau pembagian tugas dan memberi peran bermakna kepada semua anggota.',true],['Meminta siswa tersebut hanya menonton.',false],['Mengganti seluruh anggota kelompok.',false]],correctText:'✅ Benar. Solusi yang baik memperhatikan partisipasi dan keadilan.',nextStage:4}],
 final:[
  {badge:'🏫 Final Mission • C6',title:'Final Mission — Rencana Aksi',caseText:'Kelas ingin mengurangi kebiasaan saling mengejek perbedaan. Rencana mana yang paling lengkap?',options:[['Membuat kesepakatan kelas, menentukan penanggung jawab, waktu pelaksanaan, dan indikator perubahan perilaku.',true],['Memberi nasihat sekali lalu selesai.',false],['Menunggu masalah hilang sendiri.',false],['Mengandalkan guru untuk menyelesaikan semuanya.',false]],correctText:'🏆 Tepat! Rencana lengkap memuat tindakan, pelaksana, waktu, dan indikator.',nextStage:5},
  {badge:'🏫 Final Mission • C6',title:'Final Mission — Aksi Kelas',caseText:'Kelas ingin menumbuhkan budaya musyawarah. Rancangan mana yang paling dapat dilaksanakan?',options:[['Menetapkan forum kelas mingguan, fasilitator, jadwal, dan indikator partisipasi.',true],['Meminta semua siswa selalu setuju.',false],['Membiarkan ketua mengambil semua keputusan.',false],['Mengadakan rapat hanya saat konflik besar.',false]],correctText:'🏆 Benar! Rancangan tersebut jelas, terukur, dan dapat dipantau.',nextStage:5}]
};
function getLevel1Question(id){return pickSessionQuestion('L1-'+id,[QUIZZES[id],...(LEVEL1_VARIANTS[id]||[])]);}

function openQuiz(id){
  activeQuiz=id;
  const q=getLevel1Question(id);
  quizBadge.textContent=q.badge;
  quizTitle.textContent=q.title;
  quizCase.textContent=q.caseText;
  quizFeedback.textContent='';
  quizFeedback.className='quiz-feedback';
  quizOptions.innerHTML='';
  shuffledOptions(q.options).forEach(([label,correct],i)=>{
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
    playSfx('correct');
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
    state.mistakes++;
    playSfx('wrong');
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

  // Belum menandai seluruh PancaQuest selesai, karena masih ada Level 2–4.
  localStorage.setItem('pancaquest_adventure_progress', JSON.stringify({
    currentLevel:2,
    level1Completed:true,
    totalXp:100,
    updated_at:new Date().toISOString()
  }));

  updateQuestMarkers();
  levelCompleteModal.classList.remove('hidden');
}


function startLevel2Preview(){
  levelCompleteModal.classList.add('hidden');

  state.currentLevel = 2;
  state.level2Collected = [];
  state.totalXp = 100;

  document.querySelector('.level-top span').textContent='LEVEL 2';
  document.querySelector('.level-top strong').textContent='Taman Nilai • Kumpulkan Nilai Baik';
  progressBar.style.width='0%';
  progressText.textContent='0%';

  missionTitle.textContent='Level 2 • Taman Nilai';
  missionText.textContent='Kumpulkan 4 nilai positif dan hindari perilaku negatif. Sentuh nilai positif untuk mengambilnya.';
  xpText.textContent='100 XP';

  // Switch actual map
  gameArea.classList.add('level2-active');
  level2Scene.classList.remove('hidden');

  // Reset positions of collectibles
  document.querySelectorAll('.good-value').forEach(el=>el.classList.remove('collected'));
  l2CollectedText.textContent='0';
  l2Message.textContent='🌳 Bergeraklah di taman dan sentuh 4 nilai positif.';

  // Move character to Level 2 spawn point.
  state.x = 48;
  state.y = 76;
  updatePlayer();

  localStorage.setItem('pancaquest_adventure_progress', JSON.stringify({
    currentLevel:2,
    level1Completed:true,
    level2Completed:false,
    totalXp:100,
    updated_at:new Date().toISOString()
  }));
}

goLevel2Btn.addEventListener('click', startLevel2Preview);


function rectDistanceBetween(a,b){
  const ra=a.getBoundingClientRect(), rb=b.getBoundingClientRect();
  const ax=ra.left+ra.width/2, ay=ra.top+ra.height/2;
  const bx=rb.left+rb.width/2, by=rb.top+rb.height/2;
  return Math.hypot(ax-bx, ay-by);
}

function checkLevel2Collisions(){
  if(state.currentLevel!==2 || state.paused) return;

  const now=Date.now();

  document.querySelectorAll('.good-value:not(.collected)').forEach(el=>{
    if(rectDistanceBetween(player,el) < 64){
      collectGoodValue(el);
    }
  });

  document.querySelectorAll('.hazard-orb').forEach(el=>{
    if(rectDistanceBetween(player,el) < 62 && now-state.lastHazardHit>1100){
      state.lastHazardHit=now;
      hitHazard(el);
    }
  });
}

function collectGoodValue(el){
  const id=el.dataset.id;
  if(state.level2Collected.includes(id)) return;

  state.level2Collected.push(id);
  el.classList.add('collected');

  const count=state.level2Collected.length;
  l2CollectedText.textContent=String(count);

  state.totalXp = 100 + count*6 + (count===4 ? 1 : 0); // 125 max after Level 2
  xpText.textContent=state.totalXp+' XP';

  const pct=Math.round(count/4*100);
  progressBar.style.width=pct+'%';
  progressText.textContent=pct+'%';

  l2Message.textContent=`✅ ${el.dataset.value} ditemukan! (${count}/4)`;
  playSfx('collect');

  if(count===4){
    setTimeout(completeLevel2,700);
  }
}

function hitHazard(el){
  el.classList.add('hit');
  setTimeout(()=>el.classList.remove('hit'),400);

  l2Message.textContent=`⚠️ Hindari ${el.dataset.hazard}. Cari nilai positif di sekitarmu.`;
  state.mistakes++;
  playSfx('wrong');

  // small pushback
  state.x = clamp(state.x - 2.3,2,94);
  state.y = clamp(state.y + 1.4,7,84);
  updatePlayer();
}

function completeLevel2(){
  state.currentLevel=2;
  state.totalXp=125;
  xpText.textContent='125 XP';
  progressBar.style.width='100%';
  progressText.textContent='100%';
  missionTitle.textContent='Level 2 Selesai!';
  missionText.textContent='Kamu telah mengumpulkan empat nilai positif. Level 3 siap dibuka.';
  l2TotalXp.textContent='125 XP';

  localStorage.setItem('pancaquest_adventure_progress', JSON.stringify({
    currentLevel:3,
    level1Completed:true,
    level2Completed:true,
    totalXp:125,
    updated_at:new Date().toISOString()
  }));

  level2CompleteModal.classList.remove('hidden');
  playSfx('level');
}

goLevel3Btn.addEventListener('click', startLevel3);

function startLevel3(){
  level2CompleteModal.classList.add('hidden');

  state.currentLevel = 3;
  state.level3Step = 0;
  state.totalXp = 125;

  gameArea.classList.remove('level2-active');
  gameArea.classList.add('level3-active');
  level2Scene.classList.add('hidden');
  level3Scene.classList.remove('hidden');

  document.querySelector('.level-top span').textContent='LEVEL 3';
  document.querySelector('.level-top strong').textContent='Ruang Musyawarah • Pilih Solusinya';
  progressBar.style.width='0%';
  progressText.textContent='0%';
  xpText.textContent='125 XP';

  missionTitle.textContent='Level 3 • Ruang Musyawarah';
  missionText.textContent='Selesaikan 3 tahap: dengarkan semua pihak, bandingkan alternatif, lalu putuskan bersama.';
  l3DoneText.textContent='0';
  l3Message.textContent='🗣️ Mulailah dari titik 1: Dengarkan Semua Pihak.';

  document.querySelectorAll('.decision-point').forEach((el,i)=>{
    el.classList.remove('completed');
    el.classList.toggle('locked', i!==0);
    const small=el.querySelector('small');
    if(i===0) small.textContent='Dekati lalu E / AKSI';
    if(i===1) small.textContent='Selesaikan tahap 1';
    if(i===2) small.textContent='Selesaikan tahap 2';
  });

  state.x=22; state.y=66; updatePlayer();

  localStorage.setItem('pancaquest_adventure_progress', JSON.stringify({
    currentLevel:3,
    level1Completed:true,
    level2Completed:true,
    level3Completed:false,
    totalXp:125,
    updated_at:new Date().toISOString()
  }));

  playSfx('level');
}


// =============================================================
// AUDIO ENGINE — procedural (no external MP3)
// =============================================================
let audioCtx=null;
let masterGain=null;
let musicTimer=null;
let musicStep=0;

function ensureAudio(){
  if(!state.audioEnabled) return;
  if(!audioCtx){
    const AC=window.AudioContext||window.webkitAudioContext;
    if(!AC) return;
    audioCtx=new AC();
    masterGain=audioCtx.createGain();
    masterGain.gain.value=.16;
    masterGain.connect(audioCtx.destination);
  }
  if(audioCtx.state==='suspended') audioCtx.resume();
  if(!state.audioStarted){
    state.audioStarted=true;
    startBackgroundMusic();
    document.getElementById('soundBtn')?.classList.add('sound-active');
  }
}

function tone(freq,duration=.12,type='sine',volume=.12,when=0){
  if(!state.audioEnabled) return;
  ensureAudio();
  if(!audioCtx||!masterGain) return;
  const osc=audioCtx.createOscillator();
  const gain=audioCtx.createGain();
  osc.type=type; osc.frequency.value=freq;
  gain.gain.setValueAtTime(volume,audioCtx.currentTime+when);
  gain.gain.exponentialRampToValueAtTime(.0001,audioCtx.currentTime+when+duration);
  osc.connect(gain); gain.connect(masterGain);
  osc.start(audioCtx.currentTime+when);
  osc.stop(audioCtx.currentTime+when+duration+.02);
}

function playSfx(name){
  if(!state.audioEnabled) return;
  ensureAudio();
  if(name==='interact'){ tone(520,.08,'sine',.18);tone(690,.09,'sine',.14,.07); }
  if(name==='correct'){ tone(523,.12,'triangle',.18);tone(659,.12,'triangle',.16,.11);tone(784,.18,'triangle',.15,.22); }
  if(name==='wrong'){ tone(240,.12,'sawtooth',.12);tone(185,.2,'sawtooth',.1,.11); }
  if(name==='collect'){ tone(660,.08,'square',.1);tone(880,.12,'square',.08,.08); }
  if(name==='level'){ tone(392,.12,'triangle',.14);tone(523,.14,'triangle',.14,.12);tone(659,.18,'triangle',.13,.25); }
}

function startBackgroundMusic(){
  if(musicTimer) return;
  musicTimer=setInterval(()=>{
    if(!state.audioEnabled || !audioCtx) return;
    const patterns={1:[261.63,329.63,392,329.63,293.66,349.23,440,349.23],2:[293.66,369.99,440,369.99,329.63,392,493.88,392],3:[220,293.66,349.23,293.66,246.94,329.63,392,329.63],4:[261.63,392,523.25,392,293.66,440,587.33,440]};
    const pattern=patterns[state.currentLevel]||patterns[1];
    const f=pattern[musicStep%pattern.length];
    tone(f,.28,'triangle',.025);
    if(musicStep%2===0) tone(f/2,.4,'sine',.018,.02);
    musicStep++;
  },420);
}

function stopBackgroundMusic(){
  if(musicTimer){ clearInterval(musicTimer); musicTimer=null; }
}

['pointerdown','keydown','touchstart'].forEach(evt=>{
  document.addEventListener(evt,()=>ensureAudio(),{once:true});
});

const originalOpenDialogue = openDialogue;
openDialogue = function(name,text){
  playSfx('interact');
  originalOpenDialogue(name,text);
};

// =============================================================
// LEVEL 3 — branching musyawarah challenges
// =============================================================
const LEVEL3_QUIZZES = {
  1:{
    badge:'🗣️ Tahap 1 • Mendengar',
    title:'Dengarkan Semua Pihak',
    caseText:'Kelompok A ingin menampilkan tari daerah. Kelompok B ingin menampilkan tarian populer modern. Apa langkah pertama yang paling tepat?',
    options:[
      ['Langsung melakukan voting agar cepat selesai.',false],
      ['Mendengarkan alasan dan kebutuhan kedua kelompok terlebih dahulu.',true],
      ['Ketua kelas memilih salah satu usulan.',false],
      ['Membatalkan penampilan agar tidak terjadi perbedaan.',false]
    ],
    correctText:'✅ Tepat! Musyawarah dimulai dengan memberi ruang kepada semua pihak untuk menyampaikan alasan.'
  },
  2:{
    badge:'⚖️ Tahap 2 • Evaluasi C5',
    title:'Bandingkan Alternatif',
    caseText:'Setelah mendengar kedua kelompok, kelas memiliki dua alternatif: (A) hanya tari daerah, atau (B) pertunjukan kolaborasi budaya lokal dan modern. Bagaimana cara mengevaluasinya?',
    options:[
      ['Pilih yang paling banyak disukai tanpa mempertimbangkan dampaknya.',false],
      ['Bandingkan manfaat, risiko, keterlibatan semua anggota, dan kesesuaiannya dengan nilai Pancasila.',true],
      ['Pilih usulan teman dekat agar hubungan tetap baik.',false],
      ['Biarkan guru memutuskan semuanya.',false]
    ],
    correctText:'✅ Benar. Evaluasi berarti membandingkan alternatif dengan kriteria yang jelas, bukan sekadar selera.'
  },
  3:{
    badge:'🤝 Tahap 3 • Keputusan',
    title:'Putuskan Bersama',
    caseText:'Hasil diskusi menunjukkan pertunjukan kolaborasi dapat melibatkan lebih banyak siswa dan tetap menghargai budaya lokal. Keputusan apa yang paling sesuai?',
    options:[
      ['Memilih kolaborasi melalui kesepakatan dan membagi peran secara adil.',true],
      ['Tetap memilih usulan kelompok mayoritas saja.',false],
      ['Menunda keputusan sampai semua siswa memiliki selera yang sama.',false],
      ['Ketua kelas mengambil alih seluruh keputusan.',false]
    ],
    correctText:'✅ Tepat! Keputusan bersama perlu menjaga persatuan, partisipasi, dan pembagian peran yang adil.'
  }
};


const LEVEL3_VARIANTS={
 1:[
  {badge:'🗣️ Tahap 1 • Mendengar',title:'Dengar Sebelum Memutuskan',caseText:'Dua kelompok berbeda pendapat mengenai tema pentas kelas. Apa tindakan awal ketua kelas?',options:[['Memberi kesempatan kedua kelompok menjelaskan alasan dan kebutuhan mereka.',true],['Memilih usulan yang paling cepat.',false],['Mengikuti kelompok yang jumlahnya lebih banyak.',false],['Menunda pembahasan tanpa mendengar alasan.',false]],correctText:'✅ Benar. Mendengar semua pihak merupakan dasar musyawarah yang adil.'},
  {badge:'🗣️ Tahap 1 • Mendengar',title:'Ruang untuk Pendapat',caseText:'Seorang anggota kelompok belum pernah menyampaikan pendapat karena selalu dipotong teman. Apa yang sebaiknya dilakukan fasilitator?',options:[['Memberinya kesempatan berbicara tanpa dipotong.',true],['Mengabaikannya agar rapat cepat selesai.',false],['Meminta ia mengikuti keputusan mayoritas.',false],['Mengakhiri diskusi.',false]],correctText:'✅ Tepat. Musyawarah membutuhkan kesempatan yang setara.'}],
 2:[
  {badge:'⚖️ Tahap 2 • Evaluasi C5',title:'Bandingkan Dampak',caseText:'Pilihan A lebih cepat tetapi hanya melibatkan sedikit siswa. Pilihan B lebih lama tetapi melibatkan hampir seluruh kelas. Bagaimana menilainya?',options:[['Bandingkan manfaat, keterlibatan, waktu, dan tujuan kegiatan.',true],['Pilih yang paling cepat saja.',false],['Pilih yang disukai ketua.',false],['Tidak perlu membandingkan.',false]],correctText:'✅ Benar. Evaluasi membutuhkan beberapa kriteria yang relevan.'},
  {badge:'⚖️ Tahap 2 • Evaluasi C5',title:'Nilai Dua Alternatif',caseText:'Satu alternatif menjaga tradisi lokal tetapi kurang melibatkan siswa. Alternatif lain memadukan budaya lokal dan modern serta memberi lebih banyak peran. Apa yang perlu dipertimbangkan?',options:[['Dampak pada persatuan, partisipasi, dan penghargaan terhadap budaya.',true],['Hanya selera pribadi.',false],['Siapa yang mengusulkan.',false],['Yang paling ramai di media sosial.',false]],correctText:'✅ Tepat. Dampak dan nilai Pancasila menjadi dasar evaluasi.'}],
 3:[
  {badge:'🤝 Tahap 3 • Keputusan',title:'Kesepakatan Bersama',caseText:'Setelah membandingkan pilihan, kelas memilih solusi kolaboratif. Apa langkah berikutnya?',options:[['Menetapkan kesepakatan bersama dan membagi peran secara adil.',true],['Mengubah keputusan diam-diam.',false],['Membiarkan satu kelompok mengerjakan semuanya.',false],['Membatalkan keputusan.',false]],correctText:'✅ Benar. Kesepakatan perlu diikuti pembagian peran dan tanggung jawab.'},
  {badge:'🤝 Tahap 3 • Keputusan',title:'Keputusan Bertanggung Jawab',caseText:'Diskusi telah menghasilkan pilihan yang dinilai paling adil. Bagaimana agar keputusan tersebut bertanggung jawab?',options:[['Tetapkan keputusan, pembagian tugas, dan mekanisme evaluasinya bersama.',true],['Cukup umumkan keputusan tanpa pembagian tugas.',false],['Serahkan seluruh pelaksanaan kepada ketua.',false],['Tidak perlu mengevaluasi hasilnya.',false]],correctText:'✅ Tepat. Keputusan yang baik perlu diterjemahkan menjadi tanggung jawab yang jelas.'}]
};
function getLevel3Question(step){return pickSessionQuestion('L3-'+step,[LEVEL3_QUIZZES[step],...(LEVEL3_VARIANTS[step]||[])]);}

function nearDecision(el,threshold=90){ return rectDistanceBetween(player,el)<threshold; }

function checkLevel3Interactions(){
  if(state.currentLevel!==3) return;
  const activeStep=state.level3Step+1;
  const el=document.querySelector(`.decision-point[data-decision="${activeStep}"]`);
  if(!el) return;
  if(nearDecision(el,95)){
    l3Message.textContent=`✨ Titik ${activeStep} siap. Tekan E / Space / AKSI.`;
  }else{
    l3Message.textContent=`🗣️ Pergi ke titik ${activeStep}: ${el.querySelector('b').textContent}.`;
  }
}

function interactLevel3(){
  const step=state.level3Step+1;
  const el=document.querySelector(`.decision-point[data-decision="${step}"]`);
  if(!el || el.classList.contains('locked')) return false;
  if(nearDecision(el,105)){
    openLevel3Quiz(step);
    return true;
  }
  return false;
}

function openLevel3Quiz(step){
  const q=getLevel3Question(step);
  quizBadge.textContent=q.badge;
  quizTitle.textContent=q.title;
  quizCase.textContent=q.caseText;
  quizFeedback.textContent='';
  quizFeedback.className='quiz-feedback';
  quizOptions.innerHTML='';

  shuffledOptions(q.options).forEach(([label,correct],i)=>{
    const btn=document.createElement('button');
    btn.className='quiz-option';
    btn.textContent=String.fromCharCode(65+i)+'. '+label;
    btn.addEventListener('click',()=>{
      const buttons=[...quizOptions.querySelectorAll('.quiz-option')];
      buttons.forEach(b=>b.disabled=true);
      if(correct){
        btn.classList.add('correct');
        quizFeedback.textContent=q.correctText;
        quizFeedback.className='quiz-feedback good';
        playSfx('correct');
        setTimeout(()=>completeLevel3Step(step),1000);
      }else{
        btn.classList.add('wrong');
        quizFeedback.textContent='Belum paling tepat. Perhatikan prinsip musyawarah, partisipasi, dan penghargaan terhadap semua pihak.';
        quizFeedback.className='quiz-feedback bad';
        state.mistakes++;
        playSfx('wrong');
        setTimeout(()=>{
          buttons.forEach(b=>{b.disabled=false;b.classList.remove('wrong')});
          quizFeedback.textContent='Coba lagi dengan mempertimbangkan dampak setiap pilihan.';
        },950);
      }
    });
    quizOptions.appendChild(btn);
  });
  quizModal.classList.remove('hidden');
  playSfx('interact');
}

function completeLevel3Step(step){
  quizModal.classList.add('hidden');
  const current=document.querySelector(`.decision-point[data-decision="${step}"]`);
  current?.classList.add('completed');
  current?.classList.remove('locked');
  if(current?.querySelector('small')) current.querySelector('small').textContent='✅ Selesai';

  state.level3Step=step;
  l3DoneText.textContent=String(step);

  const pct=Math.round(step/3*100);
  progressBar.style.width=pct+'%';
  progressText.textContent=pct+'%';

  state.totalXp=125 + Math.round(step*(25/3));
  xpText.textContent=state.totalXp+' XP';

  const next=document.querySelector(`.decision-point[data-decision="${step+1}"]`);
  if(next){
    next.classList.remove('locked');
    next.querySelector('small').textContent='Dekati lalu E / AKSI';
    l3Message.textContent=`✅ Tahap ${step} selesai. Lanjutkan ke titik ${step+1}.`;
  }else{
    state.totalXp=150;
    xpText.textContent='150 XP';
    progressBar.style.width='100%';
    progressText.textContent='100%';
    setTimeout(completeLevel3,650);
  }
}

function completeLevel3(){
  missionTitle.textContent='Level 3 Selesai!';
  missionText.textContent='Kamu berhasil menyelesaikan proses musyawarah secara bertahap.';
  l3TotalXp.textContent='150 XP';

  localStorage.setItem('pancaquest_adventure_progress', JSON.stringify({
    currentLevel:4,
    level1Completed:true,
    level2Completed:true,
    level3Completed:true,
    totalXp:150,
    updated_at:new Date().toISOString()
  }));
  level3CompleteModal.classList.remove('hidden');
  playSfx('level');
}

goLevel4Btn.addEventListener('click', startLevel4);

const LEVEL4_SCENARIOS=[
 {id:'respect',title:'Kelas Saling Menghargai',text:'Beberapa siswa masih saling mengejek selera budaya dan cara berbicara teman. Kelas ingin membangun kebiasaan saling menghargai.',steps:{
  1:{badge:'🎯 Tahap 1 • Tindakan C6',title:'Pilih Tindakan Utama',caseText:'Tindakan utama apa yang paling konkret untuk memulai perubahan?',options:[['Menyusun kesepakatan kelas anti-ejekan dan praktik komunikasi saling menghargai.',true],['Menunggu sampai siswa berhenti mengejek sendiri.',false],['Melarang semua perbedaan pendapat.',false],['Hanya menempel poster tanpa tindak lanjut.',false]]},
  2:{badge:'👥 Tahap 2 • Pelaksana',title:'Tentukan Pelaksana',caseText:'Siapa yang sebaiknya terlibat agar tindakan dapat berjalan?',options:[['Seluruh siswa dengan koordinator ketua kelas dan pendampingan guru.',true],['Ketua kelas saja.',false],['Guru saja tanpa melibatkan siswa.',false],['Hanya siswa yang pernah mengejek.',false]]},
  3:{badge:'🕒 Tahap 3 • Waktu',title:'Tentukan Waktu',caseText:'Waktu pelaksanaan mana yang paling realistis?',options:[['Mulai minggu ini, dipantau selama dua minggu, lalu dievaluasi.',true],['Suatu saat jika ada waktu.',false],['Hanya satu hari tanpa tindak lanjut.',false],['Setelah semester berakhir.',false]]},
  4:{badge:'📊 Tahap 4 • Indikator',title:'Tentukan Indikator Keberhasilan',caseText:'Indikator apa yang paling dapat diamati?',options:[['Berkurangnya ejekan dan meningkatnya perilaku saling menghargai saat diskusi.',true],['Semua siswa selalu memiliki pendapat yang sama.',false],['Kelas menjadi lebih sepi.',false],['Tidak ada lagi kegiatan diskusi.',false]]}
 }},
 {id:'deliberation',title:'Budaya Musyawarah Kelas',text:'Keputusan kelompok sering didominasi beberapa siswa sehingga anggota lain kurang terlibat. Kelas ingin membangun musyawarah yang lebih adil.',steps:{
  1:{badge:'🎯 Tahap 1 • Tindakan C6',title:'Pilih Tindakan Utama',caseText:'Tindakan apa yang paling tepat?',options:[['Membuat forum musyawarah dengan giliran bicara dan pencatatan usulan.',true],['Memberikan seluruh keputusan kepada ketua kelas.',false],['Melakukan voting tanpa diskusi.',false],['Menghindari pembahasan yang berbeda pendapat.',false]]},
  2:{badge:'👥 Tahap 2 • Pelaksana',title:'Tentukan Pelaksana',caseText:'Siapa yang sebaiknya menjalankan forum tersebut?',options:[['Seluruh anggota kelas dengan fasilitator bergilir dan guru sebagai pendamping.',true],['Satu siswa paling aktif saja.',false],['Guru saja.',false],['Hanya pengurus kelas.',false]]},
  3:{badge:'🕒 Tahap 3 • Waktu',title:'Tentukan Waktu',caseText:'Waktu mana yang paling terencana?',options:[['Dilaksanakan setiap ada keputusan kelompok dan dievaluasi setiap akhir minggu.',true],['Hanya jika terjadi pertengkaran.',false],['Tanpa jadwal yang jelas.',false],['Sekali setahun.',false]]},
  4:{badge:'📊 Tahap 4 • Indikator',title:'Tentukan Indikator Keberhasilan',caseText:'Indikator mana yang menunjukkan forum berjalan baik?',options:[['Lebih banyak siswa menyampaikan pendapat dan keputusan disepakati dengan alasan yang jelas.',true],['Rapat berlangsung paling singkat.',false],['Ketua selalu menang dalam keputusan.',false],['Tidak ada pendapat yang berbeda.',false]]}
 }},
 {id:'culture',title:'Pentas Budaya yang Memersatukan',text:'Kelas ingin menyelenggarakan pentas yang tetap menghargai budaya lokal sekaligus memberi ruang kreativitas modern.',steps:{
  1:{badge:'🎯 Tahap 1 • Tindakan C6',title:'Pilih Tindakan Utama',caseText:'Tindakan utama apa yang paling sesuai?',options:[['Merancang pertunjukan kolaboratif yang memadukan unsur lokal dan modern secara saling menghargai.',true],['Menghapus seluruh unsur modern.',false],['Menggunakan budaya populer saja.',false],['Membatalkan pentas karena ada perbedaan selera.',false]]},
  2:{badge:'👥 Tahap 2 • Pelaksana',title:'Tentukan Pelaksana',caseText:'Siapa yang perlu terlibat?',options:[['Tim lintas minat: penampil, penata musik, dekorasi, dokumentasi, dan koordinator.',true],['Hanya siswa yang pandai menari.',false],['Guru yang mengerjakan semuanya.',false],['Satu kelompok budaya saja.',false]]},
  3:{badge:'🕒 Tahap 3 • Waktu',title:'Tentukan Waktu',caseText:'Jadwal mana yang paling memungkinkan?',options:[['Perencanaan hari pertama, latihan bertahap selama satu minggu, lalu evaluasi sebelum tampil.',true],['Latihan hanya sesaat sebelum tampil.',false],['Tidak perlu jadwal.',false],['Menunggu semua siswa memiliki waktu kosong bersamaan.',false]]},
  4:{badge:'📊 Tahap 4 • Indikator',title:'Tentukan Indikator Keberhasilan',caseText:'Indikator keberhasilan yang paling tepat adalah...',options:[['Semua tim terlibat, unsur budaya lokal dihargai, dan pertunjukan selesai sesuai kesepakatan.',true],['Pertunjukan mendapat tepuk tangan paling keras.',false],['Hanya satu kelompok yang tampil dominan.',false],['Tidak ada unsur budaya yang berbeda.',false]]}
 }}
];

function startLevel4(){
 level3CompleteModal.classList.add('hidden'); state.currentLevel=4; state.level4Step=0; state.totalXp=150; state.level4Plan={}; state.level4Scenario=pickRandom(LEVEL4_SCENARIOS);
 gameArea.classList.remove('level3-active'); gameArea.classList.add('level4-active'); level3Scene.classList.add('hidden'); level4Scene.classList.remove('hidden');
 document.querySelector('.level-top span').textContent='LEVEL 4'; document.querySelector('.level-top strong').textContent='Kelas Aksi • Rancang Tindakan Nyata'; progressBar.style.width='0%'; progressText.textContent='0%'; xpText.textContent='150 XP';
 scenarioTitle.textContent=state.level4Scenario.title; scenarioText.textContent=state.level4Scenario.text; missionTitle.textContent='Level 4 • Kelas Aksi'; missionText.textContent='Lengkapi 4 unsur rancangan tindakan: tindakan, pelaksana, waktu, dan indikator.'; l4DoneText.textContent='0'; l4Message.textContent='🛠️ Mulailah dari stasiun 1: Tindakan.';
 document.querySelectorAll('.action-station').forEach((el,i)=>{el.classList.remove('completed');el.classList.toggle('locked',i!==0);const s=el.querySelector('small');s.textContent=i===0?'Dekati lalu E / AKSI':`Selesaikan tahap ${i}`;});
 state.x=18;state.y=68;updatePlayer();
 localStorage.setItem('pancaquest_adventure_progress',JSON.stringify({currentLevel:4,level1Completed:true,level2Completed:true,level3Completed:true,level4Completed:false,scenario:state.level4Scenario.id,totalXp:150,updated_at:new Date().toISOString()})); playSfx('level');
}
function nearActionStation(el,t=100){return rectDistanceBetween(player,el)<t;}
function checkLevel4Interactions(){if(state.currentLevel!==4)return;const step=state.level4Step+1,el=document.querySelector(`.action-station[data-action-step="${step}"]`);if(!el)return;l4Message.textContent=nearActionStation(el,105)?`✨ Stasiun ${step} siap. Tekan E / Space / AKSI.`:`🛠️ Pergi ke stasiun ${step}: ${el.querySelector('b').textContent}.`;}
function interactLevel4(){const step=state.level4Step+1,el=document.querySelector(`.action-station[data-action-step="${step}"]`);if(!el||el.classList.contains('locked'))return false;if(nearActionStation(el,115)){openLevel4Quiz(step);return true;}return false;}
function openLevel4Quiz(step){const q=state.level4Scenario.steps[step];quizBadge.textContent=q.badge;quizTitle.textContent=q.title;quizCase.textContent=q.caseText;quizFeedback.textContent='';quizFeedback.className='quiz-feedback';quizOptions.innerHTML='';shuffledOptions(q.options).forEach(([label,correct],i)=>{const btn=document.createElement('button');btn.className='quiz-option';btn.textContent=String.fromCharCode(65+i)+'. '+label;btn.addEventListener('click',()=>{const buttons=[...quizOptions.querySelectorAll('.quiz-option')];buttons.forEach(b=>b.disabled=true);if(correct){btn.classList.add('correct');quizFeedback.textContent='✅ Pilihan tepat. Unsur rancangan berhasil ditambahkan.';quizFeedback.className='quiz-feedback good';state.level4Plan[step]=label;playSfx('correct');setTimeout(()=>completeLevel4Step(step),900);}else{btn.classList.add('wrong');state.mistakes++;quizFeedback.textContent='Belum paling tepat. Pilih jawaban yang paling konkret, realistis, dan dapat diamati.';quizFeedback.className='quiz-feedback bad';playSfx('wrong');setTimeout(()=>{buttons.forEach(b=>{b.disabled=false;b.classList.remove('wrong')});quizFeedback.textContent='Coba lagi.';},900);}});quizOptions.appendChild(btn);});quizModal.classList.remove('hidden');playSfx('interact');}
function completeLevel4Step(step){quizModal.classList.add('hidden');const cur=document.querySelector(`.action-station[data-action-step="${step}"]`);cur?.classList.add('completed');cur?.classList.remove('locked');if(cur?.querySelector('small'))cur.querySelector('small').textContent='✅ Selesai';state.level4Step=step;l4DoneText.textContent=String(step);const pct=Math.round(step/4*100);progressBar.style.width=pct+'%';progressText.textContent=pct+'%';state.totalXp=150+Math.round(step*25/4);xpText.textContent=state.totalXp+' XP';const next=document.querySelector(`.action-station[data-action-step="${step+1}"]`);if(next){next.classList.remove('locked');next.querySelector('small').textContent='Dekati lalu E / AKSI';}else{state.totalXp=175;xpText.textContent='175 XP';progressBar.style.width='100%';progressText.textContent='100%';setTimeout(completeAdventure,700);}}
function calculateFinalScore(){return Math.max(70,100-state.mistakes*4);}
function badgeFromScore(s){if(s>=95)return '🏅 Pancasila Pathfinder';if(s>=85)return '💡 Civic Problem Solver';if(s>=75)return '🔎 Value Detective';return '🌱 Pancasila Explorer';}
function completeAdventure(){const score=calculateFinalScore(),badge=badgeFromScore(score);missionTitle.textContent='PancaQuest Selesai!';missionText.textContent='Seluruh level selesai. Simpan hasil untuk kembali ke PancaPath.';finalBadge.textContent=badge;finalAdventureXp.textContent='175 XP';finalScore.textContent=score+' / 100';finalScenario.textContent=state.level4Scenario.title;finalAction.textContent=state.level4Plan[1]||'—';finalActor.textContent=state.level4Plan[2]||'—';finalTime.textContent=state.level4Plan[3]||'—';finalIndicator.textContent=state.level4Plan[4]||'—';const q={completed:true,xp:score,badge,adventureXp:175,mistakes:state.mistakes,scenario:state.level4Scenario.title,plan:{action:state.level4Plan[1],actor:state.level4Plan[2],time:state.level4Plan[3],indicator:state.level4Plan[4]},route:'pancaquest-adventure-v1.6',completed_at:new Date().toISOString()};localStorage.setItem('pancapath_quest',JSON.stringify(q));localStorage.setItem('pancaquest_adventure_progress',JSON.stringify({currentLevel:4,level1Completed:true,level2Completed:true,level3Completed:true,level4Completed:true,totalXp:175,normalizedScore:score,badge,updated_at:new Date().toISOString()}));adventureCompleteModal.classList.remove('hidden');playSfx('level');}
saveReturnBtn.addEventListener('click',()=>{const standalone=location.pathname.toLowerCase().includes('standalone');if(standalone){adventureCompleteModal.classList.add('hidden');openDialogue('✅ Data Tersimpan','Hasil PancaQuest sudah tersimpan di perangkat. Saat dipasang di PancaPath, tombol ini kembali ke halaman utama.');}else window.location.href='../index.html#mission';});
restartRandomBtn.addEventListener('click',()=>location.reload());

const soundBtn=document.getElementById('soundBtn');
soundBtn.addEventListener('click',e=>{
  state.audioEnabled=!state.audioEnabled;
  if(state.audioEnabled){
    e.currentTarget.textContent='🔊';
    ensureAudio();
    startBackgroundMusic();
    e.currentTarget.classList.add('sound-active');
    playSfx('interact');
  }else{
    e.currentTarget.textContent='🔇';
    stopBackgroundMusic();
    e.currentTarget.classList.remove('sound-active');
  }
});

closeQuizBtn.addEventListener('click',()=>quizModal.classList.add('hidden'));
actionBtn.addEventListener('click',interact);
document.getElementById('missionBtn').addEventListener('click',()=>openDialogue('Misi Saat Ini',missionText.textContent));

function togglePause(){
  state.paused=!state.paused;
  pauseModal.classList.toggle('hidden',!state.paused);
}
pauseBtn.addEventListener('click',togglePause);
resumeBtn.addEventListener('click',()=>{state.paused=false;pauseModal.classList.add('hidden')});
resetBtn.addEventListener('click',()=>{localStorage.removeItem('pancaquest_level1');localStorage.removeItem('pancaquest_adventure_progress');localStorage.removeItem('pancapath_quest');location.reload();});

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
document.getElementById('miniExpand').addEventListener('click',()=>openDialogue('Peta Sekolah','Urutan Level 1: Nadia → Perpustakaan → Pak Budi → Taman → Sekolah (Final Mission).'));

updatePlayer();
updateHUD();
updateNearPrompts();

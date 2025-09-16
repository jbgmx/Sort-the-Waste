(function () {
  const LEVEL_ITEMS = 10;
  const START_TIME = 60;
  const START_LIVES = 5;

  const bank = [
    { name: "Paper", emoji: "📄", bin: "recycling", tip: "Clean & dry paper goes in yellow." },
    { name: "Cardboard box", emoji: "📦", bin: "recycling", tip: "Flatten boxes before recycling." },
    { name: "Milk bottle (plastic)", emoji: "🥛", bin: "recycling", tip: "Rinse bottles; lids rules vary locally." },
    { name: "Can (aluminium)", emoji: "🥫", bin: "recycling", tip: "Empty & crush if you like." },
    { name: "Newspaper", emoji: "📰", bin: "recycling", tip: "Clean paper is perfect for recycling." },

    { name: "Apple core", emoji: "🍎", bin: "organics", tip: "Food scraps → green FOGO." },
    { name: "Banana peel", emoji: "🍌", bin: "organics", tip: "All food scraps belong in FOGO." },
    { name: "Garden leaves", emoji: "🍃", bin: "organics", tip: "Garden clippings are accepted." },
    { name: "Coffee grounds", emoji: "☕️", bin: "organics", tip: "Compostable: pop it in FOGO." },

    { name: "Glass bottle", emoji: "🍶", bin: "glass", tip: "Bottles & jars only (check lids rules)." },
    { name: "Jam jar", emoji: "🥫", bin: "glass", tip: "Rinse jars; keep metal lid out unless accepted." },

    { name: "Chip packet (soft plastic)", emoji: "🍟", bin: "landfill", tip: "Soft plastics are NOT in yellow curbside." },
    { name: "Broken toy", emoji: "🧸", bin: "landfill", tip: "Hard-to-recycle items go to red." },
    { name: "Tissue", emoji: "🧻", bin: "landfill", tip: "Used tissues go to landfill." },
    { name: "Ceramics", emoji: "🍽️", bin: "landfill", tip: "Ceramics are not glass recycling." },

    { name: "Pizza box (oily)", emoji: "🍕", bin: "organics", tip: "Soiled cardboard can go to FOGO in many councils." },
    { name: "Plastic cutlery", emoji: "🍴", bin: "landfill", tip: "Small rigid plastics often not recyclable curbside." },
    { name: "Metal lid", emoji: "🧢", bin: "recycling", tip: "Collect small lids in a can & crimp shut (check rules)." },
    { name: "Tea bag", emoji: "🫖", bin: "organics", tip: "Remove staple if present; compost the rest." },
  ];

  let level = 1, score = 0, lives = START_LIVES, timeLeft = START_TIME, timerId = null, carrying = null, activeItems = [];
  let playerName = localStorage.getItem("sir_name") || "Player";

  const elLevel = document.getElementById("level");
  const elScore = document.getElementById("score");
  const elLives = document.getElementById("lives");
  const elTimer = document.getElementById("timer");
  const tray = document.getElementById("itemsTray");
  const feedback = document.getElementById("feedback");
  const confetti = document.getElementById("confetti");
  const btnStart = document.getElementById("btnStart");
  const btnHow = document.getElementById("btnHow");
  const btnCloseHow = document.getElementById("btnCloseHow");
  const howDialog = document.getElementById("howDialog");
  const btnMute = document.getElementById("btnMute");
  const btnName = document.getElementById("btnName");
  const board = document.getElementById("leaderboard");
  let isMuted = false;

  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  function beep(type = "good") {
    if (isMuted) return;
    const o = audioCtx.createOscillator(); const g = audioCtx.createGain();
    o.connect(g); g.connect(audioCtx.destination);
    o.type = "sine"; o.frequency.value = type === "good" ? 880 : 180;
    g.gain.setValueAtTime(0.001, audioCtx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.3, audioCtx.currentTime + 0.01);
    g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
    o.start(); o.stop(audioCtx.currentTime + 0.16);
  }

  function randPick(arr, n) { const copy=[...arr], out=[]; while(copy.length && out.length<n){ out.push(copy.splice(Math.floor(Math.random()*copy.length),1)[0]); } return out; }
  function renderLives(){ elLives.textContent="❤".repeat(lives); }
  function setFeedback(msg, good=false){ feedback.className="feedback "+(good?"feedback--good":"feedback--bad"); feedback.textContent=msg; }
  function makeConfetti(){
    for (let i=0;i<30;i++){ const p=document.createElement("div"); p.className="confetti-piece";
      p.style.left=Math.random()*100+"vw";
      p.style.color=["#22c55e","#f59e0b","#ef4444","#a855f7","#2563eb"][Math.floor(Math.random()*5)];
      p.style.animationDelay=(Math.random()*0.3)+"s";
      confetti.appendChild(p); setTimeout(()=>p.remove(),1400);
    }
  }
  function resetTimer(){
    clearInterval(timerId);
    timeLeft = START_TIME - (level-1)*5; if (timeLeft<30) timeLeft=30;
    elTimer.textContent=timeLeft;
    timerId=setInterval(()=>{ timeLeft--; elTimer.textContent=timeLeft; if(timeLeft<=0){ clearInterval(timerId); endLevel(false, "⏳ Time's up!"); } },1000);
  }
  function drawItems(){
    tray.innerHTML=""; activeItems.forEach((it, idx)=>{
      const card=document.createElement("div");
      card.className="item"; card.draggable=true; card.role="listitem"; card.tabIndex=0;
      card.dataset.id=idx; card.dataset.bin=it.bin; card.setAttribute("aria-grabbed","false");
      card.setAttribute("aria-label", `${it.name}. ${it.emoji}. Drag to a bin.`);
      const emo=document.createElement("div"); emo.className="item__emoji"; emo.textContent=it.emoji;
      const name=document.createElement("div"); name.className="item__name"; name.textContent=it.name;
      const hint=document.createElement("div"); hint.className="item__hint"; hint.textContent="Pick me up!";
      card.appendChild(emo); card.appendChild(name); card.appendChild(hint);

      card.addEventListener("dragstart",(e)=>{ e.dataTransfer.setData("text/plain", JSON.stringify({idx, bin: it.bin})); e.dataTransfer.effectAllowed="move"; card.style.opacity="0.6"; card.setAttribute("aria-grabbed","true"); });
      card.addEventListener("dragend",()=>{ card.style.opacity="1"; card.setAttribute("aria-grabbed","false"); });

      card.addEventListener("keydown",(e)=>{ if(e.key==="Enter"){ if(!carrying){ carrying={idx, bin: it.bin}; hint.textContent="Carrying... Tab to a bin & Enter to drop"; card.setAttribute("aria-grabbed","true"); setFeedback(`Carrying: ${it.name}. Move to a bin and press Enter.`);} else { carrying=null; hint.textContent="Pick me up!"; card.setAttribute("aria-grabbed","false"); setFeedback("Cancelled carrying."); } }});

      tray.appendChild(card);
    });
  }
  function attachBinDnD(){
    document.querySelectorAll(".bin").forEach((binEl)=>{
      binEl.addEventListener("dragover",(e)=>{ e.preventDefault(); binEl.classList.add("drop-target"); });
      binEl.addEventListener("dragleave",()=> binEl.classList.remove("drop-target"));
      binEl.addEventListener("drop",(e)=>{ e.preventDefault(); binEl.classList.remove("drop-target"); const data=JSON.parse(e.dataTransfer.getData("text/plain")); handleDrop(data.idx, data.bin, binEl.dataset.bin); });
      binEl.addEventListener("keydown",(e)=>{ if(e.key==="Enter" && carrying){ handleDrop(carrying.idx, carrying.bin, binEl.dataset.bin); }});
    });
  }
  function labelFor(bin){ return bin==="recycling"?"Recycling (yellow lid)":bin==="organics"?"FOGO (green lid)":bin==="glass"?"Glass (purple lid)":"Landfill (red lid)"; }
  function removeItemCard(idx){ activeItems[idx]=null; const el=tray.querySelector(`.item[data-id="${idx}"]`); if(el) el.remove(); }

  async function endLevel(won, msg){
    clearInterval(timerId); setFeedback(msg, won);
    if (won) {
      makeConfetti();
      try {
        await submitScore();
        await loadLeaderboard();
      } catch(e){ console.warn("Score submit failed", e); }
      level += 1; document.getElementById("level").textContent = level;
      setTimeout(startLevel, 900);
    } else {
      level = 1; score = 0; lives = START_LIVES;
      document.getElementById("level").textContent = level;
      document.getElementById("score").textContent = score;
      renderLives();
      btnStart.disabled = false;
    }
  }

  function handleDrop(itemIdx, correctBin, droppedBin){
    if (activeItems[itemIdx]==null) return;
    const theItem = activeItems[itemIdx];
    if (droppedBin === correctBin){
      score += 10; document.getElementById("score").textContent = score;
      setFeedback(`✅ Correct! ${theItem.tip}`, true); beep("good");
      removeItemCard(itemIdx);
      if (document.querySelectorAll(".item").length === 0){ endLevel(true, "🎉 Great sorting!"); }
    } else {
      lives -= 1; renderLives(); setFeedback(`❌ Oops! "${theItem.name}" should go to ${labelFor(correctBin)}. ${theItem.tip}`, false); beep("bad");
      if (lives <= 0){ endLevel(false, "💥 Out of lives!"); }
    }
    carrying = null;
  }

  function startLevel(){
    btnStart.disabled = true;
    setFeedback("New level! Sort 10 items.");
    activeItems = randPick(bank, LEVEL_ITEMS);
    drawItems();
    resetTimer();
    attachBinDnD();
  }

  async function loadLeaderboard(){
    try{
      const res = await fetch("/api/leaderboard");
      const data = await res.json();
      board.innerHTML = "";
      data.forEach(s=>{
        const li = document.createElement("li");
        li.textContent = `${s.name}: ${s.score}`;
        board.appendChild(li);
      });
    }catch(e){
      console.warn("Leaderboard fetch failed", e);
    }
  }

  async function submitScore(){
    try{
      await fetch("/api/score", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ name: playerName || "Player", score })
      });
    }catch(e){ /* ignore for demo */ }
  }

  // Controls
  document.getElementById("btnStart").addEventListener("click", startLevel);
  document.getElementById("btnHow").addEventListener("click", ()=>{ const d=document.getElementById("howDialog"); if(!d.open) d.showModal(); });
  document.getElementById("btnCloseHow").addEventListener("click", ()=> document.getElementById("howDialog").close());
  document.getElementById("btnMute").addEventListener("click", (e)=>{ isMuted=!isMuted; e.currentTarget.setAttribute("aria-pressed", String(isMuted)); e.currentTarget.textContent=isMuted?"🔇 Muted":"🔊 Sound"; });
  document.getElementById("btnName").addEventListener("click", ()=>{
    const n = prompt("Enter your name (max 20 chars):", playerName);
    if (n!=null){ playerName = (n||"Player").trim().slice(0,20); localStorage.setItem("sir_name", playerName); }
  });

  // Initial
  renderLives(); setFeedback("Press Start to begin!");
  loadLeaderboard();
})();

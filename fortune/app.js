const ZODIACS = [
  { name: '牡羊座', emoji: '♈', dates: '3/21–4/19' },
  { name: '金牛座', emoji: '♉', dates: '4/20–5/20' },
  { name: '雙子座', emoji: '♊', dates: '5/21–6/20' },
  { name: '巨蟹座', emoji: '♋', dates: '6/21–7/22' },
  { name: '獅子座', emoji: '♌', dates: '7/23–8/22' },
  { name: '處女座', emoji: '♍', dates: '8/23–9/22' },
  { name: '天秤座', emoji: '♎', dates: '9/23–10/22' },
  { name: '天蠍座', emoji: '♏', dates: '10/23–11/21' },
  { name: '射手座', emoji: '♐', dates: '11/22–12/21' },
  { name: '摩羯座', emoji: '♑', dates: '12/22–1/19' },
  { name: '水瓶座', emoji: '♒', dates: '1/20–2/18' },
  { name: '雙魚座', emoji: '♓', dates: '2/19–3/20' },
];

let selectedZodiac = -1;
let currentFortune = null;

function getDayOfYear() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  return Math.floor((now - start) / 86400000);
}

function getFortune(zodiacIdx) {
  const day = getDayOfYear();
  const idx = (day * 3 + zodiacIdx * 17 + 7) % FORTUNE_POOL.length;
  return FORTUNE_POOL[idx];
}

function getEnergyInfo(energy) {
  if (energy >= 80) return { label: '氣勢如虹', emoji: '🔥', ctaText: '今天能量滿滿！用一瓶滴雞精開啟活力的一天 ☕' };
  if (energy >= 50) return { label: '充滿元氣', emoji: '✨', ctaText: '今天能量普通，給自己補充一下元氣吧 🌿' };
  return { label: '有點慵懶', emoji: '💤', ctaText: '今天能量偏低，讓仲安家幫你找回精神 💪' };
}

function getGreeting() {
  const h = new Date().getHours();
  if (h >= 3 && h < 12) return { text: '早安', emoji: '☀️' };
  if (h >= 12 && h < 18) return { text: '午安', emoji: '🌤️' };
  return { text: '晚安', emoji: '🌙' };
}

function formatDate() {
  const d = new Date();
  const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
  return `${d.getMonth() + 1} 月 ${d.getDate()} 日（週${weekdays[d.getDay()]}）`;
}

function getWeatherEmoji(code) {
  if (code === 0) return '☀️';
  if (code <= 3) return '⛅';
  if (code <= 48) return '🌫️';
  if (code <= 57) return '🌦️';
  if (code <= 67) return '🌧️';
  if (code <= 77) return '❄️';
  if (code <= 82) return '🌦️';
  return '⛈️';
}

async function loadWeather() {
  if (!navigator.geolocation) return;
  navigator.geolocation.getCurrentPosition(async (pos) => {
    try {
      const { latitude: lat, longitude: lon } = pos.coords;
      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&timezone=Asia%2FTaipei`
      );
      const data = await res.json();
      const temp = Math.round(data.current.temperature_2m);
      const emoji = getWeatherEmoji(data.current.weather_code);
      const el = document.getElementById('weather-display');
      el.textContent = `${emoji} ${temp}°C`;
      el.classList.remove('hidden');
    } catch {}
  }, () => {});
}

function initZodiacGrid() {
  const grid = document.getElementById('zodiac-grid');
  ZODIACS.forEach((z, i) => {
    const item = document.createElement('div');
    item.className = 'zodiac-item';
    item.innerHTML = `
      <span class="zodiac-emoji">${z.emoji}</span>
      <div class="zodiac-name">${z.name}</div>
      <div class="zodiac-dates">${z.dates}</div>
    `;
    item.addEventListener('click', () => {
      selectedZodiac = i;
      document.querySelectorAll('.zodiac-item').forEach((el, j) => {
        el.classList.toggle('selected', j === i);
      });
      checkReady();
    });
    grid.appendChild(item);
  });
}

function checkReady() {
  const name = document.getElementById('name-input').value.trim();
  document.getElementById('submit-btn').disabled = !(name && selectedZodiac >= 0);
}

function animateNumber(id, target) {
  const el = document.getElementById(id);
  let current = 0;
  const step = target / 40;
  const timer = setInterval(() => {
    current = Math.min(current + step, target);
    el.textContent = Math.round(current);
    if (current >= target) clearInterval(timer);
  }, 25);
}

function showResult() {
  const name = document.getElementById('name-input').value.trim();
  const zodiac = ZODIACS[selectedZodiac];
  currentFortune = getFortune(selectedZodiac);
  const info = getEnergyInfo(currentFortune.energy);

  document.getElementById('result-title').textContent = `${name}，今天的你⋯`;
  document.getElementById('result-zodiac-badge').textContent = `${zodiac.emoji} ${zodiac.name}`;

  animateNumber('energy-number', currentFortune.energy);
  document.getElementById('energy-label').textContent = `${info.emoji} ${info.label}`;

  const swatch = document.getElementById('lucky-color-swatch');
  swatch.style.background = currentFortune.colorHex;
  document.getElementById('lucky-color-name').textContent = currentFortune.luckyColor;
  document.getElementById('lucky-number').textContent = currentFortune.luckyNum;

  const text = currentFortune.text.replace(/\{name\}/g, name);
  document.getElementById('fortune-text').textContent = text;
  document.getElementById('cta-text').textContent = info.ctaText;

  // 能量等級改變背景主色
  const colors = {
    high: ['#f7971e', '#ffd200'],
    mid: ['#667eea', '#764ba2'],
    low: ['#485563', '#29323c'],
  };
  const key = currentFortune.energy >= 80 ? 'high' : currentFortune.energy >= 50 ? 'mid' : 'low';
  document.body.style.background = `linear-gradient(135deg, ${colors[key][0]}, ${colors[key][1]})`;

  document.getElementById('screen-input').classList.remove('active');
  document.getElementById('screen-result').classList.add('active');
  window.scrollTo(0, 0);

  // 儲存名字供分享用
  document.getElementById('share-btn').dataset.name = name;
  document.getElementById('share-btn').dataset.zodiac = zodiac.name;
}

function shareToLine() {
  const btn = document.getElementById('share-btn');
  const name = btn.dataset.name;
  const zodiacName = btn.dataset.zodiac;
  const info = getEnergyInfo(currentFortune.energy);
  const greeting = getGreeting();

  const refUrl = `https://aiwellnesstw.github.io/fortune/?ref=${encodeURIComponent(name)}`;
  const msg = `${name} ${info.label}地跟你說「${greeting.text}」${greeting.emoji}\n今日${zodiacName}能量 ${currentFortune.energy} 分 🔥\n你的運勢如何？👉 ${refUrl}`;

  window.open(`https://line.me/R/share?text=${encodeURIComponent(msg)}`, '_blank');
}

function checkReferral() {
  const ref = new URLSearchParams(location.search).get('ref');
  if (!ref) return;
  const banner = document.getElementById('referral-banner');
  banner.textContent = `👋 ${ref} 的今日運勢出爐，快來查查你的！`;
  banner.classList.remove('hidden');
}

// ── Canvas 早安圖 ────────────────────────────────────────────
function drawRoundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function wrapCanvasText(ctx, text, cx, startY, maxWidth, lineH) {
  let line = '';
  let y = startY;
  for (const char of text) {
    const test = line + char;
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, cx, y);
      line = char;
      y += lineH;
    } else {
      line = test;
    }
  }
  if (line) ctx.fillText(line, cx, y);
}

function generateFortuneCard() {
  const btn = document.getElementById('share-btn');
  const name = btn.dataset.name;
  const zodiacName = btn.dataset.zodiac;
  const zodiac = ZODIACS[selectedZodiac];
  const fortune = currentFortune;
  const info = getEnergyInfo(fortune.energy);
  const greeting = getGreeting();

  const d = new Date();
  const dateStr = `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
  const W = 1080, H = 1080;
  const PAD = 52, CX = W / 2;

  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  // 背景漸層
  const grad = ctx.createLinearGradient(0, 0, W, H);
  if (fortune.energy >= 80) {
    grad.addColorStop(0, '#f7971e'); grad.addColorStop(1, '#ffd200');
  } else if (fortune.energy >= 50) {
    grad.addColorStop(0, '#667eea'); grad.addColorStop(1, '#764ba2');
  } else {
    grad.addColorStop(0, '#485563'); grad.addColorStop(1, '#29323c');
  }
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // 白色卡片
  drawRoundRect(ctx, PAD, PAD, W - PAD * 2, H - PAD * 2, 40);
  ctx.fillStyle = 'rgba(255,255,255,0.96)';
  ctx.fill();

  const FONT = `-apple-system, BlinkMacSystemFont, 'PingFang TC', 'Noto Sans TC', sans-serif`;

  ctx.textAlign = 'center';

  // 問候語（大）
  ctx.font = `bold 90px ${FONT}`;
  ctx.fillStyle = '#333';
  ctx.fillText(`${greeting.emoji} ${greeting.text}！`, CX, 190);

  // 日期
  ctx.font = `38px ${FONT}`;
  ctx.fillStyle = '#999';
  ctx.fillText(dateStr, CX, 248);

  // 分隔線
  ctx.strokeStyle = '#eee';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(PAD + 40, 276); ctx.lineTo(W - PAD - 40, 276);
  ctx.stroke();

  // 星座 emoji + 名稱
  ctx.font = `46px ${FONT}`;
  ctx.fillStyle = '#999';
  ctx.fillText(`${zodiac.emoji} ${zodiacName}`, CX, 338);

  // 用戶名稱 + 運勢
  ctx.font = `bold 60px ${FONT}`;
  ctx.fillStyle = '#333';
  ctx.fillText(`${name} 的今日運勢`, CX, 413);

  // 能量數字（漸層）
  const numGrad = ctx.createLinearGradient(CX - 120, 430, CX + 120, 630);
  numGrad.addColorStop(0, '#667eea');
  numGrad.addColorStop(1, '#764ba2');
  ctx.fillStyle = numGrad;
  ctx.font = `bold 210px ${FONT}`;
  ctx.fillText(String(fortune.energy), CX, 615);

  ctx.font = `40px ${FONT}`;
  ctx.fillStyle = '#bbb';
  ctx.fillText('分', CX, 663);

  // 能量標籤
  ctx.font = `bold 52px ${FONT}`;
  ctx.fillStyle = '#5A4FCF';
  ctx.fillText(`${info.emoji} ${info.label}`, CX, 730);

  // 幸運色 + 數字
  const circleX = CX - 200, circleY = 793;
  ctx.beginPath();
  ctx.arc(circleX, circleY, 26, 0, Math.PI * 2);
  ctx.fillStyle = fortune.colorHex;
  ctx.fill();
  ctx.strokeStyle = '#ddd'; ctx.lineWidth = 3; ctx.stroke();

  ctx.font = `34px ${FONT}`;
  ctx.fillStyle = '#555';
  ctx.textAlign = 'left';
  ctx.fillText(`幸運色：${fortune.luckyColor}`, circleX + 40, 805);
  ctx.textAlign = 'right';
  ctx.fillText(`🎯 幸運數字 ${fortune.luckyNum}`, CX + 200, 805);

  // 分隔線
  ctx.strokeStyle = '#eee'; ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(PAD + 40, 830); ctx.lineTo(W - PAD - 40, 830);
  ctx.stroke();

  // 運勢文字
  ctx.textAlign = 'center';
  ctx.font = `33px ${FONT}`;
  ctx.fillStyle = '#555';
  const text = fortune.text.replace(/\{name\}/g, name);
  wrapCanvasText(ctx, text, CX, 880, W - PAD * 2 - 80, 47);

  // 底部浮水印
  ctx.font = `26px ${FONT}`;
  ctx.fillStyle = '#ccc';
  ctx.fillText('給自己好氣色 · aiwellnesstw.github.io/fortune', CX, 1018);

  return canvas;
}

function saveFortuneCard() {
  const canvas = generateFortuneCard();
  const dataUrl = canvas.toDataURL('image/png');
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

  if (isIOS) {
    // iOS 無法直接下載，顯示 overlay 讓用戶長按儲存
    document.getElementById('preview-img').src = dataUrl;
    document.getElementById('img-overlay').classList.remove('hidden');
  } else {
    const btn = document.getElementById('share-btn');
    const link = document.createElement('a');
    link.download = `今日運勢_${btn.dataset.name}.png`;
    link.href = dataUrl;
    link.click();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('date-display').textContent = formatDate();
  initZodiacGrid();
  loadWeather();
  checkReferral();

  document.getElementById('name-input').addEventListener('input', checkReady);
  document.getElementById('submit-btn').addEventListener('click', showResult);
  document.getElementById('back-btn').addEventListener('click', () => {
    document.getElementById('screen-result').classList.remove('active');
    document.getElementById('screen-input').classList.add('active');
    document.body.style.background = '';
    window.scrollTo(0, 0);
  });
  document.getElementById('share-btn').addEventListener('click', shareToLine);
  document.getElementById('save-btn').addEventListener('click', saveFortuneCard);
  document.getElementById('close-overlay').addEventListener('click', () => {
    document.getElementById('img-overlay').classList.add('hidden');
  });
});

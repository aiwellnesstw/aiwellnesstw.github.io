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
  if (energy >= 50) return { label: '穩健前行', emoji: '✨', ctaText: '今天能量普通，給自己補充一下元氣吧 🌿' };
  return { label: '需要補氣', emoji: '💤', ctaText: '今天能量偏低，仲安家幫你找回精神 💪' };
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
});

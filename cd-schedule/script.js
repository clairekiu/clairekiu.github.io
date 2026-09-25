const sheets = [
  '1gP9-BIX5PH87aWY19oHgglaPJZSXdFb0OO1GCO-sEJg',
  '179mV0rvWD8KEumPAuwLd5v9vvu3HnG5u4IRx0f6BLu4',
  '1fKpQaIpbIBeYDPewOzl5s07sZJ-ZCyr6FI7E1KDdJ-k',
  '1rk_f-xyBYQtMAmGVYeJR0V-T8mUsm_Z9SiXh7rKMPGs'
];
const dateInput = document.querySelector('#date');
const printers = document.querySelector('#printers');
const status = document.querySelector('#status');

function csv(text) {
  const rows = [[]]; let value = ''; let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '"' && text[i + 1] === '"') { value += char; i++; }
    else if (char === '"') quoted = !quoted;
    else if (char === ',' && !quoted) { rows.at(-1).push(value); value = ''; }
    else if ((char === '\n' || char === '\r') && !quoted) { if (char === '\r' && text[i + 1] === '\n') i++; rows.at(-1).push(value); rows.push([]); value = ''; }
    else value += char;
  }
  if (value || rows.at(-1).length) rows.at(-1).push(value); else rows.pop();
  return rows;
}
console.assert(csv('"a,b",c')[0][0] === 'a,b', 'CSV parser failed');

function parseKoreanDate(value) {
  const m = value.match(/(\d{4})\.\s*(\d+)\.\s*(\d+)\.\s*(오전|오후)\s*(\d+):(\d+)/);
  if (!m) return null;
  let hour = +m[5] % 12 + (m[4] === '오후' ? 12 : 0);
  return new Date(+m[1], +m[2] - 1, +m[3], hour, +m[6]);
}

function dateKey(date) { return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`; }
function minutes(date) { return date.getHours() * 60 + date.getMinutes(); }

function draw(rowsByPrinter) {
  printers.innerHTML = '';
  rowsByPrinter.forEach((rows, index) => {
    const column = document.createElement('article'); column.className = 'printer';
    column.innerHTML = `<div class="printer-title">프린터 ${index + 1}</div><div class="track"></div>`;
    const track = column.querySelector('.track');
    rows.forEach(({ name, start, end }) => {
      const top = Math.max(minutes(start), 540), bottom = Math.min(minutes(end), 1080);
      if (bottom <= top) return;
      const booking = document.createElement('div'); booking.className = 'booking'; booking.textContent = name;
      booking.style.top = `${(top - 540) / 5.4}%`; booking.style.height = `${(bottom - top) / 5.4}%`;
      booking.title = `${name}: ${start.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}–${end.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}`;
      track.append(booking);
    });
    printers.append(column);
  });
}

async function load() {
  status.textContent = '예약 정보를 불러오는 중…';
  const selected = dateInput.value;
  try {
    const lists = await Promise.all(sheets.map(async id => {
      const url = `https://docs.google.com/spreadsheets/d/${id}/export?format=csv`;
      const [head, ...rows] = csv(await (await fetch(url)).text());
      const column = key => head.findIndex(x => x.trim().toLowerCase() === key);
      const name = column('name'), start = column('time of use - start'), end = column('time of use - end');
      return rows.map(row => ({ name: row[name], start: parseKoreanDate(row[start] || ''), end: parseKoreanDate(row[end] || '') })).filter(row => row.name && row.start && row.end && dateKey(row.start) === selected);
    }));
    draw(lists); status.textContent = `${selected} 예약 현황 · 09:00–18:00`;
  } catch (error) { draw([[], [], [], []]); status.textContent = '예약 정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.'; }
}

document.querySelector('#times').innerHTML = Array.from({ length: 9 }, (_, i) => `<span>${String(i + 9).padStart(2, '0')}:00</span>`).join('');
dateInput.value = dateKey(new Date());
dateInput.addEventListener('change', load);
load();

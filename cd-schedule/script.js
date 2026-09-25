const sheets = [
  '1gP9-BIX5PH87aWY19oHgglaPJZSXdFb0OO1GCO-sEJg',
  '179mV0rvWD8KEumPAuwLd5v9vvu3HnG5u4IRx0f6BLu4',
  '1fKpQaIpbIBeYDPewOzl5s07sZJ-ZCyr6FI7E1KDdJ-k',
  '1rk_f-xyBYQtMAmGVYeJR0V-T8mUsm_Z9SiXh7rKMPGs'
];
const dateInput = document.querySelector('#date');
const printers = document.querySelector('#printers');

function parseDate(value) {
  const m = value.match(/Date\((\d+),(\d+),(\d+),(\d+),(\d+)/);
  if (!m) return null;
  return new Date(+m[1], +m[2], +m[3], +m[4], +m[5]);
}
console.assert(parseDate('Date(2026,8,25,14,0,0)').getHours() === 14, 'Date parser failed');
function isCancelled(row) { return row.some(cell => String(cell?.v || '').trim() === '취소'); }
console.assert(isCancelled([{ v: '취소' }]), 'Cancellation filter failed');

function dateKey(date) { return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`; }
function minutes(date) { return date.getHours() * 60 + date.getMinutes(); }
function range({ start, end }) { const first = minutes(start); return [first, first + (end - start) / 60000]; }
console.assert(range({ start: new Date(2026, 8, 25, 20), end: new Date(2026, 8, 26) })[1] === 1440, 'Overnight range failed');
function subtract(booking, cancellation) {
  if (cancellation.start >= booking.end || cancellation.end <= booking.start) return [booking];
  return [
    cancellation.start > booking.start && { ...booking, end: cancellation.start },
    cancellation.end < booking.end && { ...booking, start: cancellation.end }
  ].filter(Boolean);
}
console.assert(subtract({ start: new Date(0), end: new Date(150) }, { start: new Date(0), end: new Date(100) })[0].start.getTime() === 100, 'Cancellation range failed');

function readSheet(id) {
  return new Promise((resolve, reject) => {
    const callback = `printerSchedule${Math.random().toString(36).slice(2)}`;
    const script = document.createElement('script');
    const done = () => { delete window[callback]; script.remove(); };
    window[callback] = response => {
      done();
      if (response.status !== 'ok') return reject(new Error(response.errors?.[0]?.detailed_message));
      const columns = response.table.cols.map(col => col.label.trim().toLowerCase());
      const column = name => columns.indexOf(name);
      const name = column('name'), start = column('time of use - start'), end = column('time of use - end');
      const bookings = response.table.rows.map(row => row.c).map(row => ({ name: String(row[name]?.v || '').trim(), start: parseDate(row[start]?.v || ''), end: parseDate(row[end]?.v || ''), cancelled: isCancelled(row) }));
      const cancellations = bookings.filter(row => row.cancelled);
      resolve(bookings.filter(row => !row.cancelled).flatMap(booking => cancellations.filter(cancel => cancel.name === booking.name).reduce((parts, cancel) => parts.flatMap(part => subtract(part, cancel)), [booking])));
    };
    script.onerror = () => { done(); reject(new Error('Sheet unavailable')); };
    script.src = `https://docs.google.com/spreadsheets/d/${id}/gviz/tq?tqx=out:json;responseHandler:${callback}`;
    document.head.append(script);
  });
}

function draw(rowsByPrinter) {
  printers.innerHTML = '';
  rowsByPrinter.forEach((rows, index) => {
    const column = document.createElement('article'); column.className = 'printer';
    column.innerHTML = `<div class="printer-title">프린터 ${index + 1}</div><div class="track"></div>`;
    const track = column.querySelector('.track');
    rows.forEach(({ name, start, end }) => {
      const [first, last] = range({ start, end });
      const top = Math.max(first, 540), bottom = Math.min(last, 1440);
      if (bottom <= top) return;
      const booking = document.createElement('div'); booking.className = 'booking'; booking.textContent = name;
      booking.style.top = `${(top - 540) / 9}%`; booking.style.height = `${(bottom - top) / 9}%`;
      booking.title = `${name}: ${start.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}–${end.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}`;
      track.append(booking);
    });
    const overlaps = new Set();
    rows.forEach((row, index) => rows.slice(index + 1).forEach(other => {
      const [rowStart, rowEnd] = range(row), [otherStart, otherEnd] = range(other);
      const start = Math.max(rowStart, otherStart, 540);
      const end = Math.min(rowEnd, otherEnd, 1440);
      if (end > start) overlaps.add(`${start}|${end}`);
    }));
    overlaps.forEach(range => {
      const [start, end] = range.split('|').map(Number);
      const overlap = document.createElement('div'); overlap.className = 'overlap';
      overlap.style.top = `${(start - 540) / 9}%`; overlap.style.height = `${(end - start) / 9}%`;
      track.append(overlap);
    });
    printers.append(column);
  });
}

async function load() {
  const selected = dateInput.value;
  try {
    const lists = (await Promise.all(sheets.map(readSheet))).map(rows => rows.filter(row => row.name && row.start && row.end && dateKey(row.start) === selected));
    draw(lists);
  } catch (error) { draw([[], [], [], []]); }
}

document.querySelector('#times').innerHTML = Array.from({ length: 15 }, (_, i) => `<span>${String(i + 9).padStart(2, '0')}:00</span>`).join('');
dateInput.value = dateKey(new Date());
dateInput.addEventListener('change', load);
load();

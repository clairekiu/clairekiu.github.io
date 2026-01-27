// ===== 여기에 본인 생일 넣기 (월: 1-12, 일: 1-31) =====
const BIRTHDAY_MONTH = 12;  // 1 = 1월, 12 = 12월
const BIRTHDAY_DAY = 7;    // 1 ~ 31

(function () {
  const form = document.getElementById('birthday-quiz-form');
  const monthInput = document.getElementById('birthday-month');
  const dayInput = document.getElementById('birthday-day');
  const resultEl = document.getElementById('quiz-result');
  const submitBtn = document.getElementById('quiz-submit');

  // 각 월의 최대 일수
  const daysInMonth = [0, 31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

  function getOrdinalDay(month, day) {
    let sum = 0;
    for (let m = 1; m < month; m++) sum += daysInMonth[m];
    return sum + day;
  }

  function showResult(message, isSuccess) {
    resultEl.textContent = message;
    resultEl.className = 'quiz-result ' + (isSuccess ? 'success' : '');
    resultEl.hidden = false;
  }

  function validate(month, day) {
    const m = parseInt(month, 10);
    const d = parseInt(day, 10);
    if (isNaN(m) || m < 1 || m > 12) return '월은 1~12 사이로 입력해 주세요.';
    if (isNaN(d) || d < 1 || d > 31) return '일은 1~31 사이로 입력해 주세요.';
    if (d > daysInMonth[m]) return m + '월에는 ' + daysInMonth[m] + '일까지 있어요.';
    return null;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const month = monthInput.value.trim();
    const day = dayInput.value.trim();

    const err = validate(month, day);
    if (err) {
      showResult(err, false);
      return;
    }

    const m = parseInt(month, 10);
    const d = parseInt(day, 10);

    if (m === BIRTHDAY_MONTH && d === BIRTHDAY_DAY) {
      showResult('정답!', true);
      return;
    }

    const answerOrdinal = getOrdinalDay(BIRTHDAY_MONTH, BIRTHDAY_DAY);
    const guessOrdinal = getOrdinalDay(m, d);
    const diff = guessOrdinal - answerOrdinal;

    if (Math.abs(diff) <= 7) {
      showResult(diff > 0 ? '조금 더 빨라요!' : '조금 더 늦어요!', false);
    } else if (Math.abs(diff) <= 30) {
      showResult(diff > 0 ? '아직 빨라요. 조금만 더 뒤로!' : '좀 더 앞으로!', false);
    } else {
      showResult('틀렸어요. 다시 한 번 맞춰 보세요!', false);
    }
  });

  // 월/일 숫자만
  [monthInput, dayInput].forEach(function (input) {
    input.addEventListener('input', function () {
      this.value = this.value.replace(/[^0-9]/g, '');
    });
  });
})();

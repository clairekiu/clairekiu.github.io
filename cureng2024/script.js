let jsonData = [];
let correctWords = [];
let reviewedWords = [];

// JSON 파일을 fetch로 불러오기
function loadJSON() {
    fetch('data.json')
        .then(response => response.json())
        .then(data => {
            jsonData = data;  // 데이터를 전역 변수에 저장
            displayWordList(data);   // Word List는 셔플 없이 로드
            displayQuestions(shuffleArray([...data]));  // Test 탭 데이터는 셔플 후 로드
        })
        .catch(error => console.error('Error loading JSON:', error));
}

// 맞은 단어 제외한 문제를 다시 학습하는 함수
function reviewQuestionsWithoutCorrect() {
    const incorrectWords = jsonData.filter(item => 
        !correctWords.some(correctItem => correctItem.word === item.word && correctItem.sentence === item.sentence)
    );

    if (incorrectWords.length === 0) {
        alert("모두 맞았습니다. 표시할 단어가 없습니다.");
        return;
    }

    const questionsContainer = document.getElementById("questions");
    questionsContainer.innerHTML = ''; // 기존 질문 삭제
    displayQuestions(incorrectWords);   // 맞은 단어 제외한 단어만 표시
}

// 틀린 단어(정답을 확인한 단어)만 다시 학습하는 함수
function reviewQuestions() {
    if (reviewedWords.length === 0) {
        alert("틀린 단어가 없습니다. 표시할 단어가 없습니다.");
        return;
    }

    const questionsContainer = document.getElementById("questions");
    questionsContainer.innerHTML = ''; // 기존 질문 삭제
    displayQuestions(reviewedWords);   // 틀린 단어만 표시
    reviewedWords = [];
}

// 문제를 셔플하는 함수
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// 중괄호로 감싸진 부분을 찾아서 빈칸을 만듦
function replaceBracesWithInput(sentence, index) {
    return sentence.replace(/{(.*?)}/g, function(match, p1) {
        // 빈칸 처리: 중괄호 안의 단어 길이에 맞춰 input의 size 지정
        return `<input type="text" id="input${index}" size="${p1.length}" data-answer="${p1}" />`;
    });
}

// 질문을 표시하는 함수 (Test 탭)
function displayQuestions(jsonData) {
    // 셔플된 데이터
    const shuffledData = shuffleArray(jsonData);
    const questionsContainer = document.getElementById("questions");

    // 남은 단어 수 업데이트
    const remainingWordsCounter = document.getElementById("remainingWords");
    remainingWordsCounter.textContent = shuffledData.length; // 남은 단어 수를 셔플된 데이터의 길이로 설정

    shuffledData.forEach((item, index) => {
        const sentence = item.sentence;

        // 중괄호로 감싸진 단어를 빈칸으로 변환
        const sentenceWithInput = replaceBracesWithInput(sentence, index);

        // 질문을 담을 div 요소 생성
        const questionDiv = document.createElement("div");
        questionDiv.className = "question";
        questionDiv.innerHTML = `${sentenceWithInput} <br>`; // 문장과 버튼 사이에 간격 추가
        questionsContainer.appendChild(questionDiv);

        // "Show Answer" 버튼 생성
        const showAnswerBtn = document.createElement("button");
        showAnswerBtn.className = "show-answer-btn";
        showAnswerBtn.innerText = "Show Answer";
        questionDiv.appendChild(showAnswerBtn);

        // 피드백 div
        const feedback = document.createElement("div");
        feedback.className = "feedback";
        questionDiv.appendChild(feedback);

        // 입력 필드와 정답 확인을 위한 이벤트 추가
        const inputField = document.getElementById(`input${index}`);

        // 사용자가 입력할 때 정답 확인
        const correctAnswer = inputField.getAttribute('data-answer');
        inputField.addEventListener("input", function () {
            const userInput = inputField.value.trim();

            if (userInput === correctAnswer) {
                feedback.innerHTML = `Correct! <br> Meaning: ${item.meaning}`;
                feedback.style.color = "green";

                // 남은 단어 수 감소
                const currentCount = parseInt(remainingWordsCounter.textContent, 10);
                remainingWordsCounter.textContent = currentCount - 1;

                if (!correctWords.some(wordItem => wordItem.word === item.word && wordItem.sentence === item.sentence)) {
                    correctWords.push(item);
                }
            } else if (userInput !== "") {
                feedback.innerHTML = `<span class="feedback">Incorrect`;
                feedback.style.color = "red";
            } else {
                feedback.innerHTML = "";
            }
        });

        // "Show Answer" 버튼 클릭 시 정답 표시
        showAnswerBtn.addEventListener("click", function () {
            if (showAnswerBtn.innerText === "Show Answer") {
                feedback.innerHTML = `<span class="feedback">Correct answer: ${correctAnswer}</span> <br> Meaning: ${item.meaning}`;
                showAnswerBtn.innerText = "Close Answer";
                
                if (!reviewedWords.some(wordItem => wordItem.word === item.word && wordItem.sentence === item.sentence)) {
                    reviewedWords.push(item);
                }
                
                // Close Answer 버튼에 클래스 추가
                showAnswerBtn.classList.add("close-answer-btn");
        
            } else {
                feedback.innerHTML = ""; // 정답 숨기기
                showAnswerBtn.innerText = "Show Answer";
        
                // 원래 Show Answer 버튼 스타일로 복귀
                showAnswerBtn.classList.remove("close-answer-btn");
            }
        });
    });
}

// 검색 기능을 구현하는 함수
function filterWordList() {
    const searchTerm = document.getElementById("searchInput").value.toLowerCase();
    const wordItems = document.querySelectorAll(".word-item");
    
    wordItems.forEach(item => {
        const word = item.querySelector("strong").innerText.toLowerCase();
        if (word.includes(searchTerm)) {
            item.style.display = "";
        } else {
            item.style.display = "none";
        }
    });
}

// 단어 목록을 표시하는 함수 (Word List 탭 - 셔플 안 함)
function displayWordList(jsonData) {
    const wordListContainer = document.getElementById("wordListContainer");

    // 단어와 뜻을 기준으로 예문을 병합할 객체 생성
    const wordMap = {};

    // 단어를 순서대로 병합
    jsonData.forEach((item) => {
        const key = item.word + "|" + item.meaning;  // 단어와 뜻을 키로 사용

        // 이미 해당 단어가 존재하면 예문 추가, 없으면 새로 생성
        if (wordMap[key]) {
            wordMap[key].sentences.push(item.sentence);
        } else {
            wordMap[key] = {
                word: item.word,
                meaning: item.meaning,
                sentences: [item.sentence]
            };
        }
    });

    // 병합된 단어 목록을 Word List에 표시
    Object.values(wordMap).forEach((item) => {
        const wordDiv = document.createElement("div");
        wordDiv.className = "word-item";

        // 중괄호로 감싸진 부분을 볼드체로 변환
        const formattedSentences = item.sentences.map(sentence => {
            return `<li>${sentence.replace(/{(.*?)}/g, '<strong>$1</strong>')}</li>`;
        }).join("");

        wordDiv.innerHTML = `
            <strong>${item.word}</strong>: ${item.meaning}
            <br/>
            <ul>${formattedSentences}</ul>
        `;
        wordListContainer.appendChild(wordDiv);
    });

    // 검색어가 입력될 때마다 필터링 동작
    document.getElementById("searchInput").addEventListener("input", filterWordList);
}

// 탭 전환 기능
function openTab(evt, tabName) {
    var i, tabcontent, tablinks;

    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";
}

// 페이지 로드 시 Word List 탭을 기본으로 열기
window.onload = function() {
    loadJSON();
    document.getElementById("WordList").style.display = "block"; // Word List 탭을 기본으로 열기
    document.getElementsByClassName("tablinks")[0].className += " active"; // Word List 탭 버튼 활성화
};
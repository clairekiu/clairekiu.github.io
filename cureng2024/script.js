// JSON 파일을 fetch로 불러오기
function loadJSON() {
    fetch('data.json')
        .then(response => response.json())
        .then(data => {
            displayQuestions(data);
        })
        .catch(error => console.error('Error loading JSON:', error));
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

// 질문을 표시하는 함수
function displayQuestions(jsonData) {
    const shuffledData = shuffleArray(jsonData);
    const questionsContainer = document.getElementById("questions");

    shuffledData.forEach((item, index) => {
        const sentence = item.sentence;

        // 중괄호로 감싸진 단어를 빈칸으로 변환
        const sentenceWithInput = replaceBracesWithInput(sentence, index);

        // 질문을 담을 div 요소 생성
        const questionDiv = document.createElement("div");
        questionDiv.className = "question";
        questionDiv.innerHTML = `${sentenceWithInput}`;
        questionsContainer.appendChild(questionDiv);

        // 입력 필드와 정답 확인을 위한 이벤트 추가
        const inputField = document.getElementById(`input${index}`);
        const feedback = document.createElement("div");
        feedback.className = "feedback";
        questionDiv.appendChild(feedback);

        // "Show Answer" 버튼 추가
        const showAnswerButton = document.createElement("button");
        showAnswerButton.textContent = "Show Answer";
        questionDiv.appendChild(showAnswerButton);

        // "Show Answer" 버튼 클릭 시 정답 표시
        showAnswerButton.addEventListener("click", function () {
            feedback.innerHTML = `Answer: ${inputField.getAttribute('data-answer')}, Meaning: ${item.meaning}`;
            feedback.style.color = "blue";
        });

        // 입력 시 정답 여부 확인
        inputField.addEventListener("input", function () {
            const userInput = inputField.value.trim();
            const correctAnswer = inputField.getAttribute('data-answer');

            if (userInput === correctAnswer) {
                feedback.innerHTML = `Correct! Meaning: ${item.meaning}`;
                feedback.style.color = "green";
            } else if (userInput !== "") {
                feedback.innerHTML = "Incorrect";
                feedback.style.color = "red";
            } else {
                feedback.innerHTML = "";
            }
        });
    });
}

// 페이지 로드 시 JSON 파일 로드
window.onload = loadJSON;
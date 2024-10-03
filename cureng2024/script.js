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
function replaceBracesWithInput(sentence, index, correctWord) {
    return sentence.replace(/{(.*?)}/, `<input type="text" id="input${index}" size="${correctWord.length}" />`);
}

// 질문을 표시하는 함수
function displayQuestions(jsonData) {
    const shuffledData = shuffleArray(jsonData);
    const questionsContainer = document.getElementById("questions");

    shuffledData.forEach((item, index) => {
        const { sentence } = item;
        const correctWord = sentence.match(/{(.*?)}/)[1]; // 중괄호 안에 있는 정답 단어 추출
        const sentenceWithInput = replaceBracesWithInput(sentence, index, correctWord);

        const questionDiv = document.createElement("div");
        questionDiv.className = "question";
        questionDiv.innerHTML = `${sentenceWithInput}`;
        questionsContainer.appendChild(questionDiv);

        const inputField = document.getElementById(`input${index}`);
        const feedback = document.createElement("div");
        feedback.className = "feedback";
        questionDiv.appendChild(feedback);

        inputField.addEventListener("input", function() {
            const userInput = inputField.value.trim();
            if (userInput === correctWord) {
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
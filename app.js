let words = [];
let currentIndex = 0;
const wordElement = document.getElementById("word");
const definitionTextElement = document.getElementById("definitionText");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const memorizedBtn = document.getElementById("memorizedBtn");
const favoriteCheckbox = document.getElementById("favoriteCheckbox");
const cardElement = document.getElementById("card");

// 从浏览器本地存储加载熟记和收藏数据
let memorizedWords = JSON.parse(localStorage.getItem('memorizedWords')) || [];
let favoriteWords = JSON.parse(localStorage.getItem('favoriteWords')) || [];

function fetchWords() {
  fetch('words.json')
    .then(response => response.json())
    .then(data => {
      words = Object.values(data); // 将对象转为数组
      updateWordCard();
    })
    .catch(error => console.error('Error fetching words:', error));
}

function updateWordCard() {
  // 触发卡片动画
  cardElement.classList.remove('opacity-0', 'transform', 'translate-y-10');
  cardElement.classList.add('opacity-100', 'transform', 'translate-y-0', 'transition-all', 'duration-500');
  definitionTextElement.classList.remove('opacity-100');
  definitionTextElement.classList.add('opacity-0');
  const word = words[currentIndex];
  wordElement.textContent = word.title;
  definitionTextElement.textContent = word.text;
  // 更新熟记按钮的样式
  if (memorizedWords.includes(wordElement.textContent)) {
    memorizedBtn.classList.add('btn-success');
  } else {
    memorizedBtn.classList.remove('btn-success');
  }

  // 更新收藏按钮的状态
  if (favoriteWords.includes(wordElement.textContent)) {
    favoriteCheckbox.checked = true;
  } else {
    favoriteCheckbox.checked = false;
  }
}


function showNextWord() {
  if (currentIndex < words.length - 1) {
    currentIndex++;
    updateWordCard();
    // 给上下按钮添加动画
    nextBtn.classList.remove('scale-100');
    nextBtn.classList.add('scale-90', 'transition-transform', 'duration-300');
    setTimeout(() => nextBtn.classList.remove('scale-90'), 300);
  }
}

function showPrevWord() {
  if (currentIndex > 0) {
    currentIndex--;
    updateWordCard();
    // 给上下按钮添加动画
    prevBtn.classList.remove('scale-100');
    prevBtn.classList.add('scale-90', 'transition-transform', 'duration-300');
    setTimeout(() => prevBtn.classList.remove('scale-90'), 300);
  }
}

function toggleDefinition() {
  definitionTextElement.classList.toggle('opacity-100');
  definitionTextElement.classList.toggle('opacity-0');
}

// 标记熟记当前单词
memorizedBtn.addEventListener("click", () => {
  const word = words[currentIndex].title;
  if (memorizedWords.includes(word)) {
    memorizedWords = memorizedWords.filter(item => item !== word);
  } else {
    memorizedWords.push(word);
  }
  localStorage.setItem('memorizedWords', JSON.stringify(memorizedWords));
  updateWordCard(); // 更新按钮的显示状态
});

// 标记收藏当前单词
favoriteCheckbox.addEventListener("change", () => {
  const word = words[currentIndex].title;
  if (favoriteCheckbox.checked) {
    if (!favoriteWords.includes(word)) {
      favoriteWords.push(word);
    }
  } else {
    favoriteWords = favoriteWords.filter(item => item !== word);
  }
  localStorage.setItem('favoriteWords', JSON.stringify(favoriteWords));
  updateWordCard(); // 更新按钮的显示状态
});

// 导出数据
document.getElementById("exportBtn").addEventListener("click", () => {
  const data = {
    memorizedWords: memorizedWords,
    favoriteWords: favoriteWords
  };
  
  // 转换数据为 JSON 格式
  const dataStr = JSON.stringify(data);

  // 创建一个 Blob 对象并生成下载链接
  const blob = new Blob([dataStr], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'wordData.json';
  
  // 触发下载
  link.click();
});

// 导入数据
document.getElementById("importBtn").addEventListener("click", () => {
  // 创建一个文件选择器来选择 JSON 文件
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  
  input.addEventListener('change', event => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      
      reader.onload = function(e) {
        try {
          // 读取文件内容并解析 JSON 数据
          const importedData = JSON.parse(e.target.result);
          
          // 更新 localStorage 中的内容
          memorizedWords = importedData.memorizedWords || [];
          favoriteWords = importedData.favoriteWords || [];
          localStorage.setItem('memorizedWords', JSON.stringify(memorizedWords));
          localStorage.setItem('favoriteWords', JSON.stringify(favoriteWords));

          // 更新页面中的单词卡片
          updateWordCard();
        } catch (error) {
          alert("文件格式错误，请上传正确的 JSON 文件");
        }
      };

      // 读取选中的文件
      reader.readAsText(file);
    }
  });

  // 触发文件选择框
  input.click();
});


// Initialize
fetchWords();

prevBtn.addEventListener("click", showPrevWord);
nextBtn.addEventListener("click", showNextWord);

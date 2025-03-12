
let words = [];
let currentIndex = 0;
const wordElement = document.getElementById("word");
const definitionTextElement = document.getElementById("definitionText");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const memorizedBtn = document.getElementById("memorizedBtn");
const favoriteCheckbox = document.getElementById("favoriteCheckbox");
const cardElement = document.getElementById("card");

const generateExampleBtn = document.getElementById("generateExampleBtn");
const exampleSentenceElement = document.createElement("p");
exampleSentenceElement.id = "exampleSentence";
exampleSentenceElement.className = "mt-4 text-gray-600 italic";
cardElement.appendChild(exampleSentenceElement);

// 从浏览器本地存储加载熟记和收藏数据
let memorizedWords = JSON.parse(localStorage.getItem('memorizedWords')) || [];
let favoriteWords = JSON.parse(localStorage.getItem('favoriteWords')) || [];

// 加载主题并应用
document.addEventListener('DOMContentLoaded', function() {
  // 从 localStorage 获取已保存的主题
  const savedTheme = localStorage.getItem('theme') || 'emerald';  // 默认主题是 emerald
  document.body.setAttribute('data-theme', savedTheme);
  document.getElementById('themeSelect').value = savedTheme;
});

function fetchWords() {
  fetch('words.json')
    .then(response => response.json())
    .then(data => {
      words = Object.values(data); // 将对象转为数组
      // 查找下一个未熟记的单词
      while (memorizedWords.includes(words[currentIndex].title) && currentIndex < words.length - 1) {
        currentIndex++;
      }
      updateWordCard();
    })
    .catch(error => console.error('Error fetching words:', error));
}

function updateWordCard() {
  exampleSentenceElement.textContent=''
  generateExampleBtn.textContent = "AI生成";

  // 触发卡片动画
  cardElement.classList.remove('opacity-0', 'transform', 'translate-y-10');
  cardElement.classList.add('opacity-100', 'transform', 'translate-y-0', 'transition-all', 'duration-500');
  definitionTextElement.classList.remove('opacity-100');
  definitionTextElement.classList.add('opacity-0');
  
  if (currentIndex !== -1) {
    generateExampleBtn.classList.remove("hidden");
    const word = words[currentIndex];
    wordElement.textContent = word.title;
    definitionTextElement.textContent = word.text;
    console.log(definitionTextElement.textContent)
  }

  
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

// 为生成例句按钮添加点击事件
generateExampleBtn.addEventListener("click", () => {

  generateExampleBtn.textContent = "重新生成";

  // 获取当前单词
  const word = words[currentIndex].title;

  // 调用AI接口生成例句
  generateExampleSentence(word);
});

// 更新生成例句的函数
function generateExampleSentence(word) {

  // 从 localStorage 获取 API 密钥和模型名称
  const apiKey = localStorage.getItem('apiKey');
  const modelName = localStorage.getItem('modelName');

  // 如果没有找到 API 密钥或模型名称，提示用户
  if (!apiKey || !modelName) {
    exampleSentenceElement.textContent = "未找到API密钥或模型名称，请在设置中输入相关信息。";
    return;
  }

  // 初始化计数器和句点
  let dotCount = 1;
  const loadingText = "AI生成中";
  exampleSentenceElement.textContent = loadingText + ".".repeat(dotCount);
  exampleSentenceElement.classList.add("text-gray-400"); // 给“AI生成中”添加灰色文本样式
  
  // 使用定时器动态增加句点
  const dotInterval = setInterval(() => {
    dotCount = (dotCount % 3) + 1;  // 控制句点数量循环在1至3之间
    exampleSentenceElement.textContent = loadingText + ".".repeat(dotCount);
  }, 500);  // 每500ms更新一次

  // 调用API生成例句
  fetch("https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `${apiKey}`,  // 使用从 localStorage 获取的 API 密钥
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      "model": modelName,  // 使用从 localStorage 获取的模型名称
      "messages": [{ "role": "user", "content": `请为 ${word} 这个单词提供1个英语解释,造1个例句,提供1个近义词和1个反义词,格式为 'Explain:sentence <br> Example:sentence <br> Synonym:word <br> Antonym:word'，不要有多余的回答，且不允许出现中文` }],
      "stream": false,
      "temperature": 1.3
    })
  })
  .then(response => response.json())
  .then(data => {
    clearInterval(dotInterval);  // 停止句点变化
    if (data.choices && data.choices.length > 0) {
      exampleSentenceElement.innerHTML = `${data.choices[0].message.content}`;
      exampleSentenceElement.classList.remove("text-gray-400"); // 移除灰色文本样式
    } else {
      exampleSentenceElement.textContent = "无法获取例句";
      exampleSentenceElement.classList.remove("text-gray-400");
    }
  })
  .catch(error => {
    clearInterval(dotInterval);  // 停止句点变化
    console.error("Error generating example sentence:", error);
    exampleSentenceElement.textContent = "获取例句失败";
    exampleSentenceElement.classList.remove("text-gray-400");
  });
}


function showNextWord() {
  if (currentIndex < words.length - 1) {
    currentIndex++;
    // 查找下一个未熟记的单词
    while (memorizedWords.includes(words[currentIndex].title) && currentIndex < words.length - 1) {
      currentIndex++;
    }
    updateWordCard();
    // 给上下按钮添加动画
    nextBtn.classList.remove('scale-100');
    nextBtn.classList.add('scale-90', 'transition-transform', 'duration-300');
    setTimeout(() => nextBtn.classList.remove('scale-90'), 300);
  }
}

function showPrevWord() {
  if (currentIndex > 0) {
    let originalIndex = currentIndex;
    currentIndex--;

    // 查找上一个未熟记的单词
    while (memorizedWords.includes(words[currentIndex].title) && currentIndex > 0) {
      currentIndex--;
    }

    // 如果找到的单词仍然是熟记单词，并且已经跳到最前面，则保持原本单词不变
    if (memorizedWords.includes(words[currentIndex].title) && currentIndex === 0) {
      currentIndex = originalIndex;
    }

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

const searchInput = document.getElementById("searchInput");

// 按回车键时触发搜索
searchInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    const searchWord = searchInput.value.trim();
    if (searchWord) {
      // 查找单词并展示详细信息
      searchAndDisplayWord(searchWord);
    }
  }
});

function searchAndDisplayWord(word) {
  // 如果当前不在 index.html，跳转并传递单词作为 URL 参数
  if (!window.location.pathname.endsWith("index.html") && !window.location.pathname.endsWith("/")) {
    window.location.href = `index.html?search=${encodeURIComponent(word)}`;
    return;
  }

  console.log("当前在 index.html，执行搜索逻辑");

  generateExampleBtn.classList.add("hidden");

  // 在当前单词列表中查找匹配的单词
  const foundWord = words.find(item => item.title.toLowerCase() === word.toLowerCase());

  if (foundWord) {
    wordElement.textContent = foundWord.title;
    definitionTextElement.textContent = foundWord.text;
    currentIndex = words.indexOf(foundWord);
    updateWordCard();
  } else {
    currentIndex = -1;
    wordElement.textContent = word;
    definitionTextElement.textContent = "此单词不在词库中";
    updateWordCard();
  }

  // 生成例句
  generateExampleSentence(word);
}

window.onload = function () {
  // 解析 URL 参数
  const params = new URLSearchParams(window.location.search);
  const searchWord = params.get("search");

  // 如果 URL 里带有搜索单词，就执行搜索
  if (searchWord) {
    searchAndDisplayWord(searchWord);
  }
};




// Initialize
fetchWords();

prevBtn.addEventListener("click", showPrevWord);
nextBtn.addEventListener("click", showNextWord);



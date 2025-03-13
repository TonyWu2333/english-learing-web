let words = [];
const wordListElement = document.getElementById("wordList");
const articleElement = document.getElementById("article");
const articleTextElement = document.getElementById("articleText");

let currentPage = 1;
const wordsPerPage = 12;

// 从浏览器本地存储加载收藏数据
let favoriteWords = JSON.parse(localStorage.getItem('favoriteWords')) || [];
let sentenceToggle = (localStorage.getItem('sentenceToggle') === 'true');

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
      words = Object.values(data).filter(word => favoriteWords.includes(word.title)); // 仅保留收藏的单词
      console.log(words)
      displayWordList();
    })
    .catch(error => {
      console.error('Error fetching words:', error);
    });
}

function displayWordList() {
  wordListElement.innerHTML = ''; // 清空当前列表

  // 计算分页
  const start = (currentPage - 1) * wordsPerPage;
  const end = start + wordsPerPage;
  const paginatedWords = words.slice(start, end);

  paginatedWords.forEach((word, index) => {
    const wordCard = document.createElement('div');
    wordCard.classList.add('bg-white', 'shadow-xl', 'rounded-xl', 'p-4', 'text-center', 'relative', 'opacity-0', 'transform', 'translate-y-10', 'transition-all', 'duration-700');
    
    wordCard.innerHTML = `
      <div class="flex items-center justify-between mb-4">
        <h1 class="text-3xl font-semibold">${word.title}</h1>
        <button class="btn btn-sm removeFavoriteBtn" data-word="${word.title}">取消收藏</button>
      </div>
      <p class="mt-4 text-lg text-gray-700">${word.text}</p>
    `;
    
    wordListElement.appendChild(wordCard);
    
    setTimeout(() => {
      wordCard.classList.remove('opacity-0', 'translate-y-10');
      wordCard.classList.add('opacity-100', 'translate-y-0');
    }, 1 * index);
  });

  if(sentenceToggle){
    const wordString = paginatedWords.map(item => item.title).join(", ");
    console.log(wordString);
    articleElement.classList.remove("opacity-0");
    articleElement.classList.add("opacity-100");
    generateArticle(wordString);
  }

  updatePagination();
  addEventListeners();
}

function generateArticle(words) {

  // 从 localStorage 获取 API 密钥和模型名称
  const apiKey = localStorage.getItem('apiKey');
  const modelName = localStorage.getItem('modelName');

  // 如果没有找到 API 密钥或模型名称，提示用户
  if (!apiKey || !modelName) {
    articleTextElement.textContent = "未找到API密钥或模型名称，请在设置中输入相关信息。";
    return;
  }

  // 初始化计数器和句点
  let dotCount = 1;
  const loadingText = "AI生成中";
  articleTextElement.textContent = loadingText + ".".repeat(dotCount);
  articleTextElement.classList.add("text-gray-400"); // 给“AI生成中”添加灰色文本样式
  
  // 使用定时器动态增加句点
  const dotInterval = setInterval(() => {
    dotCount = (dotCount % 3) + 1;  // 控制句点数量循环在1至3之间
    articleTextElement.textContent = loadingText + ".".repeat(dotCount);
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
      "messages": [{ "role": "user", "content": `请写一篇全英文的文章(100词左右)，必须用到以下单词 ${words}，且这些单词要在文中用<b>标粗` }],
      "stream": false,
      "temperature": 1.3
    })
  })
  .then(response => response.json())
  .then(data => {
    clearInterval(dotInterval);  // 停止句点变化
    if (data.choices && data.choices.length > 0) {
      console.log(data.choices[0].message.content);
      articleTextElement.innerHTML = `${data.choices[0].message.content}`;
      articleTextElement.classList.remove("text-gray-400"); // 移除灰色文本样式
    } else {
      articleTextElement.textContent = "无法获取例句";
      articleTextElement.classList.remove("text-gray-400");
    }
  })
  .catch(error => {
    clearInterval(dotInterval);  // 停止句点变化
    console.error("Error generating article:", error);
    articleTextElement.textContent = "获取例句失败";
    articleTextElement.classList.remove("text-gray-400");
  });
}

function updatePagination() {
  const totalPages = Math.ceil(words.length / wordsPerPage);
  document.getElementById("paginationInfo").textContent = `${currentPage} / ${totalPages}`;

  document.getElementById("prevPage").disabled = currentPage === 1;
  document.getElementById("nextPage").disabled = currentPage === totalPages;

  // 更新 URL 中的页码，使用浏览器的 History API
  history.replaceState(null, null, `?page=${currentPage}`);
}

// 添加跳转功能
document.getElementById("jumpBtn").addEventListener("click", () => {
  const pageInput = document.getElementById("pageInput");
  const targetPage = parseInt(pageInput.value, 10);

  if (targetPage && targetPage > 0 && targetPage <= Math.ceil(words.length / wordsPerPage)) {
    currentPage = targetPage;
    displayWordList();
  } else {
    alert("请输入有效的页码！");
  }
});

document.getElementById("prevPage").addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    displayWordList();
  }
});

document.getElementById("nextPage").addEventListener("click", () => {
  if (currentPage < Math.ceil(words.length / wordsPerPage)) {
    currentPage++;
    displayWordList();
  }
});

function addEventListeners() {
  const removeButtons = document.querySelectorAll('.removeFavoriteBtn');
  removeButtons.forEach(button => {
    button.addEventListener('click', (event) => {
      const wordTitle = event.target.getAttribute('data-word');
      favoriteWords = favoriteWords.filter(item => item !== wordTitle);
      localStorage.setItem('favoriteWords', JSON.stringify(favoriteWords));
      fetchWords();
    });
  });
}

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
  }

fetchWords();

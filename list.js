let words = [];
const wordListElement = document.getElementById("wordList");

let currentPage = 1;
const wordsPerPage = 12;

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
    
    // 创建单词卡片内容
    wordCard.innerHTML = `
      <div class="flex items-center justify-between mb-4">
        <!-- 收藏按钮 -->
        <div class="flex items-center">
          <label class="rating">
            <input type="checkbox" class="favoriteCheckbox mask mask-star border-indigo-600 bg-indigo-500 checked:bg-orange-400 checked:text-orange-800 checked:border-orange-500" data-word="${word.title}" ${favoriteWords.includes(word.title) ? 'checked' : ''} />
          </label>
        </div>
        
        <!-- 单词 -->
        <h1 class="text-3xl font-semibold">${word.title}</h1>
        
        <!-- 熟记按钮 -->
        <div class="flex items-center">
          <button class="btn btn-sm memorizedBtn ${memorizedWords.includes(word.title) ? 'btn-success' : ''}" data-word="${word.title}">熟</button>
        </div>
      </div>
      <p class="mt-4 text-lg text-gray-700">${word.text}</p>
    `;
    
    // 将卡片添加到列表中
    wordListElement.appendChild(wordCard);

    // 触发动画（让卡片从下方滑入并显示）
    setTimeout(() => {
      wordCard.classList.remove('opacity-0', 'translate-y-10');
      wordCard.classList.add('opacity-100', 'translate-y-0');
    }, 1 * index); // 每个卡片延迟0.1秒出现
  });

  updatePagination();
  // 添加事件监听器
  addEventListeners();
}

function updatePagination() {
  const totalPages = Math.ceil(words.length / wordsPerPage);
  document.getElementById("paginationInfo").textContent = `${currentPage} / ${totalPages}`;

  document.getElementById("prevPage").disabled = currentPage === 1;
  document.getElementById("nextPage").disabled = currentPage === totalPages;

  // 更新 URL 中的页码，使用浏览器的 History API
  history.replaceState(null, null, `?page=${currentPage}`);
}

// 在页面加载时，读取 URL 参数来确定当前页
document.addEventListener('DOMContentLoaded', function() {
  const urlParams = new URLSearchParams(window.location.search);
  const page = parseInt(urlParams.get('page'), 10);

  // 如果 URL 中有有效的页码参数，设置为当前页
  if (page && page > 0 && page <= Math.ceil(words.length / wordsPerPage)) {
    currentPage = page;
  }

  displayWordList();
});

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
  // 添加收藏按钮的事件监听器
  const favoriteCheckboxes = document.querySelectorAll('.favoriteCheckbox');
  favoriteCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', (event) => {
      const wordTitle = event.target.getAttribute('data-word');
      if (event.target.checked) {
        if (!favoriteWords.includes(wordTitle)) {
          favoriteWords.push(wordTitle);
        }
      } else {
        favoriteWords = favoriteWords.filter(item => item !== wordTitle);
      }
      localStorage.setItem('favoriteWords', JSON.stringify(favoriteWords));
    });
  });

  // 添加熟记按钮的事件监听器
  const memorizedBtns = document.querySelectorAll('.memorizedBtn');
  memorizedBtns.forEach(button => {
    button.addEventListener('click', (event) => {
      const wordTitle = event.target.getAttribute('data-word');
      if (memorizedWords.includes(wordTitle)) {
        memorizedWords = memorizedWords.filter(item => item !== wordTitle);
        event.target.classList.remove('btn-success');
      } else {
        memorizedWords.push(wordTitle);
        event.target.classList.add('btn-success');
      }
      localStorage.setItem('memorizedWords', JSON.stringify(memorizedWords));
    });
  });
}

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
  
            // 更新页面中的单词卡片列表
            displayWordList();
          } catch (error) {
            alert("上传出现错误！"+error);
          }
        };
  
        // 读取选中的文件
        reader.readAsText(file);
      }
    });
  
    // 触发文件选择框
    input.click();
  });

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

// 初始化
fetchWords();

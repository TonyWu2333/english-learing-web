let words = [];
const wordListElement = document.getElementById("wordList");

let currentPage = 1;
const wordsPerPage = 12;

// 从浏览器本地存储加载熟记数据
let memorizedWords = JSON.parse(localStorage.getItem('memorizedWords')) || [];

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
      words = Object.values(data).filter(word => memorizedWords.includes(word.title)); // 仅保留熟记的单词
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
        <button class="btn btn-sm removeMemorizedBtn" data-word="${word.title}">取消熟记</button>
      </div>
      <p class="mt-4 text-lg text-gray-700">${word.text}</p>
    `;
    
    wordListElement.appendChild(wordCard);
    
    setTimeout(() => {
      wordCard.classList.remove('opacity-0', 'translate-y-10');
      wordCard.classList.add('opacity-100', 'translate-y-0');
    }, 1 * index);
  });

  updatePagination();
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
  const removeButtons = document.querySelectorAll('.removeMemorizedBtn');
  removeButtons.forEach(button => {
    button.addEventListener('click', (event) => {
      const wordTitle = event.target.getAttribute('data-word');
      memorizedWords = memorizedWords.filter(item => item !== wordTitle);
      localStorage.setItem('memorizedWords', JSON.stringify(memorizedWords));
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

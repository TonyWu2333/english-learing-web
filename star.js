let words = [];
const wordListElement = document.getElementById("wordList");

let currentPage = 1;
const wordsPerPage = 12;

// 从浏览器本地存储加载收藏数据
let favoriteWords = JSON.parse(localStorage.getItem('favoriteWords')) || [];

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

  updatePagination();
  addEventListeners();
}

function updatePagination() {
  const totalPages = Math.ceil(words.length / wordsPerPage);
  document.getElementById("paginationInfo").textContent = `${currentPage} / ${totalPages}`;
  document.getElementById("prevPage").disabled = currentPage === 1;
  document.getElementById("nextPage").disabled = currentPage === totalPages;
}

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

fetchWords();

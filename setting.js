// 页面加载时读取保存的 API 密钥
window.onload = () => {
    const savedApiKey = localStorage.getItem('apiKey');
    const savedmodelName = localStorage.getItem('modelName');
    if (savedApiKey) {
      document.getElementById('apiKeyInput').value = savedApiKey;
      document.getElementById('modelNameInput').value = savedmodelName;
    }
  };

// 监听保存设置表单的提交事件
document.getElementById('apiKeyForm').addEventListener('submit', function(event) {
    event.preventDefault();  // 防止表单默认提交
  
    // 获取输入的 API 密钥和模型名称
    const apiKey = document.getElementById('apiKeyInput').value;
    const modelName = document.getElementById('modelNameInput').value;
  
    // 保存到 localStorage
    localStorage.setItem('apiKey', apiKey);
    localStorage.setItem('modelName', modelName);
  
    // 提示用户保存成功
    alert("设置已保存！");
  });

// 加载主题并应用
document.addEventListener('DOMContentLoaded', function() {
    // 从 localStorage 获取已保存的主题
    const savedTheme = localStorage.getItem('theme') || 'emerald';  // 默认主题是 emerald
    document.body.setAttribute('data-theme', savedTheme);
    document.getElementById('themeSelect').value = savedTheme;
  });
  
  // 保存主题设置
  document.getElementById('themeForm').addEventListener('submit', function(event) {
    event.preventDefault();  // 防止表单默认提交
  
    // 获取选择的主题
    const selectedTheme = document.getElementById('themeSelect').value;
  
    // 保存到 localStorage
    localStorage.setItem('theme', selectedTheme);
  
    // 应用新的主题
    document.body.setAttribute('data-theme', selectedTheme);
  
    // 提示用户保存成功
    alert("主题已保存！");
  });
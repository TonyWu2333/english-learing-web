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
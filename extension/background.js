console.log("Ayra Conect: Background Worker active.");

// O background script pode ser usado para logs ou comunicação entre partes da extensão
// No momento, apenas confirma que a extensão está ativa.

chrome.runtime.onInstalled.addListener(() => {
    console.log("Extensão instalada!");
});

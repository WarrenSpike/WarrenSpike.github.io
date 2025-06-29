// Import Firebase functions directly into this module
import { getDatabase, ref, push, onValue, remove, update } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-database.js"; // 注意 Firebase SDK 版本號要和 index.html 裡的 firebase-app.js 一致！

// Get the initialized Firebase app instance from the global scope
// `window.firebaseApp` 是我們在 index.html 中設定的
const firebaseApp = window.firebaseApp;
const database = getDatabase(firebaseApp); // Initialize database service here

// DOM Elements
const themeToggle = document.getElementById('themeToggle');

// Theme Management (保持不變)
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
    
    themeToggle.addEventListener('click', toggleTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
    themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
}

// --- Homework Checklist Logic ---

// DOM Elements for Homework
const newHomeworkInput = document.getElementById('newHomework');
const newDueDateInput = document.getElementById('newDueDate');
const addHomeworkButton = document.getElementById('addHomework');
const homeworkList = document.getElementById('homeworkList');

// --- Firebase 相關變數 ---
let database; // 將在 DOMContentLoaded 後初始化

// 獲取 Firebase Realtime Database 相關函數
// 由於我們在 index.html 中使用了 type="module" 並將 database 暴露到 window，
// 所以這裡可以直接從 window.firebaseDatabase 取得。
// 確保 script.js 在 Firebase SDK 載入後執行。

// Function to add a homework item to the DOM
// 這個函數現在只負責將資料顯示在網頁上，不再處理儲存邏輯
function addHomeworkToDOM(id, text, dueDate = '', completed = false) {
    const listItem = document.createElement('li');
    listItem.className = 'homework-item';
    listItem.dataset.id = id; // 儲存 Firebase 的 key 作為 data-id
    listItem.dataset.dueDate = dueDate;

    if (completed) {
        listItem.classList.add('completed');
    }

    const itemContent = document.createElement('div');
    itemContent.className = 'homework-content';

    const itemText = document.createElement('span');
    itemText.className = 'homework-text';
    itemText.textContent = text;
    itemContent.appendChild(itemText);

    if (dueDate) {
        const dateDisplay = document.createElement('span');
        dateDisplay.className = 'homework-due-date';
        const dateOptions = { year: 'numeric', month: 'short', day: 'numeric' };
        dateDisplay.textContent = `Due: ${new Date(dueDate).toLocaleDateString(undefined, dateOptions)}`;
        
        // 檢查是否過期 (只有未完成的作業才檢查過期)
        if (!completed && new Date(dueDate) < new Date()) {
            dateDisplay.classList.add('overdue');
        }
        itemContent.appendChild(dateDisplay);
    }

    listItem.appendChild(itemContent);

    const buttonsContainer = document.createElement('div');
    buttonsContainer.className = 'homework-buttons';

    const completeButton = document.createElement('button');
    completeButton.textContent = completed ? 'Unmark' : 'Done';
    completeButton.className = 'complete-btn';
    completeButton.addEventListener('click', () => {
        // 更新 Firebase 中的 completed 狀態
        const itemId = listItem.dataset.id;
        const newCompletedStatus = !listItem.classList.contains('completed');
        const homeworkRef = ref(database, 'homework/' + itemId);
        update(homeworkRef, { completed: newCompletedStatus }); // 使用 update 更新部分資料
    });
    buttonsContainer.appendChild(completeButton);

    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.className = 'delete-btn';
    deleteButton.addEventListener('click', () => {
        // 從 Firebase 中刪除作業
        const itemId = listItem.dataset.id;
        const homeworkRef = ref(database, 'homework/' + itemId);
        remove(homeworkRef); // 刪除資料
    });
    buttonsContainer.appendChild(deleteButton);

    listItem.appendChild(buttonsContainer);

    // 將新項目插入到正確的排序位置
    insertSorted(listItem);
}

// 輔助函數：將項目按排序規則插入到列表中
function insertSorted(newItem) {
    const items = Array.from(homeworkList.children);
    let inserted = false;

    const newItemCompleted = newItem.classList.contains('completed');
    const newItemDueDate = newItem.dataset.dueDate ? new Date(newItem.dataset.dueDate) : new Date('9999-12-31');

    for (let i = 0; i < items.length; i++) {
        const existingItem = items[i];
        const existingItemCompleted = existingItem.classList.contains('completed');
        const existingItemDueDate = existingItem.dataset.dueDate ? new Date(existingItem.dataset.dueDate) : new Date('9999-12-31');

        // 排序邏輯：未完成的在前，已完成的在後
        if (!newItemCompleted && existingItemCompleted) {
            homeworkList.insertBefore(newItem, existingItem);
            inserted = true;
            break;
        }
        // 如果完成狀態相同，則按日期排序
        if (newItemCompleted === existingItemCompleted) {
            if (newItemDueDate < existingItemDueDate) {
                homeworkList.insertBefore(newItem, existingItem);
                inserted = true;
                break;
            }
        }
    }

    if (!inserted) {
        homeworkList.appendChild(newItem); // 如果沒有找到合適的位置，就加到最後
    }
}


// Event listener for adding new homework
addHomeworkButton.addEventListener('click', () => {
    const text = newHomeworkInput.value.trim();
    const dueDate = newDueDateInput.value;

    if (text !== '') {
        // 將新作業推送到 Firebase Realtime Database
        const homeworkRef = ref(database, 'homework'); // 參考 'homework' 節點
        push(homeworkRef, { // 使用 push 創建一個帶有唯一 key 的新節點
            text: text,
            dueDate: dueDate,
            completed: false
        });

        newHomeworkInput.value = '';
        newDueDateInput.value = '';
    }
});

// Allow adding homework with Enter key
newHomeworkInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addHomeworkButton.click();
    }
});

// Initialize everything when the page loads
document.addEventListener('DOMContentLoaded', function() {
    initTheme();
    // 取得 Firebase database 實例
    database = window.firebaseDatabase; 

    // 監聽 Firebase 資料庫的變化
    const homeworkRef = ref(database, 'homework');
    onValue(homeworkRef, (snapshot) => {
        // 清空當前列表，因為我們要從 Firebase 重新載入所有資料
        homeworkList.innerHTML = ''; 
        const homeworkData = snapshot.val(); // 獲取所有作業資料

        if (homeworkData) {
            // 將物件轉換為陣列，並包含 Firebase 自動生成的 key (ID)
            const homeworkArray = Object.keys(homeworkData).map(key => ({
                id: key,
                ...homeworkData[key]
            }));

            // 排序作業：未完成的在前，已完成的在後；然後按日期排序
            homeworkArray.sort((a, b) => {
                if (a.completed && !b.completed) return 1;
                if (!a.completed && b.completed) return -1;

                const dateA = a.dueDate ? new Date(a.dueDate) : new Date('9999-12-31');
                const dateB = b.dueDate ? new Date(b.dueDate) : new Date('9999-12-31');
                return dateA - dateB;
            });

            homeworkArray.forEach(item => {
                addHomeworkToDOM(item.id, item.text, item.dueDate, item.completed);
            });
        }
    });

    // 設定預設到期日為今天
    newDueDateInput.valueAsDate = new Date();
});
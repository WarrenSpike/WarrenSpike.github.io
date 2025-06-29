// DOM Elements
const themeToggle = document.getElementById('themeToggle');

// Theme Management (Keep as is)
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
const newDueDateInput = document.getElementById('newDueDate'); // New: Due Date Input
const addHomeworkButton = document.getElementById('addHomework');
const homeworkList = document.getElementById('homeworkList');

// Function to load homework from localStorage
function loadHomework() {
    const homework = JSON.parse(localStorage.getItem('homework')) || [];
    // Sort homework by due date (earliest first), then by completion status
    homework.sort((a, b) => {
        // Completed items go to the bottom
        if (a.completed && !b.completed) return 1;
        if (!a.completed && b.completed) return -1;

        // Then sort by date
        const dateA = a.dueDate ? new Date(a.dueDate) : new Date('9999-12-31'); // Push items without dates to end
        const dateB = b.dueDate ? new Date(b.dueDate) : new Date('9999-12-31');
        return dateA - dateB;
    });
    homework.forEach(item => addHomeworkToDOM(item.text, item.dueDate, item.completed));
}

// Function to save homework to localStorage
function saveHomework() {
    const homeworkItems = [];
    homeworkList.querySelectorAll('li').forEach(li => {
        homeworkItems.push({
            text: li.querySelector('.homework-text').textContent, // Select by new class
            dueDate: li.dataset.dueDate || '', // Get due date from dataset
            completed: li.classList.contains('completed')
        });
    });
    localStorage.setItem('homework', JSON.stringify(homeworkItems));
}

// Function to add a homework item to the DOM
function addHomeworkToDOM(text, dueDate = '', completed = false) {
    const listItem = document.createElement('li');
    listItem.className = 'homework-item';
    listItem.dataset.dueDate = dueDate; // Store due date in a data attribute

    if (completed) {
        listItem.classList.add('completed');
    }

    const itemContent = document.createElement('div');
    itemContent.className = 'homework-content';

    const itemText = document.createElement('span');
    itemText.className = 'homework-text'; // New class for homework text
    itemText.textContent = text;
    itemContent.appendChild(itemText);

    if (dueDate) {
        const dateDisplay = document.createElement('span');
        dateDisplay.className = 'homework-due-date';
        // Format date for display (e.g., "Due: Jul 15, 2025")
        const dateOptions = { year: 'numeric', month: 'short', day: 'numeric' };
        dateDisplay.textContent = `Due: ${new Date(dueDate).toLocaleDateString(undefined, dateOptions)}`;
        itemContent.appendChild(dateDisplay);
    }

    listItem.appendChild(itemContent); // Append content div to listItem

    const buttonsContainer = document.createElement('div');
    buttonsContainer.className = 'homework-buttons';

    const completeButton = document.createElement('button');
    completeButton.textContent = completed ? 'Unmark' : 'Done';
    completeButton.className = 'complete-btn';
    completeButton.addEventListener('click', () => {
        listItem.classList.toggle('completed');
        completeButton.textContent = listItem.classList.contains('completed') ? 'Unmark' : 'Done';
        saveHomework(); // Save changes
        sortHomeworkList(); // Re-sort after status change
    });
    buttonsContainer.appendChild(completeButton);

    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.className = 'delete-btn';
    deleteButton.addEventListener('click', () => {
        listItem.remove();
        saveHomework(); // Save changes
    });
    buttonsContainer.appendChild(deleteButton);

    listItem.appendChild(buttonsContainer); // Append buttons container to listItem

    homeworkList.appendChild(listItem);
}

// Function to sort the homework list in the DOM
function sortHomeworkList() {
    const items = Array.from(homeworkList.children);
    items.sort((a, b) => {
        const completedA = a.classList.contains('completed');
        const completedB = b.classList.contains('completed');

        // Completed items go to the bottom
        if (completedA && !completedB) return 1;
        if (!completedA && completedB) return -1;

        // Then sort by date
        const dateA = a.dataset.dueDate ? new Date(a.dataset.dueDate) : new Date('9999-12-31');
        const dateB = b.dataset.dueDate ? new Date(b.dataset.dueDate) : new Date('9999-12-31');
        return dateA - dateB;
    });
    items.forEach(item => homeworkList.appendChild(item));
    saveHomework(); // Save the new order
}


// Event listener for adding new homework
addHomeworkButton.addEventListener('click', () => {
    const text = newHomeworkInput.value.trim();
    const dueDate = newDueDateInput.value; // Get the date value

    if (text !== '') {
        addHomeworkToDOM(text, dueDate);
        newHomeworkInput.value = ''; // Clear text input
        newDueDateInput.value = ''; // Clear date input
        sortHomeworkList(); // Sort immediately after adding
    }
});

// Allow adding homework with Enter key (if text field is focused)
newHomeworkInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addHomeworkButton.click();
    }
});

// Initialize everything when the page loads
document.addEventListener('DOMContentLoaded', function() {
    initTheme();
    loadHomework(); // Load saved homework on page load
    // Set default due date to today for convenience
    newDueDateInput.valueAsDate = new Date(); 
});
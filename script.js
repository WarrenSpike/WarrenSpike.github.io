document.getElementById("addTaskButton").addEventListener("click", function() {
  let taskInput = document.getElementById("taskInput");    
  let taskText = taskInput.value; // 請填入取得輸入值的程式碼    
  if (taskText === "") {
      alert("請輸入任務！");        
      return;    
  }
  let taskList = document.getElementById("taskList");    
  let listItem = document.createElement("li");    
  listItem.innerHTML = taskText + ' <button class="delete-button">刪除</button>';

  taskList.appendChild(listItem); // 請填入將 listItem 加入 taskList 的程式碼   
  
  
  listItem.querySelector(".delete-button").addEventListener("click", function() {
    taskList.removeChild(listItem); // 請填入刪除 listItem 的程式碼    
  });
  taskInput.value = "";
});
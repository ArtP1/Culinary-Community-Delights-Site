/*
  ISSUES:
    1. When rendering a type of table I found that appending each 'tr' in the loops located in line #
       the whole left side of the tableBody renders without a border line, which I don't know how to solve
*/


const tableBody = document.querySelector("tbody");
const tableHeaderRow = document.querySelector('thead tr');
const options = document.querySelector('.options');


// Helper Functions
function isNullorEmpty(value) {
  if(value === null || value === "" || value === undefined) {
    return true;
  } 

  return false;
}




// Asynchronous Functions
async function fetchData(type) {
  let response = await fetch(`/api/${type}`, {
    method: 'GET'
  });

  if(response.ok) {
    let data = await response.json();

    return data;
  } else {
    throw new Error('Failed to fetch categories');
  }
}



// Rendering Functions
async function renderCategoriesTable() { // CATEGORIES TABLE
  const categories = await fetchData('categories');
  

  if(categories.length > 0) {
    let deleteButton = document.createElement('button');
    let addButton = document.createElement('button');
    deleteButton.className = 'opBtn delete';
    deleteButton.textContent = 'DELETE';

    addButton.className = 'opBtn add';
    addButton.textContent = 'ADD';

    options.appendChild(deleteButton)
    options.appendChild(addButton)
    
    let allCheckBoxOptionHeader = document.createElement('th');
    allCheckBoxOptionHeader.scope = 'col';
    let mainCheckbox = document.createElement('input');
    mainCheckbox.type = 'checkbox';
    mainCheckbox.className = 'all-rows';
    allCheckBoxOptionHeader.appendChild(mainCheckbox);
    
    let idHeader = document.createElement('th');
    idHeader.scope = 'col';
    idHeader.textContent = "#";

    let categoryHeader = document.createElement('th');
    categoryHeader.scope = 'col';
    categoryHeader.textContent = 'Category';

    let catDescripHeader = document.createElement('th');
    catDescripHeader.scope = 'col';
    catDescripHeader.textContent = 'Description';

    let catParentHeader = document.createElement('th');
    catParentHeader.scope = 'col';
    catParentHeader.textContent = 'Parent (#id)';

    let catSubcatHeader = document.createElement('th');
    catSubcatHeader.scope = 'col';
    catSubcatHeader.textContent = 'Subcategory (1/0)';

    let catDateModifiedHeader = document.createElement('th');
    catDateModifiedHeader.scope = 'col';
    catDateModifiedHeader.textContent = 'Date Modified';

    let catDateCreatedHeader = document.createElement('th');
    catDateCreatedHeader.scope = 'col';
    catDateCreatedHeader.textContent = 'Date Created';

    let catIsGeneralHeader = document.createElement('th');
    catIsGeneralHeader.scope = 'col';
    catIsGeneralHeader.textContent = 'General (1/0)';

    let catIsActiveHeader = document.createElement('th');
    catIsActiveHeader.scope = 'col';
    catIsActiveHeader.textContent = "Active (1/0)";

    let optionsColumnHeader = document.createElement('th');
    optionsColumnHeader.scope = 'col';
    let zontLine = document.createElement('hr'); 
    optionsColumnHeader.appendChild(zontLine);

    
    tableHeaderRow.appendChild(allCheckBoxOptionHeader);
    tableHeaderRow.appendChild(idHeader);
    tableHeaderRow.appendChild(categoryHeader);
    tableHeaderRow.appendChild(catDescripHeader);
    tableHeaderRow.appendChild(catParentHeader);
    tableHeaderRow.appendChild(catSubcatHeader);
    tableHeaderRow.appendChild(catDateModifiedHeader);
    tableHeaderRow.appendChild(catDateCreatedHeader);
    tableHeaderRow.appendChild(catIsGeneralHeader);
    tableHeaderRow.appendChild(catIsActiveHeader);
    tableHeaderRow.appendChild(optionsColumnHeader);


    for (const category of categories) {
      let parentCategoryId;
      if(isNullorEmpty(category.parent_category_id)) {
        parentCategoryId = 'N/A';
      } else {
        parentCategoryId = category.parent_category_id;
      }
  
      let modifiedDate = new Date(category.date_modified);
      let modifiedDateFormatted = modifiedDate.toLocaleDateString();
  
      let dateCreated = new Date(category.date_created);
      let dateCreatedFormatted = dateCreated.toLocaleDateString();
  
      tableBody.innerHTML += `<tr>
                                <td><input type="checkbox" value="${category.id}" /></td>
                                <td>${category.id}</td>
                                <td>${category.category_name}</td>
                                <td class="truncate-txt">${category.description}</td>
                                <td>${parentCategoryId}</td>
                                <td>${category.is_sub_category}</td>
                                <td>${modifiedDateFormatted}</td>
                                <td>${dateCreatedFormatted}</td>
                                <td>${category.is_general}</td>
                                <td>${category.is_active}</td>
                                <td>
                                  <div class="tb_actions">
                                    <a href="/api/categories/delete?rowId=${category.id}">
                                      <img class="tb_action_btns" src="/img/remove_img.png" alt="delete category" title="Delete this category">
                                    </a> 
                                    <a href="/api/categories/update?rowId=${category.id}">
                                      <img id="edit-btn" src="/img/edit_img.png" alt="update category" title="Update this category">
                                    </a>
                                  </div>
                                </td>
                             </tr>`;
    }
  } else {
    let tableRow = document.createElement('tr');
    let cell = document.createElement('td');

    tableRow.style.width = '100%';
    tableRow.style.height = '500px';

    cell.setAttribute('colspan', '22');
    cell.textContent = 'No data available';
    cell.style.textAlign = 'center';

    tableRow.appendChild(cell);
    tableBody.appendChild(tableRow);
  }
}


async function renderRecipesTable() { // RECIPES TABLE
  const recipes = await fetchData('recipes');

  if(recipes.length > 0) {
    let deleteButton = document.createElement('button');
    let addButton = document.createElement('button');
    deleteButton.className = 'opBtn delete';
    deleteButton.textContent = 'DELETE';
  
    addButton.className = 'opBtn add';
    addButton.textContent = 'ADD';

    options.append(deleteButton)
    options.append(addButton)

    console.log(recipes)
  } else {
    let tableRow = document.createElement('tr');
    let cell = document.createElement('td');

    tableRow.style.width = '100%';
    tableRow.style.height = '500px';

    cell.setAttribute('colspan', '22');
    cell.textContent = 'No data available';
    cell.style.textAlign = 'center';

    tableRow.appendChild(cell);
    tableBody.appendChild(tableRow);
  }
}



async function renderUsersTable() { // USERS TABLE
  const users = await fetchData('users');

  if(users.length > 0) {
    let deleteButton = document.createElement('button');
    let addButton = document.createElement('button');
    deleteButton.className = 'opBtn delete';
    deleteButton.textContent = 'DELETE';

    addButton.className = 'opBtn add';
    addButton.textContent = 'ADD';
    
    options.append(deleteButton)
    options.append(addButton)

    for(const user of users) {
      let biography;
      if(isNullorEmpty(user.biography)) {
        biography = 'N/A';
      } else {
        biography = user.biography;
      }
  
      let pfp;
      if(isNullorEmpty(user.profile_picture)) {
        pfp = 'N/A';
      } else {
        pfp = user.profile_picture;
      }
  
      let dateCreated = new Date(user.created_at);
      let dateCreatedFormatted = dateCreated.toLocaleDateString();
  
      let lastLogin;
      if(isNullorEmpty(user.last_login)) {
        lastLogin = 'No Activity';
      } else {
        lastLogin = new Date(user.last_login);
      }
  
  
      tableBody.innerHTML += `<tr>
                                <td><input type="checkbox" value="${user.id}" /></td>
                                <td>${user.id}</td>
                                <td>${user.username}</td>
                                <td>${user.first_name}</td>
                                <td>${user.last_name}</td>
                                <td>${biography}</td>
                                <td>${pfp}</td>
                                <td>${dateCreatedFormatted}</td>
                                <td>${lastLogin.toLocaleDateString()}</td>
                                <td>
                                  <div class="tb_actions">
                                    <a href="/api/users/delete?rowId=${user.id}">
                                      <img class="tb_action_btns" src="/img/remove_img.png" alt="delete user" title="Delete this user">
                                    </a> 
                                    <a href="/api/users/update?rowId=${user.id}">
                                      <img id="edit-btn" src="/img/edit_img.png" alt="update user" title="Update this user">
                                    </a>
                                  </div>
                                </td>
                              </tr>`;
  
    }

  } else {
    let tableRow = document.createElement('tr');
    let cell = document.createElement('td');

    tableRow.style.width = '100%';
    tableRow.style.height = '500px';

    cell.setAttribute('colspan', '22');
    cell.textContent = 'No data available';
    cell.style.textAlign = 'center';

    tableRow.appendChild(cell);
    tableBody.appendChild(tableRow);
  }

}



// Event Trigger Functions
tableBody.addEventListener("click", function (event) { // minimizes extensive cells width and height
  if (event.target.matches(".truncate-txt")) {
    event.target.classList.toggle('expand');
  }
});

tableHeaderRow.addEventListener('click', function(event) {
  // Check if the clicked element is a th tag and has more than one word
  if (event.target.matches('.truncate-hd')) {
    event.target.classList.toggle('expand');
  }
});



// Main Function
function renderTableBasedOnPage() {
  let page = document.getElementById('page').value;

  console.log(page)
  switch (page) {
    case "admin_users":
      renderUsersTable();
      break;
    case "admin_categories":
      renderCategoriesTable();
      break;
    case "admin_recipes":
      renderRecipesTable();
      break;
    default:
      window.location.href = "/admin/dashboard";
      break;
  }
}

// Callback
renderTableBasedOnPage();
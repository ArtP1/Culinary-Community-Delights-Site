/*
  ISSUES:
    1. When rendering a type of table I found that appending each 'tr' in the loops located in line #
       the whole left side of the tableBody renders without a border line, which I don't know how to solve
*/


var tableBody = document.querySelector("tbody");



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
async function renderCategoriesTable() {
  const categories = await fetchData('categories');

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
                                    <img id="update_btn" src="/img/edit_img.png" alt="update category" title="Update this category">
                                  </a>
                                </div>
                              </td>
                           </tr>`;
  }
}

async function renderRecipesTable() {
  const recipes = await fetchData('recipes');

  if(recipes.length > 0) {
    console.log(recipes)
  } else {
    let tableRow = document.createElement('tr');
    let cell = document.createElement('td');

    tableRow.style.width = '100%';
    tableRow.style.height = '100%';

    cell.setAttribute('colspan', '22');
    cell.textContent = 'No data available';

    tableRow.appendChild(cell);
    tableBody.appendChild(tableRow);
  }
}



async function renderUsersTable() {
  const users = await fetchData('users');

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
                                    <img id="update_btn" src="/img/edit_img.png" alt="update user" title="Update this user">
                                  </a>
                                </div>
                              </td>
                            </tr>`;

  }
}



// Event Trigger Functions
tableBody.addEventListener("click", function (event) { // minimizes extensive cells width and height
  if (event.target.matches(".truncate-txt")) {
    event.target.classList.toggle('expand');
  }
});



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
      break;
  }
}

// Callback
renderTableBasedOnPage();
var allRowsCheckbox = document.querySelector(".all-rows");
var rowCheckboxes = document.querySelectorAll("tbody input[type='checkbox']");
var deleteBtn = document.querySelector('.delete');
var saveBtn = document.querySelector('.update');
var modifiedRows = new Set();
var checkedCheckboxes = new Set();

function handleRowModification(rowId) {
  modifiedRows.add(rowId);
}

function updateCheckedCheckboxes(checkbox, isChecked) {
  if (isChecked) {
    checkedCheckboxes.add(checkbox.value);
  } else {
    checkedCheckboxes.delete(checkbox.value);
  }
}

rowCheckboxes.forEach(function (checkbox) {
  checkbox.addEventListener("change", function () {
    var isChecked = checkbox.checked;
    updateCheckedCheckboxes(checkbox, isChecked);
    console.log(checkedCheckboxes);
    handleRowModification(checkbox.value);
  });
});

document.querySelectorAll('.truncate-txt').forEach(function (element) {
  element.addEventListener('click', function () {
    element.classList.toggle('expand');
  });
});

allRowsCheckbox.addEventListener("change", function () {
  var isChecked = allRowsCheckbox.checked;
  rowCheckboxes.forEach(function (checkbox) {
    checkbox.checked = isChecked;
    updateCheckedCheckboxes(checkbox, isChecked);
  });
});

deleteBtn.addEventListener("click", function () {
  var checkedRows = Array.from(checkedCheckboxes);

  if (checkedRows.length === 0) {
    console.log("Please select at least one row to delete.");
    return;
  }

  checkedRows.forEach(function (rowId) {
    console.log("Performing AJAX delete for row #", rowId);

    // Perform AJAX delete for the corresponding row using fetch
    fetchDelete(rowId)
      .then(function () {
        // Successful delete, update the UI
        var deletedRow = document.getElementById("row-" + rowId);
        console.log(deletedRow)
        if (deletedRow) {
          deletedRow.remove();
          checkedCheckboxes.delete(rowId);
          modifiedRows.delete(rowId);
        }
      })
      .catch(function (error) {
        console.error("Error deleting row:", rowId, error);
        // Handle error scenario, if needed
      });
  });
});

saveBtn.addEventListener("click", function () {
  var checkedRows = Array.from(checkedCheckboxes);

  if (checkedRows.length === 0) {
    console.log("Please select at least one row to save.");
    return;
  }

  var isModified = checkedRows.some(function (rowId) {
    return modifiedRows.has(rowId);
  });

  if (!isModified) {
    console.log("No modified rows selected for save.");
    return;
  }

  checkedRows.forEach(function (rowId) {
    console.log("Performing AJAX save for row with ID:", rowId);

    // Perform AJAX save for the corresponding row using fetch
    fetchUpdate(rowId)
      .then(function () {
        // Successful save, update the UI or take further action
        modifiedRows.delete(rowId);
      })
      .catch(function (error) {
        console.error("Error saving row:", rowId, error);
        // Handle error scenario, if needed
      });
  });
});

// AJAX DELETE USER
function fetchDelete(userId) {
  return fetch(`/api/users/${userId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    }
  })
    .then(function (response) {
      if (!response.ok) {
        throw new Error('Delete request failed');
      }
      console.log("Delete request succeeded")
    });
}

// AJAX UPDATE USER
function fetchUpdate(userId) {
  return fetch(`/api/users/${userId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ 
      rowId: rowId,
      username: username,
      email: email,
      password: password,
      first_name: first_name,
      last_name: last_name, 
      profile_picture: profile_picture,
      biography: biography,
      country: country,
      last_updated: last_updated 
    }),
  })
    .then(function (response) {
      if (!response.ok) {
        throw new Error('Save request failed');
      }
      console.log("Update request succeeded")
    });
}

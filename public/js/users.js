const page = document.getElementById('page').value;



async function renderGeneralCategories() { // NEEDS TO BE CHANGED
    let categoriesContainer = document.querySelector('.fxf_categories');

    const response = await fetch('/api/categories/general', {
        method: 'GET',
        headers: { 
            'Content-Type': 'application/json' 
        }
    })

    if(response.ok) {
        const data = await response.json()
        console.log(data)

        for(let i = 0; i < data.length; i++) {
            let category = document.createElement('div')
            category.className = 'category'
            category.innerHTML = `
                                    <img src="/img/email.png" alt="email-icon">
                                    <div class="category_details">
                                        <h5>${data[i].category_name}</h5>
                                        <p>${data[i].description}</p>
                                    </div>
                                `
            categoriesContainer.append(category)
        }
    }
}


// switch(page) {
//     case 'user_home':
//         renderGeneralCategories()
//         break;
//     default:
//         break;
// }
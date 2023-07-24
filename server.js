const express = require('express');
const server = express()

require('dotenv').config()
server.set('view engine', 'ejs')
server.use(express.static('public'))

// middleware for parsing request body
server.use(express.urlencoded({ extended: true }))

// middleware for parsing data in JSON
server.use(express.json())


const { 
    HOST_PORT,
    DB_TABLE_CATEGORIES,
    DB_TABLE_USERS,
    DB_TABLE_RECIPES
} = process.env
const { queryDb } = require('./config/database/utils')


// USER ROUTES ------------------------------------------------
server.get('/', (req, res) => { // USER HOME PAGE


    
    res.render('./layouts/user-base', {data: {}, 
                                       other: {view: "user_home"}})
})

server.get('/signup', (req, res) => { // USER SIGNUP PAGE



    res.render('./layouts/user-authentication-base', {data: {}, 
                                                      other: {form_header: "Create Account",
                                                              third_party_name: "Sign Up",
                                                              view: "user_signup",
                                                              page_header: "Discover a treasure trove of recipes shared by food enthusiasts from around the globe"}})
})

server.get('/login', (req, res) => { // USER LOGIN PAGE



    res.render('./layouts/user-authentication-base', {data: {}, 
                                                      other: {form_header: "Log in",
                                                              third_party_name: "Sign in",
                                                              view: "user_login",
                                                              page_header: "Discover a treasure trove of recipes shared by food enthusiasts from around the globe"}})
})

server.get('/about', (req, res) => { 

    res.render('./layouts/user-base', {data: {}, 
                                       other: {view: "user_about"}})
})

server.get('/recipes', (req, res) => {
    let recipes = `SELECT * FROM ${DB_TABLE_RECIPES} WHERE is_active = 1`
    
    res.render('./layouts/user-base', {data: {}, 
                                       other: {view: "user_recipes"}})
})

server.get('/recipes/:category', (req, res) => {
    let category = req.params.category;

    res.render('./layouts/user-base', {data: {category: category}, 
                                       other: {view: "user_recipes"}})
})

server.get('/community', (req, res) => {

    res.render('./layouts/user-base', {data: {},
                                       other: {view: "user_community"}})
})






// ADMIN ROUTES ------------------------------------------------
server.get('/admin', (req, res) => {

    res.render('./layouts/admin-base', {data: {}, 
                                        other: {view: "adnin_login"}})
})

server.get('/admin/dashboard', (req, res) => {

    res.render('./layouts/admin-base', {data: {}, 
                                        other: {view: "admin_dashboard", page: "Dashboard", admin_type: "admin"}})
})

server.get('/admin/users', async (req, res) => {

    res.render('./layouts/admin-base', {data: {}, 
                                        other: {view: "admin_users", page: "Users", admin_type: "admin"}})
})

server.get('/admin/recipes', (req, res) => {

    res.render('./layouts/admin-base', {data: {}, 
                                        other: {view: "admin_recipes", page: "Recipes", admin_type: "admin"}})
})

server.get('/admin/categories', async (req, res) => { // CATEGORIES

    res.render('./layouts/admin-base', {data: {}, 
                                        other: {view: "admin_categories",  page: "Categories", admin_type: "admin"}})
})

server.get('/admin/preferences', (req, res) => { // PREFERENCES

    res.render('./layouts/admin-base', {data: {}, 
                                        other: {view: "admin_login", page: "Preferences", admin_type: "admin"}})
})

server.get('/admin/posts', (req, res) => {

    res.render('./layouts/admin-base', {data: {}, 
                                        other: {view: "admin_posts", page: "Posts", admin_type: "admin"}})
})

server.get('/admin/settings', (req, res) => {

    res.render('./layouts/admin-base', {data: {}, 
                                        other: {view: "admin_settings", page: "Settings", admin_type: "admin"}})
})




// API GET REQUESTS --------------------------------
server.get('/api/categories/:types', async (req, res) => {
    const { types } = req.params;
    let categories = null;

    try {
        switch(types) {
            case "general":
                categories = await queryDb(`SELECT * FROM ${DB_TABLE_CATEGORIES} WHERE is_general = 1`)
                break;
            case "active":
                categories = await queryDb(`SELECT * FROM ${DB_TABLE_CATEGORIES} WHERE is_active = 1`)
                break;
            default:
                categories = await queryDb(`SELECT * FROM ${DB_TABLE_CATEGORIES}`)
                break;
        }

        return res.send(categories)
    } catch (error) {
        console.log(error)

        return res.send({})
    }
})

// GET request to fetch all 
server.get('/api/:type', async (req, res) => {
    let dataType;
    const type = req.params.type;

    try {
        switch(type) {
            case 'users':
                dataType = await queryDb(`SELECT * FROM ${DB_TABLE_USERS}`)
                break;
            case 'categories':
                dataType = await queryDb(`SELECT * FROM ${DB_TABLE_CATEGORIES}`)
                break;
            case "recipes":
                dataType = await queryDb(`SELECT * FROM ${DB_TABLE_RECIPES}`)
                break;
            default:
                throw new Error('Invalid data type');
        }

        res.send(dataType)
    } catch (err) {
        res.status(500).json({err: "Internal server error"})
    }
})


// POST request to add a new user
// server.post('/api/users', async (req, res) => {
//     try {
//         const { username, email, password, last_login } = req.body

//         const newUser = await queryDb(`INSERT INTO ${DB_TABLE_USERS}
//                                        (username, email, password, last_login)
//                                        VALUES(? , ?, ?, ?)`, [username, email, password, last_login])

//         res.json(newUser)
//     } catch (err) {
//         res.status(500).json({error: "Internal servar error"})
//     }
// });


// UPDATE request to update an existing row from table x
server.get('/api/:type/update', async (req, res) => {
    try {
        const { username, email, password, first_name, last_name, 
                profile_picture, biography, country, last_updated } = req.body
        
        const userId = req.params.id;

        const updatedUser = await queryDb(`UPDATE ${DB_TABLE_USERS}
                                           SET username = ?, email = ?, password = ?, first_name = ?, 
                                           last_name = ?, profile_picture = ?, biography = ?, country = ?, last_updated = ?
                                           WHERE id = ?`, [username, email, password, first_name, last_name, profile_picture, biography, country, last_updated, userId])
        res.send(updatedUser);
    } catch(err) {
        res.status(500).json({ error: "Internal server error"})
    }

    let rowId = req.query.rowId;
    try {
        switch(type) {
            case 'users':
                dataType = await queryDb(`UPDATE ${DB_TABLE_USERS}
                                          SET username = ?, email = ?, password = ?, first_name = ?, 
                                          last_name = ?, profile_picture = ?, biography = ?, country = ?, last_updated = ?
                                          WHERE id = ?`, [username, email, password, first_name, last_name, profile_picture, biography, country, last_updated, userId])
                break;
            case 'categories':
                dataType = await queryDb(`DELETE FROM ${DB_TABLE_CATEGORIES}
                                          WHERE id = ?`, [rowId])
                break;
            default:
                throw new Error('Invalid data type');
        }
    } catch (err) {
        res.status(500).json({err: "Internal server error"})
    }
});


// DELETE request to delete an existing row from table x
server.get('/api/:type/delete', async (req, res) => {
    let rowId = req.query.rowId;
    let type = req.params.type;
    let dataType;

    try {
        switch(type) {
            case 'users':
                dataType = await queryDb(`DELETE FROM ${DB_TABLE_USERS}
                                          WHERE id = ?`, [rowId])
                break;
            case 'categories':
                dataType = await queryDb(`DELETE FROM ${DB_TABLE_CATEGORIES}
                                          WHERE id = ?`, [rowId])
                break;
            default:
                throw new Error('Invalid data type');
        }

        res.redirect('/admin/users')
    } catch (err) {
        res.status(500).json({err: "Internal server error"})
    }
});


server.listen(HOST_PORT, () => {
    console.log(`Server is running on port http://localhost:${HOST_PORT}`)
});

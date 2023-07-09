const express = require('express');
const server = express()

require('dotenv').config()
server.set('view engine', 'ejs')
server.use(express.static('public'))
server.use(express.urlencoded({ extended: true }))
server.use(express.json())


const { 
    HOST_PORT,
    DB_TABLE_CATEGORIES,
    DB_TABLE_USERS
} = process.env
const { queryDb } = require('./config/database/utils')


// USER ROUTES ------------------------------------------------
server.get('/', (req, res) => {

    res.render('./layouts/user-base', {data: {}, 
                                       other: {view: "user_home"}})
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

    res.render('./layouts/user-base', {data: {}, 
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
    let users = await queryDb(`SELECT * FROM ${DB_TABLE_USERS}`)

    res.render('./layouts/admin-base', {data: {users: users}, 
                                        other: {view: "admin_users", page: "Users", admin_type: "admin"}})
})

server.get('/admin/recipes', (req, res) => {

    res.render('./layouts/admin-base', {data: {}, 
                                        other: {view: "admin_recipes", page: "Recipes", admin_type: "admin"}})
})

server.get('/admin/categories', async (req, res) => { // CATEGORIES
    let categories = await queryDb(`SELECT * FROM ${DB_TABLE_CATEGORIES}`)


    res.render('./layouts/admin-base', {data: {categories: categories}, 
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

// GET request to fetch all users
server.get('/api/users', async (req, res) => {
    try {
        const users = await queryDb(`SELECT * FROM ${DB_TABLE_USERS}`);

        res.send(users)
    } catch (err) {
        res.status(500).json({errpr: "Internal server error"})
    }
})


// POST request to add a new user
server.post('/api/users', async (req, res) => {
    try {
        const { username, email, password, last_login } = req.body

        const newUser = await queryDb(`INSERT INTO ${DB_TABLE_USERS}
                                       (username, email, password, last_login)
                                       VALUES(? , ?, ?, ?)`, [username, email, password, last_login])

        res.json(newUser)
    } catch (err) {
        res.status(500).json({error: "Internal servar error"})
    }
});


// PUT request to update an existing user
server.put('/api/users/:id', async (req, res) => {
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
});


// DELETE request to delete an existing user
server.delete('/api/users/:id', async (req, res) => {
    try {
        const userId = req.params.id;

        const deletedUser = await queryDb(`DELETE FROM ${DB_TABLE_USERS}
                                           WHERE id = ?`, [userId])

        res.send(deletedUser);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
});


server.listen(HOST_PORT, () => {
    console.log(`Server is running on port http://localhost:${HOST_PORT}`)
});

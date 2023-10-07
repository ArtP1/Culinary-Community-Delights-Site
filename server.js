const express = require('express');
const bcrypt = require('bcrypt');
const session = require('express-session');
const passport = require('passport');
var GoogleStrategy = require('passport-google-oauth20').Strategy;
const server = express();
require('dotenv').config();

const { queryDb } = require('./config/database/utils')

server.set('view engine', 'ejs')
server.use(express.static('public'))

// middleware for parsing request body
server.use(express.urlencoded({ extended: true }))

// middleware for parsing data in JSON
server.use(express.json())

// 
server.use(session({ //  allow the server to store and retrieve information about a particular client's interactions with the application over multiple requests
    secret: process.env.SESSION_SECRET, // ensures that the session data is not tampered with or modified by unauthorized parties. 
    resave: false, // forces the session to be saved back to the session store on every request, even if the session data has not changed
    saveUninitialized: false // reduces storage usage and improve performance.
}))


passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/callback"
  },
  (accessToken, refreshToken, profile, cb) => {

    // Save user information to session
    // req.session.user = user;
    console.log(profile);

    // Call the callback function with the user object
    return cb(null, profile);
  }
));

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

server.use(passport.initialize());
server.use(passport.session());

// USER ROUTES ------------------------------------------------
server.get('/', (req, res) => { // USER HOME PAGE


    
    res.render('./layouts/user-base', {data: {}, 
                                       other: {view: "user_home", 
                                               authenticated: req.session.authenticated}})
})

server.get('/auth/google', 
    passport.authenticate('google', { scope: ["https://www.googleapis.com/auth/plus.login"] })
); 

server.get('/auth/google/callback', 
    passport.authenticate('google', { failureRedirect: ["/login"]}), (req, res) => {
        res.redirect('/');
});

server.get('/signup', (req, res) => { // USER SIGNUP PAGE



    res.render('./layouts/user-authentication-base', {data: {}, 
                                                      other: {form_header: "Create Account",
                                                              third_party_name: "Sign Up",
                                                              view: "user_signup",
                                                              page_header: "Discover a treasure trove of recipes shared by food enthusiasts from around the globe"}})
})

server.post('/signup', async (req, res) => { //  USER SIGNUO | POST
    const { username, email, password } = req.body;

    try {
        // Check if the user or email already exists
        const userExists = await queryDb(`SELECT * FROM ${process.env.DB_TABLE_USERS} WHERE username = ? OR email = ?`, [username, email]);

        if (userExists.length > 0) {
            return res.status(409).send({ message: "User already exists",
                                          success: false });
        }

        // Generate a salt and hash the password
        const nonceSalt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, nonceSalt);

        const todaysDate = new Date();

        // Insert the new user into the database
        await queryDb(`INSERT INTO ${process.env.DB_TABLE_USERS} 
                       (username, email, password, last_login)
                       VALUES(?, ?, ?, ?)`, [username, email, hashedPassword, todaysDate]);

        // Set session data
        req.session.authenticated = true;

        req.session.user = {
            username: username,
            email: email,
            dateCreated: "",
            firstName: "",
            lastName: "",
            profilePicture: "",
            bio: "",
            country: "",
            followersCount: 0,
            followingCount: 0,
            favoritesCount: 0,
            savedRecipesCount: 0,
            createdRecipesCount: 0,
            lastLoginDate: todaysDate,
            lastUpdatedDate: ""
        };

        console.log("User added to database")

        return res.send({ message: `Welcome ${username}!`,
                          success: true });
    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: "Something went wrong",
                                      success: false });
    }
});

server.get('/login', (req, res) => { // USER LOGIN PAGE



    res.render('./layouts/user-authentication-base', {data: {}, 
                                                      other: {form_header: "Log in",
                                                              third_party_name: "Sign in",
                                                              view: "user_login",
                                                              page_header: "Discover a treasure trove of recipes shared by food enthusiasts from around the globe"}})
})

server.post('/login', async (req, res) => {
    const { username, password } = req.body;

    // Input validation
    if (!username || !password) {
        return res.status(400).send({ message: "Username and password are required.", success: false });
    }

    try {
        const authUser = await queryDb(`SELECT * FROM ${process.env.DB_TABLE_USERS} WHERE username = ?`, [username]);

        if (authUser.length === 0) {
            return res.status(401).send({ message: "Invalid username or password", success: false });
        }

        const hashedPassword = authUser[0].password;
        const isMatch = await bcrypt.compare(password, hashedPassword);

        if (isMatch) {
            req.session.authenticated = true;

            req.session.user = {
                username: authUser[0].username,
                email: authUser[0].email,
                dateCreated: authUser[0].created_at,
                firstName: authUser[0].first_name,
                lastName: authUser[0].last_name,
                profilePicture: authUser[0].profile_picture,
                bio: authUser[0].biography,
                country: authUser[0].country,
                followersCount: authUser[0].followers_count,
                followingCount: authUser[0].following_count,
                favoritesCount: authUser[0].favorites_count,
                savedRecipesCount: authUser[0].saved_recipes_count,
                createdRecipesCount: authUser[0].created_recipes_count,
                lastLoginDate: authUser[0].last_login,
                lastUpdatedDate: authUser[0].last_updated
            };

            console.log('Authenticated user');
            
            return res.status(200).send({ message: "Authentication successful.", success: true });
        } else {
            return res.status(401).send({ message: "Invalid username or password", success: false });
        }
    } catch (err) {
        console.error("Error during authentication:", err);
        return res.status(500).send({ message: "Internal server error", success: false });
    }
})

server.get('/about', (req, res) => { 

    res.render('./layouts/user-base', {data: {}, 
                                       other: {view: "user_about"}})
})

server.get('/recipes', (req, res) => {
    let recipes = `SELECT * FROM ${process.env.DB_TABLE_RECIPES} WHERE is_active = 1`
    
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
                categories = await queryDb(`SELECT * FROM ${process.env.DB_TABLE_CATEGORIES} WHERE is_general = 1`)
                break;
            case "active":
                categories = await queryDb(`SELECT * FROM ${process.env.DB_TABLE_CATEGORIES} WHERE is_active = 1`)
                break;
            default:
                categories = await queryDb(`SELECT * FROM ${process.env.DB_TABLE_CATEGORIES}`)
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
                dataType = await queryDb(`SELECT * FROM ${process.env.DB_TABLE_USERS}`)
                break;
            case 'categories':
                dataType = await queryDb(`SELECT * FROM ${process.env.DB_TABLE_CATEGORIES}`)
                break;
            case "recipes":
                dataType = await queryDb(`SELECT * FROM ${process.env.DB_TABLE_RECIPES}`)
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

        const updatedUser = await queryDb(`UPDATE ${process.env.DB_TABLE_USERS}
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
                dataType = await queryDb(`UPDATE ${process.env.DB_TABLE_USERS}
                                          SET username = ?, email = ?, password = ?, first_name = ?, 
                                          last_name = ?, profile_picture = ?, biography = ?, country = ?, last_updated = ?
                                          WHERE id = ?`, [username, email, password, first_name, last_name, profile_picture, biography, country, last_updated, userId])
                break;
            case 'categories':
                dataType = await queryDb(`DELETE FROM ${process.env.DB_TABLE_CATEGORIES}
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
                dataType = await queryDb(`DELETE FROM ${process.env.DB_TABLE_USERS}
                                          WHERE id = ?`, [rowId])
                break;
            case 'categories':
                dataType = await queryDb(`DELETE FROM ${process.env.DB_TABLE_CATEGORIES}
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


server.listen(process.env.HOST_PORT, () => {
    console.log(`Server is running on port http://localhost:${process.env.HOST_PORT}`)
});

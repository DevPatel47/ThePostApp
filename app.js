const express = require('express');
const app = express();
const userModel = require('./models/user');
const postModel = require('./models/post');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mangoose = require('mongoose');

console.log('my new http server');

const PORT = 3100;

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get('/', isLoggedIn, (req, res) => {
    res.render('home', { user: req.user });
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.get('/register', (req, res) => {
    res.render('register');
});

app.post('/register', async (req, res) => {
    const { username, name, password, email, age } = req.body;

    try {
        // Check if username already exists
        if (await userModel.findOne({ username })) {
            return res.status(400).send('Username already exists');
        }

        // Check if email already exists
        if (await userModel.findOne({ email })) {
            return res.status(400).send('Email already exists');
        }

        // Check age restriction
        if (age < 18) {
            return res.status(400).send('You must be at least 18 years old to register');
        }

        // Check password length
        if (password.length < 8) {
            return res.status(400).send('Password must be at least 8 characters long');
        }

        // Hash password with bcrypt
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);

        // Create new user object
        const user = new userModel({
            username,
            name,
            password: hash,
            email,
            age
        });

        // Save the user to the database
        await user.save();

        // Generate JWT token
        let token = jwt.sign({ username: user.username, userid: user._id }, "AnySecretKey");

        // Set cookie with token
        res.cookie('token', token, { httpOnly: true });

        // Redirect to home page
        return res.redirect('/');
        
    } catch (err) {
        console.error(err);
        return res.status(500).send('Internal Server Error');
    }
});


app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Find user by username
        const user = await userModel.findOne({ username });
        
        if (!user) {
            return res.status(400).send('Invalid username or password');
        }

        // Compare password with the hashed password
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).send('Invalid username or password');
        }

        // Generate JWT token
        let token = jwt.sign({ username: user.username, userid: user._id }, "AnySecretKey");

        // Set cookie with token
        res.cookie('token', token, { httpOnly: true });

        // Redirect to home page
        return res.redirect('/');

    } catch (err) {
        console.error(err);
        return res.status(500).send('Internal Server Error');
    }
});

app.get('/logout', async (req, res) => {
    res.clearCookie('token');
    res.redirect('/login');
});

function isLoggedIn(req, res, next) {
    const token = req.cookies.token;
    if (token) {
        jwt.verify(token, "AnySecretKey", (err, decoded) => {
            if (err) {
                return res.status(401).send('Unauthorized');
            }
            req.user = decoded;
            next();
        });
    } else {
        res.redirect('/login');
    }
}

mangoose.connect("mongodb://127.0.0.1:27017/ThePostApp");
console.log('Connected to Database');

app.listen(PORT);
console.log(`Server is running on port ${PORT}`);
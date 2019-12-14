require('dotenv').config();
const express = require('express');
const cors = require('cors');
const massive = require('massive');
const { json } = require('body-parser');
const session = require('express-session');
const passport = require('passport');
//creates server
const app = express();
//creates port for server
const port = 3001;
const { getUser, strat, logout } = require(`${__dirname}/controllers/userController`);
//other users cant hit our routes
app.use(cors());
//parses json
app.use(json());


//connects to db
massive(process.env.CONNECTION_STRING).then((dbinstance) => {
	app.set('db', dbinstance);
});

//brings sessions
app.use(
	session({
		secret: process.env.SESSION_SECRET,
		resave: false,
		saveUninitialized: false
	})
);

//functions for passport
app.use(passport.initialize());
app.use(passport.session());
passport.use(strat);

// What properties do we want our user to have on session?
passport.serializeUser((profile, done) => {
	console.log(profile);
	const db = app.get('db');
	db.getUserByAuthid(profile.id).then((user) => {
		// console.log(profile.name);
		if (!user[0]) {
			db
				.addUserByAuthid(profile.name.givenName,profile.name.familyName,profile.id,profile.picture)
				.then((response) => {
					return done(null, response[0]);
				})
				.catch((err) => console.log(err));
		} else {
			return done(null, user[0]);
		}
	});
});

// Put user on req.session
passport.deserializeUser((user, done) => {
	done(null, user);
});

app.get(
	'/login',
	passport.authenticate('auth0', {
		successRedirect: 'http://localhost:3000/',
		failureRedirect: 'http://localhost:3000/#/'
	})
);

app.use((req, res, next) => {
	if (!req.session.cart) req.session.cart = [];
	next();
});
app.get('/me', getUser);
app.get('/logout', logout);

//listens to server
app.listen(port, () => {
	console.log(`app is listening on port ${port}`);
});

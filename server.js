
const express = require('express'); /*creating an express constant, requiring express */
const path= require('path');
const bodyParser = require('body-parser');  /* warns to server what it is getting sent, in this case, it's a json */
const app = express();  /*starting a new app*/

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow_Origin', 'http://localhost:3000');
    res.setHeader('Access-Control-Allow_Origin', 'Content-type,Authorization');
    next();
});

const jwt = require('jsonwebtoken');    /*in the if statement below. Import it in the terminal as well. Creates a web token by the login*/

const { expressjwt: exjwt } = require('express-jwt'); /* using to validate to protect a route  */

const PORT = 3000;

app.use(bodyParser.json()); /*this whole app(application) will be parsing the body of a json */
app.use(bodyParser.urlencoded( { extended: true }));

const secretKey = 'My super secret key';

const jwtMW = exjwt( {
    secret: secretKey,
    algorithms: ['HS256']
});

let users = [
    {
        id: 1,
        username: 'Kelsey',
        password: 123
    }, 
    {
        id: 2,
        username: 'Kornegay',
        password: '456'
    }
];

app.post('/api/login', (req, res) => {  /*A new endpoint expecting a post request, (index at axios.post) at the api/login address*/
    const { username, password } = req.body;
    let token;
for (let user of users) {   
    if (username == user.username && password == user.password) {
        token = jwt.sign({ id: user.id, username: user.username }, secretKey, { expiresIn: '180s' });
            break;
        }
    }  
        if (token) {
            res.json({
                success: true,
                err: null,
                token
                
            });
            
        }
        else {
            res.status(401).json({
                success: false,
                token: null,
                err: 'Username or password is incorrect'
            });
        }
        
});
/*for every user inside my users(let users above), I am going to check if the username that was passed onn the post request as a data matches the username AND matches the password. If there is a match between both, I create a token and then respond(res) this call with json that says success true, err null, token. If it doesn't match, gives a status 401 and an error message*/


app.get('/api/dashboard', jwtMW, (req, res) => {
    console.log(req);
    res.json( {
        success: true,
        myContent: 'Secret content that only logged in people can see!!!'
    });
}); /*Creates a protected route called dashboard, and on this dashboard route, I'm using jwtMD as a middle err that is defined under port above.This route, api/dashboard, will only be accessible if the person has a valid jwt. If the person is capable of coming inside this route, they get a response with the secret text */

app.get('/api/prices', jwtMW, (req, res) => {
    console.log(req);
    res.json( {
        success: true,
        myContent: 'This is the price $3.99'
    });
});


app.get('/api/settings', jwtMW, (req, res) => {
    console.log(req);
    res.json( {
        success: true,
        myContent: 'Settings Page: Only accessible to authenticated users!'
    });
});


app.get('/', (req, res) => {       
    res.sendFile(path.join(__dirname, 'index.html'));   /*If I go to the root address, I get served an index.html file. Using path package from NodeJS. I ma getting the directory that I am currently in, and then join with the file name. */
});

app.use(function (err, req, res, next) {    
    console.log(err.name === 'UnauthorizedError');
    console.log(err);
    if (err.name === 'UnauthorizedError') {
        res.status(401).json( {
            success: false,
            officialError: err,
            err: 'Username or password is incorrect 2'
        });
    } else {
        next(err);
    }
}); /*if the web token fails in the app.get(api/dashboard) above, it has an error that is equal to unauthorized error. */


app.listen(PORT, () => {        /*the app is listening on the port 3000 */
    console.log(`Serving on port ${PORT}`);
}); 
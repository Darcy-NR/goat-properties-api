require("dotenv").config()

//Initialize MySQL
const mysql = require('mysql');

//Setting connection variables to a mysql connection function completely insecure but this is a demo.
var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "goat_realestate",
});

//Initializing bcrypt
const bcrypt = require('bcrypt');

//Initializing JSONwebtokens
const jwt = require('jsonwebtoken');

//Connection error check
con.connect(function(err) {
if (err) throw err;
console.log("Connected!");
});

//Initialize Express Apps
const express = require('express');
const app = express();
const { check, body, validationResult } = require('express-validator');



const PORT = 5500;

//Import JSON parser middleware
app.use(express.json());

//Catch for API access at wrong gateway

app.get('/', (req, res) => {
    res.status(400).json({
        Message: "Wrong API access gateway, please head to /~/properties to access API gateways -- please refer to [OPTIONS:/properties] if you need assistance",
    })
});

  //             //
 //GET ENDPOINTS//
//             //

//----//
//GET all properties in database -- or get singular property based on id//
//----//

app.get('/properties', (req, res) => {

    //Set this variable to the result of URI query string
    const prop_id = req.query.id;

    //If there is nothing there, then run SELECT * query
    if (!prop_id) {
        con.query("SELECT * FROM properties", function (err, result, fields) {
          if (err) throw err;
          res.status(200).json({result})
        });
    } else {
        //If there is an ID then query the database where property id = the query id
        con.query("SELECT * FROM properties WHERE property_id = " + prop_id, function (err, result, fields) {
        if (err) throw err;
        res.status(200).json({result})
        });

    }

});

//----//
//GET properties in database based on category ID//
//----//


/*If user attempts /~/properties/type without providing category ID as parameter
send them a 400 and tell them to provide it. */
app.get('/properties/type', (req, res) => {
      res.status(400).send({message: 'Please provide a category ID as type parameter -- Please refer to [OPTIONS:/properties] if you need help.'})
});

/*Otherwise run the query based on parameter input */
app.get('/properties/type/:category', (req, res) => {

    const { category } = req.params;

    con.query("SELECT * FROM properties WHERE category_id = " + category, function (err, result, fields) {
      if (err) throw err;
      res.status(200).json({result})
    });

});


//----//
//GET properties in database based on city ID//
//----//


/*If user attempts /~/properties/city without providing city ID as parameter
send them a 400 and tell them to provide it. */
app.get('/properties/city', (req, res) => {
    res.status(400).send({message: 'Please provide a city ID as city parameter -- Please refer to [OPTIONS:/properties] if you need help.'})
});

/*Otherwise run the query based on parameter input */
app.get('/properties/city/:city', (req, res) => {

  const { city } = req.params;

  con.query("SELECT * FROM properties WHERE city_id = " + city, function (err, result, fields) {
    if (err) throw err;
    res.status(200).json({result})
  });

});


  //              //
 //POST ENDPOINTS//
//              //

app.post('/properties/add-property', authenticateToken, (req, res) => {
//Read client JSON and assign values to constants, with the exception of ID which is auto-increment so don't give the client the option and just assign it a null variable
    const { property_id } = "";
    const { property_address } = req.body;
    const { property_price } = req.body;
    const { category_id } = req.body;
    const { city_id } = req.body;

    //First validator to check if the provided constants that are not numbers
    if ( isNaN(property_price) || isNaN(category_id) || isNaN(city_id) ) {
        res.status(400).json({
            message: "Please ensure [property_price], [category_id], and [city_id] are numbers"
        })
    } else {
    //Second Validator layer, check if user has tried to input id's above the maximum, if yes reject
        if (category_id > 4 || city_id > 3) {
            res.status(400).json({
                message: "Please ensure [category_id], and [city_id] are valid ID numbers, check [OPTIONS:/properties/add-property] if you need help "
        })
        } else {
        //All fields are required to run the SQL query, so check if all constant's are assigned
            if ( property_address && property_price && category_id && city_id ) {
                //If true, return 200 and send confirmation JSON to client, run SQL query via prepared statements 
                con.query("INSERT INTO properties (property_id, property_address, property_price, category_id, city_id) VALUES ('" + property_id + "', ?, ?, ?, ?)", [property_address, property_price, category_id, city_id], function (err, result, fields) {    
                    if (err) throw err;
                    res.status(200).json({
                        message: "Row successfully added to database."
                    })
                });
            } else {
                //else return 406, tell client to check their syntax/JSON
                res.status(406).json({
                    message: 'There is an error with your json. All column fields are required to send, please refer to [OPTIONS:/properties/add-property] for database input syntax.',

                })
            }
        }
    }
});

app.post('/properties/inquire', (req, res) => {
    //Read client JSON and assign values to constants, with the exception of inquiry ID which is auto-increment so don't give the client the option and just assign it a null variable
    //API gets inquiry from the gateway, and expects to receive a query string for the ID, so run a check to make sure it gets it.

        const { inquiry_id } = "";
        const property_id = req.query.property;
        const { inquiry_name } = req.body;
        const { inquiry_email } = req.body;
        const { inquiry_message } = req.body;

if (property_id) {
    //All fields are required to run the SQL query, so check if all constant's are assigned
        if ( inquiry_name && inquiry_email && inquiry_message ) {
            //If true, return 200 and send confirmation JSON to client, send inquiry via prepared statement
            con.query("INSERT INTO inquiry (inquiry_id, property_id, name, email, message) VALUES ('" + inquiry_id + "', ?, ?, ?, ?)",[property_id, inquiry_name, inquiry_email, inquiry_message], function (err, result, fields) {
                if (err) throw err;
                res.status(200).json({
                    message: "Thank you || Inqury received, you will hear from us within 24-48 hours."
                })
              });
        } else {
            //else return 406, tell client to check their syntax/JSON
            res.status(406).json({
                message: 'There is an error with your json. All fields are required to send, please refer to [OPTIONS:/properties/inquire] for database input syntax.',
                server_message_01: inquiry_name,
                server_message_02: inquiry_email,
                server_message_03: inquiry_message,
                server_message_04: property_id
    
            })
        }
    } else {
        res.status(400).json({
            message: "You need to provide the property ID as the query string in order to inquire, please refer to [OPTIONS:/properties/inquire] for database input syntax."
        })
    }
    
    });


  //                //
 //UPDATE ENDPOINTS//
//                //


//Catch for attempts to access the page without providing a property ID

app.put('/properties/update-property', (req, res) => {
    res.status(400).send({
        message: 'Please provide the id number of the property to update -- Please refer to [OPTIONS:/properties/update-property] if you need help.'
    })
});

app.patch('/properties/update-property', (req, res) => {
    res.status(400).send({
        message: 'Please provide the id number of the property to update -- Please refer to [OPTIONS:/properties/update-property] if you need help.'
    })
});


app.put('/properties/update-property/:property_id', authenticateToken, (req, res) => {
    
    //Assign all fields to json, and property ID to request parameter
    const { property_id } = req.params;
    const { property_address } = req.body;
    const { property_price } = req.body;
    const { category_id } = req.body;
    const { city_id } = req.body;

    //First validator to check if the provided constants that are not numbers
    if ( isNaN(property_price) || isNaN(category_id) || isNaN(city_id) ) {
        res.status(400).json({
            message: "Please ensure [property_price], [category_id], and [city_id] are numbers"
        })
    } else {
    //Second Validator layer, check if user has tried to input id's above the maximum, if yes reject
            if (category_id > 4 || city_id > 3) {
                res.status(400).json({
                    message: "Please ensure [category_id], and [city_id] are valid ID numbers, check [OPTIONS:/properties/add-property] if you need help "
            })
            } else {
            

                //All fields are required to run the SQL query, so check if all constant's are assigned
                    if ( property_address && property_price && category_id && city_id ) {
                        //If true, return 200, update row, and send confirmation JSON to client query db with prepared statement
                        con.query("UPDATE properties SET property_address = ?, property_price = ?, category_id = ?, city_id = ? WHERE property_id = '"+ property_id + "'", [property_address, property_price, category_id, city_id], function (err, result, fields) {
                            if (err) throw err;
                            res.status(200).json({
                                message: "Row successfully updated."
                            })
                        });
                    } else {
                        //else return 406, tell client to check their syntax/JSON
                        res.status(406).json({
                            message: 'There is an error with your json. All column fields are required to send, please refer to [OPTIONS:/properties/update-property] for database input syntax.',
                
                        })
                    }
            }
        }
    });

    //Repeat for pretty much everything but with patch as the verb
    app.patch('/properties/update-property/:property_id', authenticateToken, (req, res) => {
    
        //Assign all fields to json, and property ID to request parameter
        const { property_id } = req.params;
        const { property_address } = req.body;
        const { property_price } = req.body;
        const { category_id } = req.body;
        const { city_id } = req.body;
    
        //First validator to check if the provided constants that are not numbers
        if ( isNaN(property_price) || isNaN(category_id) || isNaN(city_id) ) {
            res.status(400).json({
                message: "Please ensure [property_price], [category_id], and [city_id] are numbers"
            })
        } else {
        //Second Validator layer, check if user has tried to input id's above the maximum, if yes reject
                if (category_id > 4 || city_id > 3) {
                    res.status(400).json({
                        message: "Please ensure [category_id], and [city_id] are valid ID numbers, check [OPTIONS:/properties/add-property] if you need help "
                })
                } else {
                
    
                    //All fields are required to run the SQL query, so check if all constant's are assigned
                        if ( property_address && property_price && category_id && city_id ) {
                            //If true, return 200, update row, and send confirmation JSON to client query db with prepared statement
                            con.query("UPDATE properties SET property_address = ?, property_price = ?, category_id = ?, city_id = ? WHERE property_id = '"+ property_id + "'", [property_address, property_price, category_id, city_id], function (err, result, fields) {
                                if (err) throw err;
                                res.status(200).json({
                                    message: "Row successfully updated."
                                })
                            });
                        } else {
                            //else return 406, tell client to check their syntax/JSON
                            res.status(406).json({
                                message: 'There is an error with your json. All column fields are required to send, please refer to [OPTIONS:/properties/update-property] for database input syntax.',
                    
                            })
                        }
                }
            }
        });

  //                //
 //DELETE ENDPOINTS//
//                //

app.delete('/properties/delete-property', (req, res) => {
    res.status(400).json({
        Message: 'Please provide a property id for the property you wish to delete, please refer to [OPTIONS:/properties/delete-property] for syntax.'
    })
});

app.delete('/properties/delete-property/:property_id', authenticateToken, (req, res) => {
    
    const { property_id } = req.params;
    con.query("DELETE FROM properties WHERE property_id = '?' ", [property_id], function (err, result, fields) {
    // con.query("DELETE FROM properties WHERE property_id = '"+ property_id + "' ", function (err, result, fields) {
        if (err) throw err;
        res.status(200).json({
            message: "Row successfully deleted."
        })
      });

});

  //              //
 //CORS ENDPOINTS//
//              //

//Main menu//
app.options('/properties', (req, res) => {
    res.status(200).json({
        Welcome: 'WELCOME TO GOAT REAL ESTATE.',
        server_message_01: '=> POST, PUT/PATCH, and DELETE API reads via JSON, syntax for requests is important so please take care to ensure JSON syntax on particular requests is set.',
        server_message_02: '=> Authentication is done via bearer token authorization headers, please log in to a staff account to receive your token',
        server_message_03: '=> To return all properties currently in the database -- [GET:/properties]',
        server_message_04: '=> --------------',
        server_message_05: '=> To return a single property attach property_id in URI query string for id -- [GET:/properties?id=x]',
        server_message_06: '=> --------------',
        server_message_07: '=> To return properties by category -- [GET:/properties/type/x]',
        server_message_08: '=> ||1: Purchases || 2: Rentals || 3: Land || 4: House and Land Packages ||',
        server_message_09: '=> --------------',
        server_message_10: '=> To return properties by city -- [GET:/properties/city/x]',
        server_message_11: '=> ||1: Sydney || 2: Brisbane || 3: Melbourne ||',
        server_message_12: '=> --------------',
        server_message_13: '=> [OPTIONS] headers will assist with syntax on all other gateways',
        server_message_14: '=> --------------',
        server_message_15: '=> Other gateways:',
        server_message_16: '=> [POST:/properties/add-propety]',
        server_message_17: '=> [PUT/PATCH:/properties/update-property]',
        server_message_18: '=> [DELETE:/properties/delete-properties]',
        server_message_19: '=> [POST:/user/login]',
    })
});

//Add Menu//
app.options('/properties/add-property', (req, res) => {
    res.status(200).json({
        server_message_01: '=> Authentication is required to add properties',
        server_message_02: '=> To add a property to the database -- [POST:/properties/add-property]',
        server_message_03: '=> IMPORTANT: Ensure that POST body is in JSON as follows, all fields require data to be valid JSON.',
        server_message_04: '---------------------',
        property_address: "EXAMPLE STREET",
        property_price: "000000.00",
        category_id: "0",
        city_id: "0",
        server_message_05: '---------------------',
        server_message_06: '=> category_id: || 1: Purchases || 2: Rentals || 3: Land || 4: House and Land Packages ||',
        server_message_09: '=> city_id: || 1: Sydney || 2: Brisbane || 3: Melbourne ||',
    })
});

//Delete Menu//
app.options('/properties/delete-property', (req, res) => {
    res.status(200).json({
        server_message_01: '=> Authentication is required to delete properties',
        server_message_02: '=> To delete a property -- [DELETE:/properties/delete-property/x]',
        server_message_03: '=> Where x, replace with the property_id of the property you wish to delete.',
    })
});

//Update Menu//
app.options('/properties/update-property', (req, res) => {
    res.status(200).json({
        server_message_01: '=> Authentication is required to update properties',
        server_message_02: '=> To update a property -- [PUT/PATCH:/properties/update-property/x]',
        server_message_03: '=> Where x, replace with the property_id of the property you wish to update',
        server_message_04: '=> IMPORTANT: Ensure that UPDATE body is in JSON as follows, all fields require data to be valid JSON.',
        server_message_05: '---------------------',
        property_address: "EXAMPLE STREET",
        property_price: "000000.00",
        category_id: "0",
        city_id: "0",
        server_message_06: '---------------------',
        server_message_07: '=> category_id: || 1: Purchases || 2: Rentals || 3: Land || 4: House and Land Packages ||',
        server_message_08: '=> city_id: || 1: Sydney || 2: Brisbane || 3: Melbourne ||',
    })
});

//Update Menu//
app.options('/properties/inquire', (req, res) => {
    res.status(200).json({
        server_message_01: '=> Method by which to contact GOAT Real Estate about a certain property',
        server_message_02: '=> To inquire about a property -- [POST:/properties/inquire?property=x]',
        server_message_03: '=> Where x, replace with the property_id of the property you wish to enquire about',
        server_message_04: '=> IMPORTANT: Ensure that POST body is in JSON as follows, all fields require data to be valid JSON.',
        server_message_05: '---------------------',
        inquiry_name: "John Smith",
        inquiry_email: "email@email.com",
        inquiry_message: "Lorem Ipsum",
        server_message_06: '---------------------',
        server_message_07: '=> In order to find property id, query through [GET:/properties] gateways ',
    })
});

//User Menu//
app.options('/user', (req, res) => {
    res.status(200).json({
        server_message_01: '=> Staff login section',
        server_message_02: '=> To login -- [POST:/user/login]',
        server_message_03: '=> Staff to provide username and password in JSON files and are presented their authorization headers',
        server_message_04: '=> IMPORTANT: Ensure that POST body is in JSON as follows, all fields require data to be valid JSON.',
        server_message_05: '---------------------',
        username: "username",
        password: "password",
        server_message_06: '---------------------',
    })
});


  //              //
 //USER ENDPOINTS//
//              //

//User creation system, this doesn't actually go anywhere, it just outputs to the console so it can be added to the staff table manually//
//User creation system like this was a little outside the scope of the project as the project only really needs a handful of staff accounts//

app.post('/user/create', async (req, res) => {

    const { username } = req.body;
    const { password } = req.body;

    try {
        const salt = await bcrypt.genSalt()
        const hashedPassword = await bcrypt.hash(password, salt)
        res.status(200).json ({
            username: username,
            salt: salt,
            Password: hashedPassword,
        })
    } catch {
        res.status(500).json()
    }

})

//Login system//

//User provides their username and password via json
app.post('/user/login', async (req, res) => {

//Write them to variables
    const { username } = req.body;
    const { password } = req.body;

    try {
        //Now take those variables, query the database for a user with that username
        con.query("SELECT password FROM staff WHERE username = '" + username + "'", async function (err, result, fields) {
            if (err) throw err;
                if (!result) {
                    //If there is no results then refuse and return this rejection
                    res.status(404).json({message: 'Could not find a staff member with that username'});
                } else {
                    //Else the staff does exist and now we can check passwords, write json object to use as a cryptographic token in JWT
                    //Take the password recieved from the database and write it to a variable
                    const user = { username: username}
                    const db_pass = result[0].password;
                    
                    //Run bcrypt compare on database password and provided plaintext password
                    if (await bcrypt.compare(password, db_pass) === true ) {
                        //if true, user is valid, run JWT, assign username object to the secret token and generate a token for them
                        const accessToken = jwt.sign(user, `${process.env.ACCESS_TOKEN_SECRET}`);

                        res.status(200).json({
                            server_message_01: 'Login successful',
                            server_message_02: 'Please find your authentication token below',
                            accessToken: accessToken,                            
                        })
                    } else {
                        //Password was invalid so return a status and tell them that.
                        res.status(403).json({
                            message: 'Password is invalid',
                        })
                    }
                }
          });
    } catch {
        //Failsafe response if the SQL query fails, returns 500
        res.status(500).json()
    }
})





  //        //
 //LISTENER//
//        //

app.listen(
    PORT,
    () => console.log(`Listening in on http://localhost:${PORT}`)
);


  //             //
 //AUTHENTICATOR//
//             //

//This function is passed in as middleware to the routes that require it

function authenticateToken(req, res, next) {
    //Assign variables, req.header is set
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    //If the user didn't provide a token then they are told they aren't authorized, return a 401
    if (token == null) { 
        return res.status(401).json({
            server_message: "You aren't authorized to access this content.",
        })
    }

    //If the user did provide a token, and it isn't a valid token, then return this header
    jwt.verify(token, `${process.env.ACCESS_TOKEN_SECRET}`, (err, user) => {
        if (err) {
            return res.status(403).json({server_message: "your token is not valid"})
        }
        next()
    })
}


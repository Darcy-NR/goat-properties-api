
//Initialize MySQL
const mysql = require('mysql');

//Setting connection variables to a mysql connection function
var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "goat_realestate",
});

//Connection error check
con.connect(function(err) {
if (err) throw err;
console.log("Connected!");
});

//Initialize Express Apps
const express = require('express');
const app = express();

const PORT = 5500;

//Import JSON parser middleware
app.use(express.json());

//URL encoded body middleware
// app.use(
//     express.urlencoded({
//         extended: true,
//     })
// );



//Catch for API access at wrong gateway

app.get('/', (req, res) => {
    res.status(200).send({
        Message: 'You\'re in the wrong place homesprung',
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
      res.status(400).send({message: 'Please provide a category ID as type parameter.'})
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
    res.status(400).send({message: 'Please provide a city ID as city parameter.'})
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

app.post('/properties', (req, res) => {
    res.status(200).send({
        thisIsA: 'test',
        thisIsOnly: 'A test',
        typeOfVerb: 'POST'
    })
});




app.put('/properties', (req, res) => {
    
    res.status(200).send({
        thisIsA: 'test',
        thisIsOnly: 'A test',
        typeOfVerb: 'PUT'
    })
});

app.patch('/properties', (req, res) => {
    res.status(200).send({
        thisIsA: 'test',
        thisIsOnly: 'A test',
        typeOfVerb: 'PATCH'
    })
});

app.delete('/properties', (req, res) => {
    res.status(200).send({
        thisIsA: 'test',
        thisIsOnly: 'A test',
        typeOfVerb: 'DELETE'
    })
});

app.options('/properties', (req, res) => {
    res.status(200).send({
        thisIsA: 'test',
        thisIsOnly: 'A test',
        typeOfVerb: 'DELETE'
    })
});


//LISTENER EVENT

app.listen(
    PORT,
    () => console.log(`Listening in on http://localhost:${PORT}`)
);
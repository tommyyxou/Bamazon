var mysql = require("mysql");
var {table} = require("table");
require('dotenv').config()

var connection = mysql.createConnection({
    host: "localhost",

    // Your port; if not 3306
    port: 3306,

    // Your username
    user: process.env.WEBSITE_USER,

    // Your password
    password: process.env.WEBSITE_PASSWORD,
    database: "bamazon"
});

connection.connect(function(err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId + "\n");
    managerMenu ();
});

let inquirer = require('inquirer');

function managerMenu () {

    inquirer.prompt({
            type: 'list',
            name: 'choice',
            message: "Management Menu!",
            choices: ['View Products for Sale',
                      'View Low Inventory',
                      'Add to Inventory',
                      'Add New Product']
        })
        .then(answers => {
            menuOptions (answers.choice);
        });
}

function menuOptions (choice) {
    if (choice === "View Products for Sale") {
        displaySale ();
    };
    if (choice === "View Low Inventory") {
        displayLow ();
    };
    if (choice === "Add to Inventory") {
        addInventory ();
    };
    if (choice === "Add New Product") {
        addProduct ();
    };
}

function displaySale () {
    let tableArray = [["---Item Id---","---Production Name---","---Department Name---","---Price---","---Stock Quantity---","---Product Sales---"]];

    connection.query(
    " SELECT * FROM products;",
    function(err, res) {
        if (err) throw err;
        for (let i = 0; i < res.length; i++) {
            let item = res[i];
            tableArray.push([item.item_id, item.product_name, item.department_name, item.price, item.stock_quantity,item.product_sales]);
        };
        console.log (table(tableArray));
        connection.end();
    });
}

function displayLow () {
    let tableArray = [["---Item Id---","---Production Name---","---Department Name---","---Price---","---Stock Quantity---"]];

    connection.query(
    " SELECT * FROM products where stock_quantity < 100;",
    function(err, res) {
        if (err) throw err;
        for (let i = 0; i < res.length; i++) {
            let item = res[i];
            tableArray.push([item.item_id, item.product_name, item.department_name, item.price, item.stock_quantity]);
        };
        console.log (table(tableArray));
        connection.end();
    });
}

function addInventory () {

    inquirer.prompt([
        {
        type: 'input',
        name: 'id',
        message: 'Please Enter Item Id for the item you would like to add inventory'
        },{
        type: 'input',
        name: 'quantity',
        message: 'Please Enter Quantity for the item you would like to add inventory'   
        }
    ]).then(answers => {
        id = answers.id;
        quantity = answers.quantity;

        checkQuantity (id, quantity);
    });

    function checkQuantity (id, quantity) {
        //console.log (quantity);
        connection.query(
            "SELECT * FROM bamazon.products where item_id = " + id + ";",
                function(err, res) {
                    if (err) throw err;
                    for (let i = 0; i < res.length; i++) {
                        if (quantity < 0) {
                            quantity = quantity * -1;
                        }
                        let updateQuantity = null;
                        updateQuantity = res[i].stock_quantity + parseInt(quantity);
                        updateProduct (id, updateQuantity);
                        console.log ("You have sucessfully Added " + quantity + " " + res[i].product_name + " to inventory")
                    }
                });
    };

    function updateProduct(id, quantity) {
        connection.query(
            "UPDATE products SET ? WHERE ?",
            [
                {
                stock_quantity: quantity
                },
                {
                item_id: id
                }
            ],
            function(err, res) {
                if (err) throw err;
                console.log(res.affectedRows + " products updated!\n");
                connection.end();
            });
    }
}

function addProduct () {
    inquirer.prompt([
        {
            type: 'input',
            name: 'product_name',
            message: 'Please Enter Product name of new product'
        },{
            type: 'input',
            name: 'department_name',
            message: 'Please Enter Department of new product'   
        },{
            type: 'input',
            name: 'price',
            message: 'Please Enter Price of new product'   
        },{
            type: 'input',
            name: 'stock_quantity',
            message: 'Please Enter Stock quantity of new product'   
        }
    ]).then(answers => {
        product_name = answers.product_name;
        department_name = answers.department_name;
        price = answers.price;
        stock_quantity = answers.stock_quantity;

        newProduct (product_name, department_name, price, stock_quantity);
    });

    function newProduct (product_name, department_name, price, stock_quantity) {
        let query = connection.query(
            "INSERT INTO products SET ?",
            {
                product_name: product_name,
                department_name: department_name,
                price: price,
                stock_quantity: stock_quantity 
            },
            function(err, res) {
                if (err) throw err;
                console.log(res.affectedRows + " products updated!\n");
                connection.end();
            });

        //console.log (query.sql);
    };
}
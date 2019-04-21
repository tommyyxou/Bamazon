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
    
});

let tableArray = [["---Item Id---","---Production Name---","---Department Name---","---Price---","---Stock Quantity---"]];

connection.query(
    " SELECT * FROM products;",
    function(err, res) {
        if (err) throw err;
        for (let i = 0; i < res.length; i++) {
            let item = res[i];
            tableArray.push([item.item_id, item.product_name, item.department_name, item.price, item.stock_quantity]);
        };
        console.log (table(tableArray));
        display();
    });
  
function display () {
    let inquirer = require('inquirer');

    inquirer.prompt([
        {
        type: 'input',
        name: 'id',
        message: 'Please Enter Item Id for the item you would like to purchase'
        },{
        type: 'input',
        name: 'quantity',
        message: 'Please Enter Quantity for the item you would like to purchase'   
        }
    ]).then(answers => {
        id = answers.id;
        quantity = answers.quantity;
        checkQuantity (id, quantity);
    });
};

function checkQuantity (id, quantity) {
    connection.query(
        "SELECT * FROM bamazon.products where item_id = " + id + ";",
            function(err, res) {
                if (err) throw err;
                for (let i = 0; i < res.length; i++) {
                    if (quantity < 0) {
                        quantity = quantity * -1;
                    }
                    if (quantity < res[i].stock_quantity) {
                        updateQuantity = res[i].stock_quantity - quantity;
                        productSales = res[i].product_sales + quantity*res[i].price;
                        updateProduct (id, updateQuantity,productSales);
                        console.log ("You have sucessfully purchased " + quantity + " " + res[i].product_name + " @ " + res[i].price + "/unit.")
                        console.log ("Total: $",  quantity * res[i].price);
                    } else {
                        console.log ("Insufficient quantity!");
                        connection.end();
                    }
                    
                }
            });
};

function updateProduct(id, quantity, productSales) {
    connection.query(
        "UPDATE products SET ?, ? WHERE ?",
        [
            {
                stock_quantity: quantity
            },{
                product_sales: productSales
            },{
                item_id: id
            }
        ],
        function(err, res) {
            if (err) throw err;
            console.log(res.affectedRows + " products updated!\n");
            connection.end();
        }
    );
};
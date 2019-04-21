var mysql = require("mysql");
var {table} = require("table");
require('dotenv').config();

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
            choices: ['View Product Sales by Department',
                      'Create New Department']
        })
        .then(answers => {
            menuOptions (answers.choice);
        });
};

function menuOptions (choice) {
    if (choice === "View Product Sales by Department") {
        displaySales ();
        
    };
    if (choice === "Create New Department") {
        addDepartment ();
    };
};

function displaySales () {
    let tableArray = [["---Department Id---","---Department Name---","---Over Head Cost---","---Product Sales---","---Total Profit---"]];

    connection.query(
        "SELECT departments.department_id, departments.department_name, departments.over_head_costs, SUM(products.product_sales) AS product_sales from departments " + 
        "LEFT JOIN products on products.department_name = departments.department_name " + 
        "GROUP BY department_name;",
    function(err, res) {
        if (err) throw err;
        for (let i = 0; i < res.length; i++) {
            let department = res[i];
            profit = department.product_sales - department.over_head_costs;
            tableArray.push([department.department_id, department.department_name, department.over_head_costs, department.product_sales, profit]);
        };
        console.log (table(tableArray));
        connection.end();
    });
};

function addDepartment () {
    inquirer.prompt([
        {
            type: 'input',
            name: 'department_name',
            message: 'Please Enter Name of new Department'   
        },{
            type: 'input',
            name: 'over_head_costs',
            message: 'Please Enter over head cost of new Department'   
        }
    ]).then(answers => {
        department_name = answers.department_name;
        over_head_costs = answers.over_head_costs;

        newProduct (department_name, over_head_costs, 0, 0);
    });

    function newProduct (department_name, over_head_costs, product_sales, total_profit) {
        let query = connection.query(
            "INSERT INTO departments SET ?",
            {
                department_name: department_name,
                over_head_costs: over_head_costs,
                product_sales: product_sales,
                total_profit:  total_profit
            },
            function(err, res) {
                if (err) throw err;
                connection.end();
            });

        console.log (query.sql);
    };
};


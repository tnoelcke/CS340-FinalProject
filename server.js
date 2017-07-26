//Author: Thomas Noelcke
//CS340 Winter of 2017
//Final Project

//sets up variables for the file names and directories to 
//nav file system.
var fs = require('fs');
var path = require('path');
var express = require('express');
var handlebars = require('express-handlebars');
var bodyParser = require('body-parser');
var mysql = require('mysql');

//set up handleBars
var app = express();
var port = process.env.PORT || 3000;

app.set('port', port);
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());

app.engine('handlebars', handlebars({ defaultLayout: 'main'}));
app.set('view engine', 'handlebars');
app.set('views' , path.join(__dirname, 'views'));


//sets up SQLDB.

var host = "mysql.cs.orst.edu"; //im not sure yet i will have to look.
var user = "cs340_noelcket"; 
var myPassword = '9959';
var db = "cs340_noelcket";

//var host = 'localhost';
//var user = 'noelcket';
//var myPassword = 'noelcket1101';
//var db = 'cs340_final';
var mysqlConnection = mysql.createConnection({
	host: host,
	user: user,
	password: myPassword,
	database: db,
	multipleStatements: true
});
 
 mysqlConnection.connect(function(err){
	if(err) {
			console.log("==Unable to make connection to MYSQL Data Base.");
			throw err;
	}
	else {
			console.log("==connected to mysql database");
	}
});


//will need to deal with rendering the various pages here.

//server the index page.
app.get('/', function(req, res){
		res.render('index-page');
});

app.get('/fireemployee.html', function(req, res){
	item = [];
	mysqlConnection.query('SELECT id, f_name, l_name, position FROM employee', function(err, rows){
		if(err){
			console.log(err);
		} else{
			rows.forEach(function (row) {
				if(row.f_name != 'fired'){
					item.push({
						item1: row.id,
						item2: row.f_name,
						item3: row.l_name,
						item4: row.position
					});
				}
			});
		}
		res.render('fire-page', {
			title:'Fire An Employee',
			pageEx:'Please Enter the id of the employee you would like to fire, Then click submit.',
			hdr1: 'Employee id',
			hdr2: 'First Name',
			hdr3: 'Last Name',
			hdr4: 'Position',
			item: item
		});
	});
});

//handles the request to fire an employee. 
app.get('/fireemployee/:id', function(req, res){
	var ids = req.params.id;
	var id = parseInt(ids);
	mysqlConnection.query('DELETE FROM Employee_dealership WHERE eid = ?',[id], function(err){
			if(err){
				console.log(err);
			}
			
		mysqlConnection.query('UPDATE sale SET eid = 0 WHERE eid = ?', [id], function(err) {
			if(err){
				console.log(err);
			}
		});	
			
			mysqlConnection.query({ sql: 'DELETE FROM employee WHERE id = ?', values: [id]}, function(err) {
				if(err){
					console.log(err);
				}
				item = [];
				mysqlConnection.query('SELECT id, f_name, l_name, position FROM employee', function(err, rows){
					if(err){
						console.log(err);
					}else{
						rows.forEach(function (row) {
							
							if(row.f_name != 'fired'){
								item.push({
									item1: row.id,
									item2: row.f_name,
									item3: row.l_name,
									item4: row.position
								});
							}
						});
					}	
				});
				
				res.render('fire-page', {
					title:'Fire An Employee',
					pageEx:'Please Enter the id of the employee you would like to fire, Then click submit.',
					hdr1: 'Employee id',
					hdr2: 'First Name',
					hdr3: 'Last Name',
					hdr4: 'Position',
					item: item
				});
			});
	});	

	

});

//shows the car sales by dealership
app.get('/Sales_by_dealership.html', function(req, res){
		//querys the data base for the information it wants.
		item = [];
		mysqlConnection.query('SELECT d.name, count(s.id) AS num FROM sale AS s INNER JOIN(SELECT name, id FROM dealership) AS d ON d.id = s.did GROUP BY d.id', function(err, rows){
			if(err){
					console.log(err);
			} else {
				rows.forEach(function (row) {
					item.push({
						item1: row.name,	
						item2: row.num
					});
				});
			}
			res.render('chartPage' , {
			title:'DealerShip Sales By Number Of Sales',
			pagEx: 'This page shows the number of Sales for each dealership',
			hdr1: 'Dealership Name',
			hdr2: 'Sales',
			item: item
		});
		});
		//renders the page
});

//severs the dealership by id page after they have requested the correct dealership
app.get('/Sales_by_dealership/:dealer', function(req, res){
	var dealer = req.params.dealer;
	var item = [];
	mysqlConnection.query('SELECT make, model, year, color FROM car as c INNER JOIN (SELECT car_id FROM dealer_car as d WHERE d.dealer_id = (SELECT id FROM dealership AS de WHERE de.name = ?)) as DC on DC.car_id = c.id', [dealer], function(err, rows){
		if(err || rows.length < 0) {
				console.log(err)
				res.render('dealer-page', {
					title: 'DealerShip Does Not Exist',
					pageEx: 'We cannot find ' + dealer + '. Please Try Again'
				});
		} else {
			rows.forEach(function(row){
				item.push({
					item1: row.make,
					item2: row.model,
					item3: row.year,
					item4: row.color
				});
			});
		res.render('dealer-page', {
			title: dealer + ' Cars',
			pageEx: 'Displays All the cars from ' + dealer + '.',
			hdr1: 'Make',
			hdr2: 'Model',
			hdr3: 'Year',
			hdr4: 'color',
			item: item
		});
		}
		
	});
	
});

//serves the add car page
app.get('/addCar.html', function(req, res) {
	res.render('add-car-page', {
		pageTitle: 'ADD CAR PAGE',
		pageEx: 'Fill in the form and click submit to add a car'
	});
});

app.get('/newhireform.html', function(req, res){
	res.render('new-hire-page', {
		pageTitle: 'New Hire Paperwork',
		pageEx: 'Please enter all the information and click submit'
	});
});	


//handles request to add another employee to the database. Adds employee to the 
//correct dealership as well.
app.post('/newhireform', function(req, res){
	var dealer = req.body.dealer;
	var fname = req.body.fname;
	var lname = req.body.lname;
	var position = req.body.position;
	var address = req.body.address;
	
	var today = new Date();
	var dd = today.getDate();
	var mm = today.getMonth() + 1;
	var yyyy = today.getFullYear();
	var startDate = yyyy + '-' + mm + '-' + dd;
	
	mysqlConnection.query({
		sql: 'INSERT INTO employee (f_name, l_name, position, address, start_data) VALUES (?,?,?,?,?)', 
		values: [fname, lname, position, address, startDate]
	}, function(err, result){
		if(err){
			console.log(err);
			res.status(400).send("error adding employee");
		} else {
			var id = result.insertId;
			mysqlConnection.query(
			{
				sql: 'INSERT INTO Employee_dealership (eid, did) VALUES (?, (SELECT id FROM dealership WHERE name =? LIMIT 1))',
				values: [id, dealer]
			}, function(err){
					if(err){
						console.log(err);
						res.status(400).send("NO SUCH DEALERSHIP");
					} else {
							res.status(200).send();
					}
			});
		}
	});
});

app.get('/byhiredate.html', function(req, res) {
	var item = [];
	mysqlConnection.query('SELECT f_name, l_name, position, address, start_data FROM employee ORDER BY start_data DESC', function(err, rows){
		if(err){
			console.log(err);
		} else{
			rows.forEach(function(row){
				item.push({
					item1: row.f_name,
					item2: row.l_name,
					item3: row.position,
					item4: row.address,
					item5: row.start_data
				});
			});
		}
		res.render('chartPage', {
			title: 'Employees ordered by hire date',
			pageEx: 'This page lists all the employees and their recordes in order of date hired.',
			hdr1: 'First Name',
			hdr2: 'Last Name',
			hdr3: 'Position',
			hdr4: 'Address',
			hdr5: 'Start Date',
			item: item
		});
	});
	
});

//gets a car from the user on the front end and posts into the back end.
app.post('/addCar', function(req, res) {
	var dealer = req.body.dealer;
	var make = req.body.make;
	var model = req.body.model;
	var year = req.body.year;
	var color = req.body.color;
	var msrp = req.body.msrp;
	var isNew = req.body.isNew;
	
	mysqlConnection.query({
		sql: 'INSERT INTO car (make, model, year, color) VALUES (?, ?, ?, ?)',
		values: [make, model, year, color]}, function(err, result){
		if(err){
			console.log(err);
		} else {
			var id = result.insertId;
			mysqlConnection.query({
				sql: 'INSERT INTO car_price (car_id, msrp) VALUES (?, ?)',
				values: [id, msrp]
			}, function(err) {
				if(err) console.log(err);
			});
			var today = new Date();
			var dd = today.getDate();
			var mm = today.getMonth() + 1;
			var yyyy = today.getFullYear();
			var arrived = yyyy+ '-' + mm + '-' + dd;
			mysqlConnection.query({
				sql: 'INSERT INTO dealer_car (car_id, dealer_id, isnew, arrived) VALUES (?,(SELECT id FROM dealership WHERE name = ? limit 1), ?, ?)',
				values: [id, dealer, isNew, arrived]
			}, function(err){
				if(err){
					console.log(err);
					res.status(400).send("DEALERSHIP INCORRECT");
				}
			});
		}
		res.status(200).send();
		
	});
});

//shows number of sales by each employee.
app.get('/number_by_employee.html', function(req, res) {
	//gets data from the server
	var item = [];
	mysqlConnection.query('SELECT e.f_name, e.l_name, count(s.id) AS num FROM sale AS s LEFT JOIN(SELECT f_name, l_name, id FROM employee) AS e ON e.id = s.eid GROUP BY e.id', function(err, rows){
		if(err){
			console.log(err);
		} else {
			rows.forEach(function(row) {
				item.push ({
					item1: row.f_name,
					item2: row.l_name,
					item3: row.num
				});
			});
		}
		res.render('chartPage', {
		title: 'Number OF Sales By Employee',
		pageEx: 'This page shows the number of sales by each employee. Employees who have made no sales are not listed in this list.',
		hdr1: 'First Name',
		hdr2: 'Last Name',
		hdr3: 'Sales',
		item: item
	});
	});
	

	
});

//displays all dealer cars
app.get('/all_cars.html', function (req, res) {
	items = [];
	mysqlConnection.query('SELECT make, model, year, color FROM car AS c INNER JOIN (select car_id FROM dealer_car) as d ON c.id = d.car_id', function(err, rows){
		if(err){
			console.log(err);
		} else {
			rows.forEach(function(row) {
				items.push({
					item1: row.make,
					item2: row.model,
					item3: row.year,
					item4: row.color
				});
			});
		}
		
		res.render('chartPage', {
		title: 'All Dealership Cars',
		pageEx: 'This page lists all the cars from every dealer',
		hdr1: 'make',
		hdr2: 'model',
		hdr3: 'year',
		hdr4: 'color',
		item: items
	});
	});
	

});

//displays the number of cars each dealership has.
app.get('/car_by_lot.html', function(req, res){
	item = [];
	mysqlConnection.query('SELECT name, count(c.car_id) as num FROM dealership as d INNER JOIN (SELECT car_id, dealer_id FROM dealer_car AS d) as c ON d.id = c.dealer_id GROUP BY d.id', function(err, rows){
		if(err){
			console.log(err);
		} else{
			rows.forEach(function(row) {
				item.push({
					item1: row.name,
					item2: row.num
				});
			});
		}
		
		res.render('chartPage', {
		title: 'Number of Cars by Dealer',
		pageEx: 'This page displays the number of cars you have in each dealership',
		hdr1: 'Dealership Name',
		hdr2: 'Number of cars',
		item: item
	});
	});
	

});

//displays a page where you can ask for the inventory from a specific dealer.
//also shows all the dealers in your database.
app.get('/inventory_by_lot.html', function(req, res){
	item = [];
	mysqlConnection.query('SELECT name, address, phonenumber FROM dealership', function(err, rows){
		if(err) {
			console.log(err);
		} else {
			rows.forEach(function(row) {
				item.push({
					item1: row.name,
					item2: row.address,
					item3: row.phonenumber
				});
			});
		}
		res.render('dealer-page', {
		title: 'Inventory By Dealer',
		pageEx: 'This page displays all the dealers and allows you to search a dealer by name and will then display all the inventory for that dealer',
		hdr1: 'Name',
		hdr2: 'Address',
		hdr3: 'Phone Number',
		item: item
	});
	});
	

});

//displays efficentcy of employees by calculating total $ MSRP - TOTAL SALE$
app.get('/efficentcy.html', function(req, res) {
	var item = [];
	mysqlConnection.query('SELECT f_name, l_name, SUM(ecp.final_price - ecp.msrp) AS p FROM employee AS e INNER JOIN (SELECT final_price, m.msrp,eid FROM sale as s LEFT JOIN (SELECT msrp, car_id FROM car_price) as m ON s.car_id = m.car_id) as ecp ON e.id = ecp.eid GROUP BY e.id',
	function(err, rows) {
		if(err) {
			console.log(err);
		} else {
			rows.forEach(function(row) {
				item.push({
					item1: row.f_name,
					item2: row.l_name,
					item3: row.p
				});
			});
		}
		res.render('chartPage', {
		title: 'Employee Efficiency',
		pageEx: 'This page compares the msrp total of all the sales an employee has made to the total of the final sales price for all the sales the employee has made.Possitive is good, Negitive is bad',
		hdr1: 'First Name',
		hdr2: 'Last Name',
		hdr3: 'Final Sales - MSRP',
		item: item
	});
	});
	

});

//lists all of the used cars
app.get('/used.html', function(req, res) {
	var item = [];
	mysqlConnection.query('SELECT make, model, year, color FROM car WHERE id IN (SELECT car_id FROM dealer_car WHERE isnew = false)' , function(err, rows) {
		if(err){
				console.log(err);
		} else {
			
			rows.forEach(function (row){
				item.push({
					item1: row.make,
					item2: row.model,
					item3: row.year,
					item4: row.color
				});
			});
		}
		res.render('chartPage', {
			title: 'NEW CARS FROM ALL DEALERSHIPS',
			pageEx: 'This page displays all the new cars from Every dealership.',
			hdr1: 'Make',
			hdr2: 'Model',
			hdr3: 'Year',
			hdr4: 'Color',
			item: item
		});
		
	});
});

//renders a page where it lists all the new cars
app.get('/new.html', function(req, res){
	var item = [];
	mysqlConnection.query('SELECT make, model, year, color FROM car WHERE id IN (SELECT car_id FROM dealer_car WHERE isnew = true)' , function(err, rows) {
		if(err){
				console.log(err);
		} else {
			
			rows.forEach(function (row){
				item.push({
					item1: row.make,
					item2: row.model,
					item3: row.year,
					item4: row.color
				});
			});
		}
			res.render('chartPage', {
			title: 'NEW CARS FROM ALL DEALERSHIPS',
			pageEx: 'This page displays all the new cars from Every dealership.',
			hdr1: 'Make',
			hdr2: 'Model',
			hdr3: 'Year',
			hdr4: 'Color',
			item: item
		});

	});
});

//serves the sales for along with all the data the sales person will need.
app.get('/salesform.html', function(req, res){
	var dealer = [];
	var customer = [];
	var car = [];
	var employee = [];
	
	mysqlConnection.query('SELECT id, name FROM dealership; SELECT id, f_name, l_name, phone_number, address FROM customer; SELECT cars.id AS id, cars.make AS make, cars.model AS model, cars.year AS year, cars.color AS color, cars.msrp AS msrp FROM dealer_car AS dc INNER JOIN (SELECT id, make, model, year, color, m.msrp AS msrp FROM car AS c INNER JOIN (SELECT car_id, msrp FROM car_price) AS m ON m.car_id =c.id) AS cars ON cars.id = dc.car_id; SELECT f_name, l_name, id FROM employee;', function(err, rows){
		if(err){
			console.log(err);
		}
		rows[0].forEach(function(row){
			dealer.push({
			id: row.id,
			name: row.name
			});
		});
						
		rows[1].forEach(function(row){
			customer.push({
				id: row.id,
				fname: row.f_name,
				lname: row.l_name,
				phone: row.phone_number,
				address: row.address
			});
		});
						
		rows[2].forEach(function(row){
			car.push({
				id: row.id,
				make: row.make,
				model: row.model,
				year: row.year,
				color: row.color,
				msrp: row.msrp
			});
		});
						
		rows[3].forEach(function(row){
			employee.push({
				id: row.id,
				fname: row.f_name,
				lname: row.l_name
			});
		});
						
		res.render('sales-form', {
			title: 'Sales From',
			pageEx: 'To compleate a sale please fill out the following forms. If the Customer is not in the data base yet pleaes enter the customer first',
			dealer: dealer,
			customer: customer,
			car: car,
			employee: employee
		});
						 
	});
						
		
});

app.post('/newcustomer', function(req, res){
	var fname = req.body.fname;
	var lname = req.body.lname;
	var address = req.body.address;
	var phoneNumber = req.body.phone;
	mysqlConnection.query({
		sql: 'INSERT INTO customer(f_name, l_name, phone_number, address) values (?, ?, ?, ?)',
		values: [fname, lname, phoneNumber, address]
	}, function(err){
			if(err) console.log(err);
			res.status(200).send();
	});
});

//moves a car from the dealership to customer car.
app.post('/addsale', function(req, res) {
	var dealerId = parseInt(req.body.dealerId);
	var customerId = parseInt(req.body.customerId);
	var employeeId = parseInt(req.body.employeeId);
	var carId = parseInt(req.body.carId);
	var price = parseInt(req.body.price);

	
	
	var today = new Date();
	var dd = today.getDate();
	var mm = today.getMonth();
	var yyyy = today.getFullYear();
	var sold = yyyy + '-' + mm + '-' + dd;
	
	
	mysqlConnection.query({
		sql: 'INSERT INTO sale (eid, cid, car_id, did, sale_date, final_price) VALUES (?, ?, ?, ?, ?, ?)',
		values: [employeeId, customerId, carId, dealerId, sold, price]
	}, function(err){
		if(err){
			console.log(err);
			res.status(400).send("THERE WAS AN ERROR ADDING THE SALE");
		}
	});
	
	mysqlConnection.query({
		sql:'INSERT INTO customer_car(car_id, cid) VALUES (?,?)',
		values: [carId, customerId]
	}, function(err){
		if(err){
			console.log(err);
		}
	});
	
	mysqlConnection.query('DELETE FROM dealer_car WHERE car_id = ?', [carId], function(err) {
		if(err){
			console.log(err);
			res.status(400).send("COULD NOT REMOVE CAR FROM INVENTORY");
		}
	});
	
});

//tell server to use the 404 page if it can't find the page you are looking for.
app.get('*', function(req, res) {
	res.status(404).render('404-page');
});

app.listen(port, function (){
		console.log("== Listening on port", port);
});
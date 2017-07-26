function getDealer() {
		var dealerHTML = document.getElementById('dealerShip');
		var dealer = dealerHTML.value;
		url = '/Sales_by_dealership/' + dealer
		window.location.replace(url);
		return false;
}

function fireEmployee() {
	var idHTML = document.getElementById('to-fire');
	var id = idHTML.value;
	var url = '/fireemployee/' + id;
	window.location.replace(url);
}


function addCar() {
	var dealer = document.getElementById('dealer').value;
	var make = document.getElementById('make').value;
	var model = document.getElementById('model').value;
	var year = document.getElementById('year').value;
	var color = document.getElementById('color').value;
	var msrp = document.getElementById('msrp').value;
	var isNew = document.getElementById('isnew').value;
	
	document.getElementById('dealer').value = '';
	document.getElementById('make').value = '';
	document.getElementById('model').value= '';
	document.getElementById('year').value = '';
	document.getElementById('color').value ='';
	document.getElementById('msrp').value ='';
	document.getElementById('isnew').value ='';
	
	if(dealer == '' || make == ''|| model == ''|| year=='' || color=='' || msrp == '' || isNew == ''){
		alert("Please Enter All Feilds!");
		return;
	}
	
	if(isNew == "yes" || isNew == "Yes"){
		isNew = 'true';
	} else {
		isNew = 'false';
	}
	
	var url = '/addCar';
	var postRequest = new XMLHttpRequest();
	postRequest.open('POST', url);
	postRequest.setRequestHeader('Content-Type', 'application/json');
	
	postRequest.addEventListener('load', function(event) {
		var err;
		if(event.target.status != 200) {
			error = event.target.response;
			console.log(error);
		}
	});
	
	postRequest.send(JSON.stringify({
		dealer: dealer,
		make: make,
		model: model,
		year: year,
		color: color,
		msrp: msrp,
		isNew: isNew
	}));
	
}

function addEmployee() {
	var dealer = document.getElementById('dealer').value;
	var fname = document.getElementById('fname').value;
	var lname = document.getElementById('lname').value;
	var position = document.getElementById('position').value;
	var address = document.getElementById('address').value;
	
	document.getElementById('dealer').value = '';
	document.getElementById('fname').value = '';
	document.getElementById('lname').value= '';
	document.getElementById('position').value = '';
	document.getElementById('address').value ='';

	
	if(dealer == '' || lname == ''|| fname == ''|| position=='' || address ==''){
		alert("Please Enter All Feilds!");
		return;
	}
	
	var url = '/newhireform';
	var postRequest = new XMLHttpRequest();
	postRequest.open('POST', url);
	postRequest.setRequestHeader('Content-Type', 'application/json');
	
	postRequest.addEventListener('load', function(event) {
		var err;
		if(event.target.status != 200) {
			error = event.target.response;
			console.log(error);
		}
	});
	
	postRequest.send(JSON.stringify({
		dealer: dealer,
		fname: fname,
		lname: lname,
		position: position,
		address: address
	}));		
}

function addCustomer(){
	var fname = document.getElementById('c_f_name').value;
	var lname = document.getElementById('c_l_name').value;
	var address = document.getElementById('address').value;
	var phone = document.getElementById('phoneNumber').value;
	
	document.getElementById('c_f_name').value = '';
	document.getElementById('c_l_name').value = '';
	document.getElementById('address').value = '';
	document.getElementById('phoneNumber').value = '';
	
	if(!lname || !fname || !address || !phone){
		console.log('Please Fill in all feilds!');
		return;
	}
	
	var url = '/newcustomer';
	var postRequest = new XMLHttpRequest();
	postRequest.open('POST', url);
	postRequest.setRequestHeader('Content-Type', 'application/json');
	
	postRequest.addEventListener('load', function(event) {
		var err;
		if(event.target.status != 200) {
			err = event.garget.response;
			alert(err);
		} else {
			window.location.reload();
		}
	});
	
	postRequest.send(JSON.stringify({
		fname: fname,
		lname: lname,
		address: address,
		phone: phone
	}));
	
}

function addSale(){
	var dealerId = document.getElementById('dealer').value;
	var customerId = document.getElementById('customerId').value;
	var employeeId = document.getElementById('employeeId').value;
	var carId = document.getElementById('carId').value;
	var price = document.getElementById('finalPrice').value;

	
	document.getElementById('dealer').value = '';
	document.getElementById('customerId').value = '';
	document.getElementById('employeeId').value = '';
	document.getElementById('carId').value = '';
	document.getElementById('finalPrice').value ='';
	
	if(!dealerId || !customerId || !employeeId || !carId || !price){
		console.log('Please Fill in all feilds!');
		return;
	}
	
	var url = '/addsale';
	var postRequest = new XMLHttpRequest();
	postRequest.open('POST', url);
	postRequest.setRequestHeader('Content-Type', 'application/json');
	
	postRequest.addEventListener('load', function(event) {
		var err;
		if(event.target.status != 200) {
			err = event.garget.response;
			alert(err);
		} else {
			window.location.reload();
		}
	});
	
	postRequest.send(JSON.stringify({
		dealerId: dealerId,
		customerId: customerId,
		employeeId: employeeId,
		carId: carId,
		price: price
	}));
}
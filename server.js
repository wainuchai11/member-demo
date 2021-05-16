let express = require('express');
let app = express();
let bodyParser = require('body-parser');
let mysql = require('mysql');

//homepage rounte
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(function(req, res, next) {
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
	next();
});

app.get('/', (req, res) => {
	return res.send({
		error: false,
		message: 'Welcome to Restful API'
	});
});

//conection to mysql

let dbCon = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	database: 'membership'
});
dbCon.connect();

//retrieve all books
app.get('/Api/member/memberInfo', (req, res) => {
	dbCon.query('SELECT  * FROM member', (error, results, fields) => {
		if (error) throw error;
		let message = '';
		if (results === undefined || results.length == 0) {
			message = 'Member is not found';
		} else {
			message = 'Success fully retrieved all member';
		}
		return res.send({ error: false, data: results, message: message });
	});
});

//Search by name

app.get('/Api/member/memberInfo/:firstName', (req, res) => {
	let firstName = req.params.firstName;

	if (!firstName) {
		return res.status(400).send({
			error: true,
			message: 'Please provide member name'
		});
	} else {
		dbCon.query('SELECT * FROM member WHERE firstName = ?', firstName, (error, results, fields) => {
			if (error) throw error;
			let message = '';
			if (results === undefined || results.length === 0) {
				message = 'Member not found';
			} else {
				message = 'Successfully retrieved member data';
			}
			return res.send({ error: false, data: results, message: message });
		});
	}
});

app.post('/Api/member/addMember', (req, res) => {
	let firstName = req.body.firstName;
	let lastName = req.body.lastName;

	//validate
	if (firstName === '' || lastName === '') {
		return res.status(400).send({
			error: true,
			message: 'Please provide First name or Last name'
		});
	} else {
		dbCon.query(
			'INSERT INTO member (firstName, lastName) VALUES(?,?)',
			[ firstName, lastName ],
			(error, results, fields) => {
				if (error) throw error;
				return res.send({
					error: false,
					message: 'Member successfully added'
				});
			}
		);
	}
});

app.put('/Api/member/updateMember', (req, res) => {
	let id = req.body.id;
	let firstName = req.body.firstName;
	let lastName = req.body.lastName;

	if (id === '' || firstName === '' || lastName === '') {
		return res.status(400).send({ error: true, message: 'Please provide data' });
	} else {
		dbCon.query(
			'UPDATE member SET firstName = ?, lastName = ? WHERE id =  ?',
			[ firstName, lastName, id ],
			(error, results, fields) => {
				if (error) throw error;
				return res.send({
					error: false,
					message: 'Member successfully updated'
				});
			}
		);
	}
});

app.delete('/Api/member/deleteMember', (req, res) => {
	let id = req.body.id;

	if (!id) {
		return res.status(400).send({
			error: true,
			message: 'Please provide member id'
		});
	} else {
		dbCon.query('DELETE FROM member WHERE id =  ?', [ id ], (error, results, fields) => {
			if (error) throw error;
			let message = '';

			if (results.affectedRows === 0) {
				message = 'Member not found';
			} else {
				message = 'Member successfully deleted';
			}
			return res.send({
				error: false,
				message: message
			});
		});
	}
});

app.listen(3000, () => {
	console.log('Node App is running or port 3000');
});

module.exports = app;

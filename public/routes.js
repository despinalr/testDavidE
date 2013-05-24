module.exports = function (app) {

	app.get('/', function (req, res) {
		res.render('index', {
			titulo : 'Ejemplo1'
		});
	});
 
	app.get('/login', function (req, res, next) {
		res.render('login', {
			titulo : 'Ingreso'
		});
	});
	 
	app.post('/login', function (req, res, next) {
		// Aqui se deberia consultar una db
		if (req.body.username && req.body.username === 'user' && req.body.password && req.body.password === 'pass') {
			req.session.authenticated = true;
			res.redirect('/');
		} else {
			res.redirect('/login');
		}
	 
	});
	 
	app.get('/logout', function (req, res, next) {
		delete req.session.authenticated;
		res.redirect('/');
	});
};
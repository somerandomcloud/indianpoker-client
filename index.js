const term = require('terminal-kit').terminal;
const { io } = require('socket.io-client');
const socket = io('ws://localhost:3000');

term.clear();

let termwidthline = '';

for (let i = 0; i < term.width; i++) {
	termwidthline += '━';
}

function lOr() {
	term.cyan(termwidthline);
	term.white('Connected to socket.io client.\nWhat would you like to do?\n');

	term.singleColumnMenu(['Login', 'Register'], function(error, response) {
	/* Expected `response`
    {
      selectedIndex: 0,
      selectedText: 'Login',
      submitted: true,
      x: 1,
      y: 14
    }
    */

		term.clear();

		if(response.selectedIndex === 0) return login();
		else return register();
	}) ;
}

function login() {
	term.cyan(termwidthline);
	term.white('Please enter your username: ');

	let username = '';
	let password = '';

	term.inputField([],
		function(error, input) {
			username = input;
			term.clear();
			term.cyan(termwidthline);
			term.white('Please enter your password: ');
			term.inputField({ echoChar: '*' },
				function(error, input) {
					password = input;
					term.clear();

					const req = {
						username: username,
						password: password,
					};

					socket.emit('loginaccount', req, function(responseData) {
						if(responseData.code === 'MISSINGINFO') {
							term.white('Missing some info, please retry\n');
							return login();
						}
						else if(responseData.code === 'DOESNTEXIST') {
							term.white('That account doesn\'t exist.\n');
							return login();
						}
						else if(responseData.code === 'WRONGINFO') {
							term.white('Wrong password!\n');
							return login();
						}
						else if(responseData.code === 'OK') {
							mainmenu();
						}
					});
				},
			);
		},
	);
}

function register() {
	term.cyan(termwidthline);
	term.white('Please enter your username: ');

	let username = '';
	let password = '';

	term.inputField([],
		function(error, input) {
			username = input;
			term.clear();
			term.cyan(termwidthline);
			term.white('Please enter your password: ');
			term.inputField({ echoChar: '*' },
				function(error, input) {
					password = input;
					term.clear();

					const req = {
						username: username,
						password: password,
					};

					socket.emit('createaccount', req, function(responseData) {
						if(responseData.code === 'MISSINGINFO') {
							term.white('Missing some info, please retry\n');
							return register();
						}
						else if(responseData.code === 'ALREADYEXISTS') {
							term.white('That account already exists\n');
							return register();
						}
						else if(responseData.code === 'OK') {
							mainmenu();
						}
					});
				},
			);
		},
	);
}

function mainmenu() {
	term.cyan(termwidthline);
	term.white('Logged in!\n');

	term.singleColumnMenu(['Create game', 'Join game', 'Quit'], function(error, response) {
	/* Expected `response`
    {
      selectedIndex: 0,
      selectedText: 'Login',
      submitted: true,
      x: 1,
      y: 14
    }
    */

		term.clear();

		if(response.selectedIndex === 0) return createGame();
		else if(response.selectedIndex === 1) return joinGame();
		else if(response.selectedIndex === 2) return process.exit();
	}) ;
}

function createGame() {
	process.exit();
}

function joinGame() {
	process.exit();
}

lOr();

socket.on('update', (...args) => {
	console.log('update event triggered');
	console.log(args);
});
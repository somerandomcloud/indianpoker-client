/* eslint-disable max-statements-per-line */
const term = require('terminal-kit').terminal;
const { io } = require('socket.io-client');
const fs = require('fs');
const nconf = require('nconf');

const configfolder = process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + '/Library/Preferences' : process.env.HOME + '/.local/share');

term.clear();

let termwidthline = '';

for (let i = 0; i < term.width; i++) {
	termwidthline += '━';
}

let socket;

function start() {
	nconf.file({ file: `${configfolder}/./.indianpokerclient.json` });

	nconf.defaults({
		server: 'ws://localhost:3000',
		savelogin: true,
	});

	nconf.save();

	socket = io(nconf.get('server'));

	term.cyan(termwidthline);
	term.white('You should visit Settings before logging in or registering, to make sure that the socket.io url is correct\n\n');

	term.singleColumnMenu(['Ok'], function(error, response) {
		term.clear();
		lOr();
	});
}

function lOr() {
	term.cyan(termwidthline);

	term.singleColumnMenu(['Login', 'Register', 'Settings', 'Quit'], function(error, response) {
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
		else if(response.selectedIndex === 1) return register();
		else if(response.selectedIndex === 2) return lOrconfig();
		else if(response.selectedIndex === 3) return process.exit();
	});
}

function lOrconfig() {
	term.cyan(termwidthline);
	term.singleColumnMenu(['socket.io server', 'Autologin', 'Back'], function(error, response) {
		term.clear();
		term.cyan(termwidthline);

		if(response.selectedIndex === 0) {
			term.white('You should be given a socket.io url by the people hosting the IndianPoker server.\n');
			term.white('Type in the socket.io url (Ex: ws://localhost:3000): ');

			term.inputField([],
				function(error, input) {
					nconf.set('server', input);
					nconf.save();
					term.clear();
					term.white('Saved!\n');
					socket.disconnect();
					socket = io(input);
					lOrconfig();
				});
		}
		else if(response.selectedIndex === 1) {
			term.white('Do you want to automatically log in next time you visit? (y/n)\n');

			term.yesOrNo({ yes: [ 'y', 'ENTER' ], no: [ 'n' ] }, function(error, result) {

				if (result) {
					nconf.set('autologin', true);
					nconf.save();
					term.clear();
					term.white('Saved!\n');
					lOrconfig();
				}
				else {
					nconf.set('autologin', false);
					nconf.save();
					term.clear();
					term.white('Saved!\n');
					lOrconfig();
				}
			});
		}
		else if(response.selectedIndex === 2) {term.clear(); return lOr();}
	});
}

function mainconfig() {
	term.cyan(termwidthline);
	term.singleColumnMenu(['socket.io server', 'Autologin', 'Back'], function(error, response) {
		term.clear();
		term.cyan(termwidthline);

		if(response.selectedIndex === 0) {
			term.white('You should be given a socket.io url by the people hosting the IndianPoker server.\n');
			term.white('Type in the socket.io url (Ex: ws://localhost:3000): ');

			term.inputField([],
				function(error, input) {
					nconf.set('server', input);
					nconf.save();
					term.clear();
					term.white('Saved!\n');
					socket.disconnect();
					socket = io(input);
					mainconfig();
				});
		}
		else if(response.selectedIndex === 1) {
			term.white('Do you want to automatically log in next time you visit?(y/n)\n');

			term.yesOrNo({ yes: [ 'y', 'ENTER' ], no: [ 'n' ] }, function(error, result) {

				if (result) {
					nconf.set('autologin', true);
					nconf.save();
					term.clear();
					term.white('Saved!\n');
					mainconfig();
				}
				else {
					nconf.set('autologin', false);
					nconf.save();
					term.clear();
					term.white('Saved!\n');
					mainconfig();
				}
			});
		}
		else if(response.selectedIndex === 2) {term.clear(); return mainmenu();}
	});
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
							term.clear();
							term.white('Logged in succesfully\n');
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
							term.clear();
							term.white('Logged in succesfully\n');
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
	term.white('Main menu\n');

	term.singleColumnMenu(['Create game', 'Join game', 'Settings', 'Quit'], function(error, response) {
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
		else if(response.selectedIndex === 2) return mainconfig();
		else if(response.selectedIndex === 3) return process.exit();
	}) ;
}

function createGame() {
	term.cyan(termwidthline);
	term.white('Enter the settings you want\nAmount assigned to each chip (Ex: 100): ');

	let chips;
	let fee;

	term.inputField([],
		function(error, input) {
			chips = input;
			term.white('\nChips removed each round for fees (Ex: 1): ');
			term.inputField([],
				function(error, input) {
					fee = input;

					const req = {
						chips: chips,
						fee: fee,
					};

					socket.emit('creategame', req, function(responseData) {
						if(responseData.code === 'MISSINGINFO') {
							term.white('Missing some info, please retry\n');
							term.clear();
							return createGame();
						}
						else if(responseData.code === 'OK') {
							gamemenu(responseData.gamecode);
						}
					});
				},
			);
		},
	);
}

function gamemenu(roomid) {
	term.clear();
	term.cyan(termwidthline);
	term.white('Successfully joined! Gamecode is: ');
	term.red(roomid);

	term.singleColumnMenu(['Start game', 'All players', 'Leave lobby'], function(error, response) {


		if(response.selectedIndex === 0) {return process.exit();}
		else if(response.selectedIndex === 1) {return viewPlayers(roomid);}
		// eslint-disable-next-line max-statements-per-line
		else if(response.selectedIndex === 2) {term.clear(); return leaveGame();}
	});
}

function joinGame() {
	term.clear();
	term.cyan(termwidthline);
	term.white('Gamecode: ');
	term.inputField({ echoChar: '*' },
		function(error, input) {
			code = input;

			const req = {
				id: code,
			};

			socket.emit('joingame', req, function(responseData) {
				if(responseData.code === 'MISSINGINFO') {
					term.white('Missing gamecode, please retry\n');
					return mainmenu();
				}
				if(responseData.code === 'MAXPL') {
					term.clear();
					term.white('Game is full\n');
					return mainmenu();
				}
				else if(responseData.code === 'DOESNTEXIST') {
					term.white('That game doesnt exist\n');
					return mainmenu();
				}
				else if(responseData.code === 'OK') {
					term.clear();
					gamemenu(input);
				}
			});
		},
	);
}

function leaveGame(roomid) {
	socket.emit('leavegame', { id: roomid }, function(responseData) {
		term.white('Left room successfully!\n');
		mainmenu();
	});
}

function viewPlayers(roomid) {
	const req = { id: roomid };

	socket.emit('gamedata', req, function(responseData) {
		if(responseData.code === 'OK') {
			term.clear();
			term.table([
				[ 'Game ID', 'Name'],
				[ '1', responseData.data.players[0] ],
				[ '2', responseData.data.players[1] ],
				[ '3', responseData.data.players[2] ],
				[ '4', responseData.data.players[3] ],
			], {
				hasBorder: true,
				contentHasMarkup: true,
				borderChars: 'lightRounded',
				borderAttr: { color: 'blue' },
				textAttr: { bgColor: 'default' },
				width: 60,
				fit: true,
			});

			term.singleColumnMenu(['Ok'], function(error, response) {
				gamemenu(roomid);
			});
		}
	});
}

start();
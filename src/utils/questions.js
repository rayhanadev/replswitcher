module.exports = {
	loginQuestions: [
	  {
	    type: 'input',
	    name: 'username',
	    message: "Username:",
			default: process.env.REPLIT_USERNAME,
	  },
	  {
	    type: 'password',
	    name: 'password',
	    message: "Password:",
			default: process.env.REPLIT_PASSWORD,
	  },
	  {
	    type: 'password',
	    name: 'token',
	    message: "Captcha Token:",
			default: process.env.REPLIT_TOKEN,
	  },
	],
	replQuestions: [
	  {
	    type: 'input',
	    name: 'slug',
	    message: "Old Repl Slug:",
	  },
	  {
	    type: 'input',
	    name: 'title',
	    message: "New Repl Title:",
	  },
	  {
	    type: 'input',
	    name: 'language',
	    message: "New Repl Language:",
	  },
	]
}
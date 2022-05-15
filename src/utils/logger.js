const chalk = require('chalk');

class Logger {
	constructor(prefixes) {
		this.prefixes = prefixes ?? {
			setup: chalk.blue('setup') + ' -',
			error: chalk.red('error') + ' -',
			ready: chalk.green('ready') + ' -',
			info: chalk.cyan('info') + ' -',
			dev: chalk.green('dev') + ' -',
		};
	}

	setup(...message) {
		console.log(this.prefixes.setup, ...message);
	}

	error(...message) {
		console.error(this.prefixes.error, ...message);
	}

	ready(...message) {
		console.log(this.prefixes.ready, ...message);
	}

	info(...message) {
		console.log(this.prefixes.info, ...message);
	}

	dev(...message) {
		console.log(this.prefixes.dev, ...message);
	}
}

module.exports = {
	logger: new Logger(),
};
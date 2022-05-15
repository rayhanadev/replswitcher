#! /usr/bin/env node

const Conf = require('conf');
const config = new Conf();
const chalk = require('chalk');
const ora = require('ora');
const inquirer = require('inquirer');

const { compile } = require('gitignore-parser');

const { authenticate } = require('replit-login');
const { Crosis } = require('crosis4furrets');

const { logger } = require('./utils/logger.js');
const { graphql } = require('./utils/graphql.js');
const { CREATE_REPL, REPL_ID } = require('./utils/queries.js');
const { loginQuestions, replQuestions } = require('./utils/questions.js');

getCredentials().then(() => {	
	inquirer
		.prompt(replQuestions)
		.then(async ({ slug, title, language }) => {
			const oldRepl = await graphql(
				REPL_ID,
				{ url: `/@${config.get('username')}/${slug}` },
			);

			if(!oldRepl.data?.repl?.id) {
				logger.error('could not find the repl you want to fork');
				process.exit(0);
			};
			
			const { data: { repl: { id: oldReplId } } } = oldRepl;

			const newRepl = await graphql(
				CREATE_REPL,
				{ input: { title, language } },
			);

			if(!newRepl.data?.createRepl?.id) {
				logger.error(
					`could not create a new repl ${
						newRepl.data
							? `because ${newRepl.data?.createRepl?.message.toLowerCase()}`
							: `, ${newRepl.errors}`
					}`);
				process.exit(0);
			};

			const { data: { createRepl: { id: newReplId, url } } } = newRepl;

			const spinnerCreation = ora({
				text: 'Creating a new repl...',
				spinner: 'point',
			}).start();
			spinnerCreation.succeed('Created a new repl project.')

			const spinnerConnections = ora({
				text: 'Connecting to repls...',
				spinner: 'point',
			}).start();
			const oldReplClient = new Crosis(config.get('login'), oldReplId);
			const newReplClient = new Crosis(config.get('login'), newReplId);

			await oldReplClient.connect();
			await newReplClient.connect();
			await newReplClient.persist();
			spinnerConnections.succeed('Connected to remote repls.');

			await newReplClient.removeAll();
			await transferFiles(newReplClient, oldReplClient);

			const spinnerSave = ora({
				text: 'Saving new repl...',
				spinner: 'point',
			}).start();
			await newReplClient.snapshot();
			await oldReplClient.close();
			await newReplClient.close();
			spinnerSave.succeed(chalk.bold('Your new repl is ready: https://replit.com' + url));
		});
}).catch((error) => {
	logger.error('an error occured:', error);
});

async function getCredentials() {
	return new Promise((resolve, reject) => {
		if(process.env.REPLIT_TOKEN) {
			config.set('username', process.env.REPLIT_USERNAME);
			config.set('login', process.env.REPLIT_TOKEN);
			resolve();
		} else {	
			inquirer
				.prompt(loginQuestions)
				.then(async ({ username, password, token }) => {
					const REPLIT_LOGIN = await authenticate(username, password, token)
					if(REPLIT_LOGIN) {
						config.set('username', username);
						config.set('login', REPLIT_LOGIN);
						logger.info('logged in as', chalk.bold(username));
						resolve();
					} else {
						reject("couldn't login with those credentials.");
					}
				});
		}
	})
}

async function transferFiles(newRepl, oldRepl) {
	const spinnerReadFiles = ora({
		text: 'Reading files on old repl...',
		spinner: 'point',
	}).start();
	const files = await oldRepl.recursedir('.', true, true);
	spinnerReadFiles.succeed('Read files on old repl.');


	const spinnerTransfer = ora({
		text: 'Starting transfer...',
		spinner: 'point',
	}).start();

	for (let i = files.length - 1; i > -1; i--) {
		const path = files[i];
		const fileName = path.slice(2);

		spinnerTransfer.text = 'Transferring ' + fileName + '...';
		await newRepl.write(path, await oldRepl.read(path))
			.catch(() => {
				logger.error('could not transfer', fileName);
			});
	};

	spinnerTransfer.succeed('Transferred files to new repl.');
};
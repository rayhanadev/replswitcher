const { lightfetch } = require('lightfetch-node');
const Conf = require('conf');
const config = new Conf();

exports.graphql = async (query, variables = {}) => {
	const data = await lightfetch(
		'https://replit.com/graphql',
		{
			method: 'POST',
			headers: {
				'X-Requested-With': 'XMLHttpRequest',
				'Referrer': 'https://replit.com',
				'User-Agent': 'Mozilla/5.0',
				'Cookie': 'connect.sid=' + config.get('login'),
			},
			body: {
				query,
				variables,
			},
	});

	return data.json();
}
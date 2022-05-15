exports.CREATE_REPL = `
	mutation CreateRepl($input: CreateReplInput!) {
	  createRepl(input: $input) {
	    ...on Repl { id, url  }
	    ...on UserError { message }
	  }
	}`;

exports.REPL_ID = `
	query ReplId($url: String!) {
	  repl(url: $url) {
	    ...on Repl { id }
	  }
	}`;
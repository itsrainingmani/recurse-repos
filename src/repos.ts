import { graphql, GraphqlResponseError } from '@octokit/graphql';
import { Octokit } from 'octokit';

const octokit = new Octokit({
	auth: process.env['GITHUB_TOKEN'],
});

//
interface Member {
	login: string;
	id: number;
	node_id: string;
	avatar_url: URL;
	gravatar_id: string;
	url: URL;
	html_url: URL;
	followers_url: URL;
	following_url: URL;
	gists_url: URL;
	starred_url: URL;
	subscriptions_url: URL;
	organizations_url: URL;
	repos_url: URL;
	events_url: URL;
	received_events_url: URL;
	type: string;
	site_admin: boolean;
}

const members_file = Bun.file('members.json');
let rc_members: Array<Member> = await members_file.json();
let list_rc_members = rc_members.map((member) => member.login);

let query = `
query listTopRepos($queryString: String!) {
  rateLimit {
    cost
    remaining
    resetAt
  }
  search(query: $queryString, type: USER, first: 1) {
    nodes {
      ... on RepositoryOwner {
        repositories(
          first: 30
          privacy: PUBLIC
          isArchived: false
          ownerAffiliations: OWNER
          orderBy: { field: STARGAZERS, direction: DESC }
        ) {
          nodes {
            name
            owner {
              login
            }
            description
            stargazerCount
            createdAt
            updatedAt
            isFork
            url
            object(expression: "HEAD:README.md") {
              ... on Blob {
                text
              }
            }
            languages(
              first: 5
              orderBy: { field: SIZE, direction: DESC }
            ) {
              nodes {
                name
              }
            }
          }
        }
      }
    }
  }
}`;

let all_repos: any[] = [];

try {
	for (let member of list_rc_members) {
		console.log(`Current user - ${member}`);
		const result: any = await octokit.graphql(query, {
			queryString: `user:${member}`,
		});

		if (result !== undefined) {
			let search_results: any[] = result['search']['nodes'];
			if (search_results.length > 0) {
				let repos = result['search']['nodes'][0]['repositories']['nodes'];
				all_repos.push({ user: member, repos: repos });
			}
		}
	}

	// let member = 'itsrainingmani';
	// const result: any = await octokit.graphql(query, {
	// 	queryString: `user:${member}`,
	// });

	// if (result !== undefined) {
	// 	let repos = result['search']['nodes'][0]['repositories']['nodes'];
	// 	console.log(JSON.stringify(repos));
	// }

	Bun.write('all_repos.json', JSON.stringify(all_repos));
} catch (error) {
	if (error instanceof GraphqlResponseError) {
		console.error(
			`Request Failed: ${error.request} with message: ${error.message}`
		);
	} else {
		console.error(error);
	}
}

import { graphql, GraphqlResponseError } from '@octokit/graphql';
import { Octokit } from 'octokit';
import type { Member } from './utils';

const octokit = new Octokit({
	auth: process.env['GITHUB_TOKEN'],
});

async function getGithubOrgUsers() {
	try {
		let iterator = octokit.paginate.iterator(
			'GET /orgs/recursecenter/members',
			{
				org: 'ORG',
				per_page: 100,
				headers: {
					'X-GitHub-Api-Version': '2022-11-28',
				},
			}
		);

		let memberData: any = [];
		let breakLoop = false;
		for await (const { data } of iterator) {
			if (breakLoop) break;
			console.log(...data);
			memberData = [...memberData, ...data];
		}

		const path = '../data/members.json';
		const bytes = await Bun.write(path, JSON.stringify(memberData));
		console.log(`${bytes} bytes written to file`);
	} catch (error: any) {
		if (error.response) {
			console.error(
				`Error! Status: ${error.response.status}. Message: ${error.response.data.message}`
			);
		}
		console.error(error);
	}
}

async function getTop30repos() {
	const members_file = Bun.file('../data/members.json');
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

		Bun.write('../data/all_repos.json', JSON.stringify(all_repos));
	} catch (error) {
		if (error instanceof GraphqlResponseError) {
			console.error(
				`Request Failed: ${error.request} with message: ${error.message}`
			);
		} else {
			console.error(error);
		}
	}
}

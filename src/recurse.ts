import {
	constructMetadataString,
	type Member,
	type Repo,
	type UserRepos,
} from './utils';

const opts = {
	method: 'GET',
	headers: {
		'Content-Type': 'application/json',
		Authorization: `Bearer ${process.env.RC_TOKEN}`,
	},
};

async function paginated_fetch(
	url: string, // Improvised required argument in JS
	offset = 0,
	previousResponse: any[] = []
): Promise<any[]> {
	return fetch(`${url}?role=recurser&limit=50&offset=${offset}`, opts) // Append the page number to the base URL
		.then((response) => response.json())
		.then((newResponse: any) => {
			const response = [...previousResponse, ...newResponse]; // Combine the two arrays

			if (newResponse.length !== 0) {
				offset += newResponse.length;
				console.log(`Collected ${offset} profiles`);
				return paginated_fetch(url, offset, response);
			}

			return response;
		});
}

async function getAllRecursers() {
	const members_file = Bun.file('../data/members.json');
	let rc_members: Array<Member> = await members_file.json();
	let list_rc_members = rc_members.map((member) => member.login);

	try {
		console.log('Getting Recurse profiles');
		let profiles = await paginated_fetch(
			`https://www.recurse.com/api/v1/profiles`
		);

		console.log(`Got ${profiles.length} profiles`);
		Bun.write('../data/recursers.json', JSON.stringify(profiles));
	} catch (e) {
		console.error(e);
	}
}

async function recursersByStint() {
	const recursers_file = Bun.file('../data/recursers.json');
	let rc_members: Array<any> = await recursers_file.json();

	const members_file = Bun.file('../data/members.json');
	let github_members: Array<Member> = await members_file.json();

	// filter out whatever github usernames aren't present
	rc_members = rc_members.filter((rc) => rc.github !== null);

	for (let recurser of rc_members) {
		console.log(recurser.github);

		if (recurser.stints.length > 0) {
			for (let stint of recurser.stints) {
				console.log(
					`Started on ${stint.start_date} and ended on ${stint.end_date}`
				);
			}
		}
	}
}

async function printRepoNamesAndOwners() {
	const repoFile = Bun.file('../data/all_repos_partial.json');
	const data: UserRepos[] = await repoFile.json();

	let total_repos = 0;
	for (const datum of data.slice(0, 5)) {
		console.log(datum.user);
		total_repos += datum.repos.length;
		for (const repo of datum.repos.slice(0, 1)) {
			let metadata = constructMetadataString(repo);
			console.log(metadata);
		}
	}

	console.log(total_repos);
}

async function constructReadmeData() {
	const repoFile = Bun.file('../data/all_repos_partial.json');
	const data: UserRepos[] = await repoFile.json();

	const readmeFile = Bun.file('../data/readme-data.txt');
	const writer = readmeFile.writer();
	let total_repos = 0;
	for (const datum of data) {
		console.log(datum.user);

		for (const repo of datum.repos) {
			let metadata = constructMetadataString(repo);
			let repoReadme = repo.object?.text;

			if (repoReadme !== undefined) {
				metadata = '\n\n' + metadata + '\n' + repoReadme + '\n\n';
			}

			writer.write(metadata);
		}
	}
}

// constructReadmeData();

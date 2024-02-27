import {
	constructMetadataString,
	type Member,
	type Repo,
	type UserRepos,
} from './utils';

// const recursers_file = Bun.file('../data/recursers.json');
// let rc_members: Array<any> = await recursers_file.json();

// const members_file = Bun.file('../data/members.json');
// let github_members: Array<Member> = await members_file.json();

// // filter out whatever github usernames aren't present
// rc_members = rc_members.filter((rc) => rc.github !== null);

// for (let recurser of rc_members) {
// 	console.log(recurser.github);

// 	if (recurser.stints.length > 0) {
// 		for (let stint of recurser.stints) {
// 			console.log(
// 				`Started on ${stint.start_date} and ended on ${stint.end_date}`
// 			);
// 		}
// 	}
// }

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

constructReadmeData();

// printRepoNamesAndOwners();

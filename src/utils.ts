export interface Member {
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

export interface Repo {
	name: string;
	owner: {
		login: string;
	};
	description: string;
	stargazerCount: number;
	createdAt: string;
	updatedAt: string;
	isFork: boolean;
	url: string;
	object?: {
		text: string;
	};
	languages: {
		nodes: {
			name: string;
		}[];
	};
}

export interface UserRepos {
	user: string;
	repos: Repo[];
}

export interface ProcessedRepo {
	name: string;
	owner: string;
	description: string;
	createdAt: string;
	url: string;
	readme: string;
	languages: string[];
}

export function preprocessReadmeForEmbedding(readmeContent: string): string {
	// Remove Markdown URLS
	let cleanedContent = readmeContent.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

	// Remove HTML tags
	cleanedContent = cleanedContent.replace(/<[^>]*>/g, '');

	// Remove code blocks
	cleanedContent = cleanedContent.replace(/```[\s\S]*?```/g, '');
	cleanedContent = cleanedContent.replace(/`[^`]*`/g, '');

	// Remove images
	cleanedContent = cleanedContent.replace(/!\[[^\]]*\]\([^)]+\)/g, '');

	// Remove special characters and extra whitespace
	cleanedContent = cleanedContent.replace(/[^\w\s]/g, '');
	cleanedContent = cleanedContent.replace(/\s+/g, ' ');

	// Convert to lowercase
	cleanedContent = cleanedContent.toLowerCase();

	// Trim leading and trailing whitespace
	cleanedContent = cleanedContent.trim();

	return cleanedContent;
}

// Given a Repo, construct a metadata string like ->
// The Repo ${name} was made by ${owner.login} with the following description ${description}.
// The Repo ${name} was created at ${createdAt} using the following languages - ${languages.nodes}
export function constructMetadataString(repo: Repo): string {
	let metadata = `The Repo "${repo.name}" was made by ${repo.owner.login} at ${repo.createdAt}`;
	if (repo.description) {
		metadata += ` with the following description "${repo.description}"`;
	}

	let all_langs = '';
	if (repo.languages.nodes.length > 0) {
		let lang_list = repo.languages.nodes.map((l) => l.name);
		all_langs += lang_list.join(',');

		metadata += `\n"${repo.name}" uses the following languages: ${all_langs}`;
	}

	return metadata;
}

// Octokit.js

import { Octokit } from "octokit";

// https://github.com/octokit/core.js#readme
const octokit = new Octokit({
  auth: process.env["GITHUB_TOKEN"],
});

try {
  let iterator = octokit.paginate.iterator("GET /orgs/recursecenter/members", {
    org: "ORG",
    per_page: 100,
    headers: {
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });

  let memberData: any = [];
  let breakLoop = false;
  for await (const { data } of iterator) {
    if (breakLoop) break;
    console.log(...data);
    memberData = [...memberData, ...data];
  }

  const path = "./members.json";
  const bytes = await Bun.write(path, JSON.stringify(memberData));
  console.log(`${bytes} bytes written to file`);
} catch (error: any) {
  if (error.response) {
    console.error(
      `Error! Status: ${error.response.status}. Message: ${error.response.data.message}`,
    );
  }
  console.error(error);
}

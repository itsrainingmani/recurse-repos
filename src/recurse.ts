import type { Member } from "./utils";

const members_file = Bun.file("./data/members.json");
let rc_members: Array<Member> = await members_file.json();
let list_rc_members = rc_members.map((member) => member.login);

function is_required(name: string) {
  throw new Error(`Argument, \`${name}\`, is required.`);
}

const opts = {
  method: "GET",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.RC_TOKEN}`,
  },
};

console.log(opts);

async function paginated_fetch(
  url = is_required("url"), // Improvised required argument in JS
  offset = 0,
  previousResponse = [],
) {
  return fetch(`${url}?role=recurser&limit=50&offset=${offset}`, opts) // Append the page number to the base URL
    .then((response) => response.json())
    .then((newResponse) => {
      const response = [...previousResponse, ...newResponse]; // Combine the two arrays

      if (newResponse.length !== 0) {
        offset += newResponse.length;
        console.log(`Collected ${offset} profiles`);
        return paginated_fetch(url, offset, response);
      }

      return response;
    });
}

try {
  console.log("Getting Recurse profiles");
  let profiles = await paginated_fetch(
    `https://www.recurse.com/api/v1/profiles`,
  );

  console.log(`Got ${profiles.length} profiles`);
  Bun.write("./data/recursers.json", JSON.stringify(profiles));
} catch (e) {
  console.error(e);
}

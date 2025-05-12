"use server";
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
export const getGithubRepoStars = async () => {
  const res = await fetch(
    "https://api.github.com/repos/mrgwd/clips-compiler-prerelease",
    {
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: "application/vnd.github.v3+json",
      },
      next: {
        revalidate: 60 * 60,
      },
    }
  );
  if (!res.ok) {
    throw new Error("Failed to fetch data");
  }

  const data = await res.json();
  return data.stargazers_count;
};

import { getBranchName, getRepoName, openUrl } from "./util.mjs";

const main = async () => {
  // wait 2 seconds for the push to finish and github to sync
  await new Promise((resolve) => setTimeout(resolve, 2000));
  const branchName = await getBranchName();
  const repoUrl = await getRepoName();
  if (!branchName || !repoUrl) {
    return;
  }
  const repoName = repoUrl.replace(
    ".git",
    "/compare/" + branchName + "?expand=1",
  );
  openUrl(repoName);
};

main();

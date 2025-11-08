import { getBranchName } from "./util.mjs";

const main = async () => {
  const branchName = await getBranchName();
  if (["main", "develop"].includes(branchName)) {
    console.log(`Cannot push to branch ${branchName}`);
    process.exit(1);
  }
};

main();

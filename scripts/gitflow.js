const { exec } = require("child_process");

const [commitMessage] = process.argv.slice(2);

if (!commitMessage) {
  console.error("Error: Commit message argument is required.");
  process.exit(1);
}

exec("git add --all", (error) => {
  if (error) {
    logErr(error);
    process.exit(1);
  }

  exec(`git commit -m "${commitMessage}"`, (error) => {
    if (error) {
      logErr(error);
      process.exit(1);
    }

    exec("git push", (error) => {
      if (error) {
        logErr(error);
        process.exit(1);
      }

      console.log("Success: Changes pushed to remote repository.");
    });
  });
});

function logErr(err) {
  console.error(`Error: ${err.message}`);
}

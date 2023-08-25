import * as core from '@actions/core';
import * as github from '@actions/github';

export async function createComment(parameters: any, scanCommandOutput: any) {
  const context = github.context;
  const repository: any = process.env.GITHUB_REPOSITORY;
  const token = core.getInput('token');
  const repo = repository.split('/');
  const commentID: any = context.payload.pull_request?.number;
  const watermark = `<!-- Jest Coverage Comment: ${context.job} -->\n`

  //creating the body for the comment
  let commentBody = watermark + scanCommandOutput;
  commentBody = commentBody.substring(commentBody.indexOf('Scan Summary'));
  commentBody = commentBody.replace(
    '===\n---',
    '===\n<details><summary>details</summary><p>\n---'
  );
  commentBody = commentBody.replace('---\n\n===', '---\n</p></details>\n===');
  commentBody = commentBody.replace(/\n/g, '<br>');
  commentBody =
    '<br>![](https://www.veracode.com/themes/veracode_new/library/img/veracode-black-hires.svg)<br>' +
    commentBody;

  core.info('Comment Body ' + commentBody);

  if (parameters.debug == 1) {
    core.info('---- DEBUG OUTPUT START ----');
    core.info('---- index.ts / run() check if on PR  ----');
    core.info('---- Repository: ' + repository);
    core.info('---- Token: ' + token);
    core.info('---- Comment ID: ' + commentID);
    core.info('---- DEBUG OUTPUT END ----');
  }

  try {
    const octokit = github.getOctokit(token);
    if (parameters.edit_pr_comment == 'true') {
      const { data: comments } = await octokit.rest.issues.listComments({
        owner: repo[0],
        repo: repo[1],
        issue_number: commentID,
      });

      const comment = comments.find(
        (c) =>
          c.user?.login === 'github-actions[bot]' &&
          c.body?.startsWith(watermark)
      );

      if (comment) {
        core.info('Found previous comment, updating #' + comment.id)
        await octokit.rest.issues.updateComment({
          owner: repo[0],
          repo: repo[1],
          comment_id: comment.id,
          body: commentBody,
        });

        return;
      }
    }

    const { data: comment } = await octokit.rest.issues.createComment({
      owner: repo[0],
      repo: repo[1],
      issue_number: commentID,
      body: commentBody,
    });
    core.info('Adding scan results as comment to PR #' + commentID);
  } catch (error: any) {
    core.info(error);
  }
}

import os
from typing import Any, Dict
from github import Github, GithubException
from .base import BaseTool, ToolResult

class GithubTool(BaseTool):
    name = "github"
    description = "Interact with GitHub issues and repositories. Actions: create_issue, get_issue, add_comment."
    input_schema = {
        "title": "string (for create_issue)",
        "body": "string (for create_issue / add_comment)",
        "issue_number": "integer (for get_issue / add_comment)"
    }
    output_schema = {}
    
    async def execute(self, action: str, inputs: Dict[str, Any]) -> ToolResult:
        token = os.getenv("GITHUB_TOKEN")
        repo_name = os.getenv("GITHUB_REPO")
        
        if not token or not repo_name:
            return ToolResult(
                success=False, 
                error="GitHub credentials (GITHUB_TOKEN, GITHUB_REPO) are not configured.", 
                recoverable=True
            )
            
        try:
            g = Github(token)
            repo = g.get_repo(repo_name)
            
            if action == "create_issue":
                if "title" not in inputs:
                    return ToolResult(success=False, error="Missing required input: title", recoverable=True)
                issue = repo.create_issue(
                    title=inputs["title"], 
                    body=inputs.get("body", "")
                )
                return ToolResult(success=True, data={"issue_number": issue.number, "url": issue.html_url})
                
            elif action == "get_issue":
                if "issue_number" not in inputs:
                    return ToolResult(success=False, error="Missing required input: issue_number", recoverable=True)
                issue = repo.get_issue(number=inputs["issue_number"])
                return ToolResult(success=True, data={
                    "title": issue.title, 
                    "state": issue.state,
                    "body": issue.body,
                    "url": issue.html_url
                })
                
            elif action == "add_comment":
                if "issue_number" not in inputs or "body" not in inputs:
                    return ToolResult(success=False, error="Missing required input: issue_number or body", recoverable=True)
                issue = repo.get_issue(number=inputs["issue_number"])
                comment = issue.create_comment(inputs["body"])
                return ToolResult(success=True, data={"comment_id": comment.id, "url": comment.html_url})
                
            else:
                return ToolResult(success=False, error=f"Unsupported GitHub action: {action}", recoverable=False)
                
        except GithubException as e:
            # Re-raise or convert to a structure that FailureClassifier understands
            # GithubException(status, data)
            error_msg = f"GitHub API Error [{e.status}]: {e.data.get('message', str(e))}"
            # 401 Unauthorized, 403 Forbidden, 404 Not Found, 429 Rate Limit
            return ToolResult(success=False, error=error_msg, recoverable=True)
        except Exception as e:
            return ToolResult(success=False, error=str(e), recoverable=False)

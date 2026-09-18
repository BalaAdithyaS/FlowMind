import pandas as pd
import os
from typing import Tuple

def generate_synthetic_dataset() -> pd.DataFrame:
    """Generates a labeled synthetic dataset with realistic natural-language workflow requests."""
    data = [
        # EMAIL_AUTOMATION
        ("Send an email to user", "EMAIL_AUTOMATION"),
        ("Send welcome email", "EMAIL_AUTOMATION"),
        ("Email the report", "EMAIL_AUTOMATION"),
        ("Draft an email to the marketing team", "EMAIL_AUTOMATION"),
        ("Reply to the thread with status", "EMAIL_AUTOMATION"),
        
        # GITHUB_AUTOMATION
        ("Create a GitHub issue", "GITHUB_AUTOMATION"),
        ("Update issue on github", "GITHUB_AUTOMATION"),
        ("Comment on the PR", "GITHUB_AUTOMATION"),
        ("Open a pull request for branch main", "GITHUB_AUTOMATION"),
        ("Assign issue 45 to me", "GITHUB_AUTOMATION"),
        
        # FILE_AUTOMATION
        ("Read file from workspace", "FILE_AUTOMATION"),
        ("Create a folder", "FILE_AUTOMATION"),
        ("Move document", "FILE_AUTOMATION"),
        ("Delete the temporary files", "FILE_AUTOMATION"),
        ("Write this data into report.txt", "FILE_AUTOMATION"),
        
        # CALENDAR_AUTOMATION
        ("Schedule a meeting", "CALENDAR_AUTOMATION"),
        ("Add to calendar", "CALENDAR_AUTOMATION"),
        ("Create an event", "CALENDAR_AUTOMATION"),
        ("Set up a 1 on 1 for tomorrow", "CALENDAR_AUTOMATION"),
        ("Remind me next tuesday about the launch", "CALENDAR_AUTOMATION"),
        
        # TASK_AUTOMATION
        ("Create a task", "TASK_AUTOMATION"),
        ("Add to my todo list", "TASK_AUTOMATION"),
        ("Complete task 123", "TASK_AUTOMATION"),
        ("Mark the project as done", "TASK_AUTOMATION"),
        ("Update the ticket status", "TASK_AUTOMATION"),
        
        # MULTI_TOOL_AUTOMATION
        ("When a GitHub issue is created, create a task and notify me", "MULTI_TOOL_AUTOMATION"),
        ("Read the file and send an email about it", "MULTI_TOOL_AUTOMATION"),
        ("Schedule a meeting and create a project task", "MULTI_TOOL_AUTOMATION"),
        ("If email received, download attachment and create issue", "MULTI_TOOL_AUTOMATION"),
        ("Run the script, save to file, and email the boss", "MULTI_TOOL_AUTOMATION")
    ]
    
    df = pd.DataFrame(data, columns=["text", "intent"])
    return df

def get_dataset(save_path: str = None) -> Tuple[pd.Series, pd.Series]:
    """Returns X, y from the dataset. Saves to CSV if requested."""
    df = generate_synthetic_dataset()
    if save_path:
        os.makedirs(os.path.dirname(save_path), exist_ok=True)
        df.to_csv(save_path, index=False)
    
    return df["text"], df["intent"]

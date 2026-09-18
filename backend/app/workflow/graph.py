
from ..schemas.workflow import WorkflowSchema, WorkflowStep


class WorkflowGraph:
    def __init__(self, workflow: WorkflowSchema):
        self.workflow = workflow
        self.steps: dict[str, WorkflowStep] = {step.id: step for step in workflow.steps}
        self.adj_list: dict[str, list[str]] = {step.id: [] for step in workflow.steps}
        self.in_degree: dict[str, int] = {step.id: 0 for step in workflow.steps}
        
        self._build_graph()

    def _build_graph(self):
        for step in self.workflow.steps:
            for dep in step.depends_on:
                if dep in self.adj_list:
                    self.adj_list[dep].append(step.id)
                    self.in_degree[step.id] += 1

    def get_executable_steps(self, completed_steps: set[str]) -> list[WorkflowStep]:
        executable = []
        for step_id, degree in self.in_degree.items():
            if step_id not in completed_steps:
                # Check if all dependencies are in completed_steps
                step = self.steps[step_id]
                can_run = all(dep in completed_steps for dep in step.depends_on)
                if can_run:
                    executable.append(step)
        return executable

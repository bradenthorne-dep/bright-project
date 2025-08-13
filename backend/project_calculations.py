"""
Project calculations module for project management applications

Contains functions for calculating project metrics, budget information,
and task-related statistics.
"""

from typing import List, Dict, Any
from datetime import datetime


def calculate_task_metrics(tasks_data: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Calculate task-related metrics from tasks data
    
    Args:
        tasks_data: List of task dictionaries
        
    Returns:
        Dictionary containing task metrics
    """
    total_tasks = len(tasks_data)
    tasks_completed = sum(1 for task in tasks_data if task['status'].lower() == 'complete')
    tasks_in_progress = sum(1 for task in tasks_data if task['status'].lower() == 'in progress')
    tasks_on_hold = sum(1 for task in tasks_data if task['status'].lower() == 'on hold')
    tasks_open = sum(1 for task in tasks_data if task['status'].lower() not in ['complete', 'in progress', 'on hold'])
    
    # Calculate completion percentage based on actual completion percentages
    avg_completion = sum(task['completion_percentage'] for task in tasks_data) / total_tasks if total_tasks > 0 else 0
    
    return {
        "total_tasks": total_tasks,
        "tasks_completed": tasks_completed,
        "tasks_in_progress": tasks_in_progress,
        "tasks_on_hold": tasks_on_hold,
        "tasks_open": tasks_open,
        "completion_percentage": round(avg_completion, 1)
    }


def calculate_top_tasks(tasks_data: List[Dict[str, Any]], hourly_rate: float, limit: int = 5) -> List[Dict[str, Any]]:
    """
    Calculate top tasks by billable hours with total cost
    
    Args:
        tasks_data: List of task dictionaries
        hourly_rate: Hourly rate for cost calculations
        limit: Number of top tasks to return
        
    Returns:
        List of top tasks with cost calculations
    """
    sorted_tasks = sorted(tasks_data, key=lambda x: x['billable_hours'], reverse=True)
    top_tasks = []
    
    for task in sorted_tasks[:limit]:
        top_tasks.append({
            "task": task['task_name'],
            "billable_hours": task['billable_hours'],
            "total_cost": task['billable_hours'] * hourly_rate
        })
    
    return top_tasks


def calculate_budget_info(tasks_data: List[Dict[str, Any]], allocated_budget: float, hourly_rate: float) -> Dict[str, Any]:
    """
    Calculate budget-related information from tasks and project data
    
    Args:
        tasks_data: List of task dictionaries
        allocated_budget: Total allocated budget for the project
        hourly_rate: Hourly rate for cost calculations
        
    Returns:
        Dictionary containing budget information
    """
    # Calculate total spent budget from billable hours
    total_billable_hours = sum(task['billable_hours'] for task in tasks_data)
    spent_budget = total_billable_hours * hourly_rate
    remaining_budget = allocated_budget - spent_budget
    budget_utilization = (spent_budget / allocated_budget) * 100 if allocated_budget > 0 else 0
    
    return {
        "allocated_budget": allocated_budget,
        "spent_budget": round(spent_budget, 2),
        "utilized_budget": round(spent_budget, 2),
        "budget_utilization_percentage": round(budget_utilization, 1),
        "remaining_budget": round(remaining_budget, 2)
    }


def calculate_project_overview(tasks_data: List[Dict[str, Any]], project_info: Dict[str, Any], 
                             allocated_budget: float, hourly_rate: float) -> Dict[str, Any]:
    """
    Calculate complete project overview data
    
    Args:
        tasks_data: List of task dictionaries
        project_info: Project information dictionary
        allocated_budget: Total allocated budget for the project
        hourly_rate: Hourly rate for cost calculations
        
    Returns:
        Complete project overview dictionary
    """
    task_metrics = calculate_task_metrics(tasks_data)
    top_tasks = calculate_top_tasks(tasks_data, hourly_rate)
    budget_info = calculate_budget_info(tasks_data, allocated_budget, hourly_rate)
    
    return {
        "project_info": project_info,
        "task_metrics": task_metrics,
        "budget_info": budget_info,
        "hourly_rate": hourly_rate,
        "top_tasks": top_tasks
    }


def calculate_days_remaining(due_date: str) -> int:
    """
    Calculate days remaining until due date
    
    Args:
        due_date: Due date string in YYYY-MM-DD format
        
    Returns:
        Number of days remaining (negative if overdue)
    """
    today = datetime.now().date()
    due = datetime.strptime(due_date, '%Y-%m-%d').date()
    diff_days = (due - today).days
    return diff_days


def calculate_risk_level(task: Dict[str, Any], days_remaining: int) -> str:
    """
    Calculate risk level for a task based on due date, completion, and priority
    
    Args:
        task: Task dictionary containing status, priority, completion_percentage
        days_remaining: Number of days until due date
        
    Returns:
        Risk level: 'High', 'Medium', or 'Low'
    """
    # High risk: Overdue or due within 3 days with less than 90% completion
    if days_remaining < 0:
        return 'High'
    if days_remaining <= 3 and task['completion_percentage'] < 90:
        return 'High'
    
    # Medium risk: Due within 7 days with less than 75% completion, or high priority behind schedule
    if days_remaining <= 7 and task['completion_percentage'] < 75:
        return 'Medium'
    if task['priority'] == 'High' and task['completion_percentage'] < 80:
        return 'Medium'
    
    # Low risk: Due within 14 days with less than 50% completion
    if days_remaining <= 14 and task['completion_percentage'] < 50:
        return 'Low'
    
    return 'Low'


def format_days_remaining(days: int) -> str:
    """
    Format days remaining into human-readable string
    
    Args:
        days: Number of days remaining
        
    Returns:
        Formatted string describing days remaining
    """
    if days < 0:
        return f"{abs(days)} days overdue"
    elif days == 0:
        return "Due today"
    elif days == 1:
        return "1 day remaining"
    else:
        return f"{days} days remaining"


def calculate_risk_assessment(tasks_data: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Calculate complete risk assessment for all tasks
    
    Args:
        tasks_data: List of task dictionaries
        
    Returns:
        Dictionary containing risk assessment data and summary statistics
    """
    # Filter out completed tasks
    incomplete_tasks = [task for task in tasks_data if task['status'].lower() != 'complete']
    
    # Calculate risk data for each task
    risk_tasks = []
    for task in incomplete_tasks:
        days_remaining = calculate_days_remaining(task['due_date'])
        risk_level = calculate_risk_level(task, days_remaining)
        
        # Include tasks that are at risk based on our criteria
        is_at_risk = (
            days_remaining < 0 or  # Overdue
            (days_remaining <= 14 and task['completion_percentage'] < 90) or  # Due soon and not nearly complete
            (task['priority'] == 'High' and task['completion_percentage'] < 80)  # High priority behind schedule
        )
        
        if is_at_risk:
            risk_task = {
                **task,
                "days_remaining": days_remaining,
                "days_remaining_formatted": format_days_remaining(days_remaining),
                "risk_level": risk_level
            }
            risk_tasks.append(risk_task)
    
    # Sort by risk level (High > Medium > Low), then by days remaining (ascending)
    risk_order = {'High': 3, 'Medium': 2, 'Low': 1}
    risk_tasks.sort(key=lambda x: (risk_order[x['risk_level']], x['days_remaining']), reverse=True)
    
    # Calculate summary statistics
    high_risk_count = sum(1 for task in risk_tasks if task['risk_level'] == 'High')
    medium_risk_count = sum(1 for task in risk_tasks if task['risk_level'] == 'Medium')
    low_risk_count = sum(1 for task in risk_tasks if task['risk_level'] == 'Low')
    
    return {
        "risk_tasks": risk_tasks,
        "summary": {
            "total_at_risk": len(risk_tasks),
            "high_risk_count": high_risk_count,
            "medium_risk_count": medium_risk_count,
            "low_risk_count": low_risk_count
        }
    }
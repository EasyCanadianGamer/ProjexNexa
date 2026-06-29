// utils.ts
export const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high': return 'text-red-600 bg-red-50 dark:bg-red-100 dark:text-red-800';
      case 'medium': return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-100 dark:text-yellow-800';
      case 'low': return 'text-green-600 bg-green-50 dark:bg-green-100 dark:text-green-800';
      default: return 'text-gray-600 bg-gray-50 dark:bg-gray-100 dark:text-gray-800';
    }
  };

export function getDeadlineDisplay(
  deadline: string | null | undefined,
  daysLeft: number
): { text: string; className: string } {
  if (!deadline) {
    return { text: 'No deadline', className: 'text-gray-500 dark:text-gray-400' };
  }
  if (daysLeft > 14) {
    const [year, month, day] = deadline.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    const text = date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    return { text, className: 'text-gray-900 dark:text-gray-100' };
  }
  if (daysLeft >= 1) {
    const label = daysLeft === 1 ? 'day' : 'days';
    return { text: `${daysLeft} ${label} left`, className: 'text-amber-600' };
  }
  return { text: 'Overdue', className: 'text-red-600 font-semibold' };
}
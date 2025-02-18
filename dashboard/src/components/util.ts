// utils.ts
export const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high': return 'text-red-600 bg-red-50 dark:bg-red-100 dark:text-red-800';
      case 'medium': return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-100 dark:text-yellow-800';
      case 'low': return 'text-green-600 bg-green-50 dark:bg-green-100 dark:text-green-800';
      default: return 'text-gray-600 bg-gray-50 dark:bg-gray-100 dark:text-gray-800';
    }
  };
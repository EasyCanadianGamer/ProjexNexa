export type Milestone = {
    percent: number;
    name: string;
    descriptions:string;
    completed: boolean;
  };
  
  export type Project = {
    id: string;
    name: string;
    description: string;
    progress: number;
    tasks: { completed: number; total: number };
    daysLeft: number;
    priority: "High" | "Medium" | "Low";
    category: string;
    deadline: string | null;
    milestones: Milestone[];
  };
  

  export type ProjectFormData = Omit<Project, 'id' | 'progress'> & { id?: string };
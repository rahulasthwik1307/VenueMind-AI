export interface OperationsAction {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  assignedTo?: string;
  incidentId?: string;
  dueDate?: string;
  createdAt: string;
}

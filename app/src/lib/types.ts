export type Priority = 'LOW' | "MEDIUM" | "HIGH";

export type AssignmentFormData  = {
    title: string;
    dueDate: string;
    priority?: Priority;
    notes?: string | null;
};
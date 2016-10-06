export interface ProgressDialogModel {
    Done?: number;
    All?: number;
    Header: string;
    Percent?: number;
    IsDone?: boolean;
    IsCancelled?: boolean;
    ErrorCount?: number;
}

export class Notification {
    type: 'error' | 'info' | 'success' | 'warning' | 'custom';
    message: string;
    title: string;
    timestamp: number;
}

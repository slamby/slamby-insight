export interface SelectedItem<T> {
    Id?: string;
    Name?: string;
    IsSelected: boolean;
    Item?: T;
}

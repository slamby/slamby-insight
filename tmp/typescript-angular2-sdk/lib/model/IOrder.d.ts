export interface IOrder {
    OrderDirection?: IOrder.IOrderDirectionEnum;
    OrderByField?: string;
}
export declare namespace IOrder {
    enum IOrderDirectionEnum {
        Asc,
        Desc,
    }
}

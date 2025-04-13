import { OrderStatusType } from "src/types/order-status.type";

export class OrderStatusUtil {
  static getStatusAndColor(status: OrderStatusType | undefined | null): {
    name: string;
    color: string;
  } {
    let name = "Новый";
    let color = "#456f49";

    switch (status) {
      case OrderStatusType.delivery:
        name = "Доставка";
        break;
      case OrderStatusType.cancelled:
        name = "Отменён";
        color = "#ff7575";
        break;
      case OrderStatusType.pending:
        name = "Обработка";
        break;
      case OrderStatusType.success:
        name = "Выполнен";
        color = "#b6d5b9";
        break;
      default:
        break;
    }

    return { name, color };
  }
}

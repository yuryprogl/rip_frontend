import { Button, Badge } from "react-bootstrap";
import cartIcon from "../../assets/cart.svg"; // Убедитесь, что иконка лежит здесь

interface CartWidgetProps {
  count: number;
}

export default function CartWidget({ count }: CartWidgetProps) {
  return (
    // position-relative нужен, чтобы значок позиционировался относительно кнопки
    <Button variant="primary" className="position-relative" disabled>
      <img
        src={cartIcon}
        alt="Корзина"
        style={{ width: "32px", height: "32px" }}
      />

      {/* Отображаем значок, только если в корзине есть товары 
      {count > 0 && (
        <Badge
          pill
          bg="danger" // Яркий цвет для привлечения внимания
          className="position-absolute top-0 start-100 translate-middle"
        >
          {count}
        </Badge>
      )}*/}
      <Badge
        pill
        bg="danger" // Яркий цвет для привлечения внимания
        className="position-absolute top-0 start-100 translate-middle"
      >
        {count}
      </Badge>
    </Button>
  );
}

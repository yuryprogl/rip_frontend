// src/components/BreadCrumbs/BreadCrumbs.tsx

import { Breadcrumb } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";
import { ROUTES } from "../../Routes";

// Интерфейс для описания одной "крошки"
interface Crumb {
  label: string; // Текст, который видит пользователь
  path?: string; // Путь для ссылки (необязательный, т.к. последняя крошка не ссылка)
}

// Интерфейс для пропсов компонента
interface BreadCrumbsProps {
  crumbs: Crumb[];
}

export default function BreadCrumbs({ crumbs }: BreadCrumbsProps) {
  return (
    <Breadcrumb>
      {/* Первая крошка - всегда ссылка на главную страницу */}
      <LinkContainer to={ROUTES.HOME}>
        <Breadcrumb.Item>Главная</Breadcrumb.Item>
      </LinkContainer>

      {/* Проходим по массиву крошек, который получили через props */}
      {crumbs.map((crumb, index) => {
        // Если у крошки есть путь и это не последняя крошка в массиве, делаем ее ссылкой
        const isLast = index === crumbs.length - 1;
        if (crumb.path && !isLast) {
          return (
            <LinkContainer key={index} to={crumb.path}>
              <Breadcrumb.Item>{crumb.label}</Breadcrumb.Item>
            </LinkContainer>
          );
        } else {
          // Иначе делаем ее неактивным текстом
          return (
            <Breadcrumb.Item key={index} active>
              {crumb.label}
            </Breadcrumb.Item>
          );
        }
      })}
    </Breadcrumb>
  );
}

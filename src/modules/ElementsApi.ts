import type { Element, CartInfo } from "./ElementsTypes";
import { ELEMENTS_MOCK } from "./mock";

// ВАШ РАБОЧИЙ IP (из curl)
const LAN_IP = "192.168.1.25";
const LAN_API_URL = `http://${LAN_IP}:8000`;
const MINIO_URL = `http://${LAN_IP}:9000`;

// Проверка среды запуска
const IS_TAURI =
  typeof window !== "undefined" &&
  typeof (window as any).__TAURI_INTERNALS__ !== "undefined";

// В Tauri используем IP, в браузере (dev) - прокси или тот же IP
const BASE_URL = IS_TAURI ? LAN_API_URL : LAN_API_URL;

console.log(`API URL: ${BASE_URL}`);

export async function listElements(nameFilter?: string): Promise<Element[]> {
  try {
    const params = new URLSearchParams();
    if (nameFilter) params.append("element_name", nameFilter);

    const url = `${BASE_URL}/api/elements/?${params.toString()}`;
    const response = await fetch(url);

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data: Element[] = await response.json();

    // ФИКС КАРТИНОК: Заменяем localhost на IP локальной сети
    return data.map((el) => {
      if (el.image) {
        // Если пришел localhost, меняем на 192.168.105.1
        if (el.image.includes("localhost:9000")) {
          el.image = el.image.replace("localhost:9000", `${LAN_IP}:9000`);
        }
        // Если пришел относительный путь (редко), добавляем полный адрес
        else if (!el.image.startsWith("http")) {
          el.image = `${MINIO_URL}${el.image}`;
        }
      }
      return el;
    });
  } catch (error) {
    console.error("API Error:", error);
    if (IS_TAURI) alert(`Error: ${error}\nURL: ${BASE_URL}`);

    // Fallback
    if (nameFilter) {
      return ELEMENTS_MOCK.filter((element) =>
        element.name.toLowerCase().includes(nameFilter.toLowerCase())
      );
    }
    return ELEMENTS_MOCK;
  }
}

export async function getElement(id: number): Promise<Element | null> {
  try {
    const response = await fetch(`${BASE_URL}/api/elements/${id}/`);
    if (!response.ok) throw new Error(`${response.status}`);

    const el: Element = await response.json();

    // Тот же фикс для одной картинки
    if (el.image) {
      if (el.image.includes("localhost:9000")) {
        el.image = el.image.replace("localhost:9000", `${LAN_IP}:9000`);
      } else if (!el.image.startsWith("http")) {
        el.image = `${MINIO_URL}${el.image}`;
      }
    }
    return el;
  } catch (error) {
    return ELEMENTS_MOCK.find((element) => element.id === id) || null;
  }
}

export async function getCartInfoMock(): Promise<CartInfo> {
  try {
    const response = await fetch(`${BASE_URL}/api/forecasts/cart/mock/`);
    if (!response.ok) throw new Error(`${response.status}`);
    return await response.json();
  } catch (error) {
    return { elements_count: 0, draft_forecast: 0 };
  }
}

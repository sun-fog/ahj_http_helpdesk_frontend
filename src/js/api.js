// const API_URL = 'https://helpdesk-for-students.kv.w-s.io/';
const API_URL = 'http://localhost:7070/';

/**
 * Базовый запрос к API.
 * Все POST-запросы ходят в JSON: сериализуем тело и ставим заголовок
 * Content-Type: application/json (требование задания).
 */
async function request(params, body = null) {
  const query = new URLSearchParams(params).toString();
  const response = await fetch(`${API_URL}?${query}`, {
    method: body ? 'POST' : 'GET',
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    throw new Error(`Ошибка сети: ${response.status} ${response.statusText}`);
  }

  // Сервер отвечает 204 (No Content) на успешное удаление
  if (response.status === 204) return null;

  try {
    return await response.json();
  } catch (err) {
    return null;
  }
}

export const getAllTickets = () => request({ method: 'allTickets' });

export const getTicketById = (id) => request({ method: 'ticketById', id });

export const createTicket = (data) => request({ method: 'createTicket' }, data);

export const updateTicket = (id, data) => request({ method: 'updateById', id }, data);

// deleteById по заданию — GET, успешный ответ 204
export const deleteTicket = (id) => request({ method: 'deleteById', id });

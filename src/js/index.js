import '../css/style.css';
import {
  getAllTickets,
  getTicketById,
  createTicket,
  updateTicket,
  deleteTicket,
} from './api';

const ticketsEl = document.getElementById('tickets');
const loaderEl = document.getElementById('loader');
const errorEl = document.getElementById('error');

const ticketModal = document.getElementById('ticket-modal');
const modalTitle = document.getElementById('modal-title');
const ticketForm = document.getElementById('ticket-form');

const confirmModal = document.getElementById('confirm-modal');
const confirmYes = document.getElementById('confirm-yes');
const confirmNo = document.getElementById('confirm-no');

let editingId = null;   // id тикета в режиме редактирования
let removingId = null;  // id тикета, подтверждаемого к удалению

// ---------- вспомогательное ----------

function toggle(el, show) {
  el.classList.toggle('hidden', !show);
}

function showError(message) {
  errorEl.textContent = message;
  toggle(errorEl, true);
  setTimeout(() => toggle(errorEl, false), 5000);
}

function formatDate(timestamp) {
  const d = new Date(Number(timestamp));
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} ` +
    `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function openModal(modal) {
  toggle(modal, true);
}

function closeModal(modal) {
  toggle(modal, false);
}

// ---------- рендер списка ----------

function render(tickets) {
  ticketsEl.innerHTML = '';
  if (!Array.isArray(tickets) || tickets.length === 0) {
    ticketsEl.innerHTML = '<p class="empty">Заявок пока нет. Создайте первую!</p>';
    return;
  }

  tickets.forEach((ticket) => {
    const row = document.createElement('div');
    row.className = 'ticket';
    row.dataset.id = ticket.id;

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'ticket__status';
    checkbox.checked = Boolean(ticket.status);

    const body = document.createElement('div');
    body.className = 'ticket__body';

    const name = document.createElement('span');
    name.className = 'ticket__name';
    name.textContent = ticket.name;

    const date = document.createElement('span');
    date.className = 'ticket__date';
    date.textContent = formatDate(ticket.created);

    body.append(name, date);

    const editBtn = document.createElement('button');
    editBtn.type = 'button';
    editBtn.className = 'button button_icon';
    editBtn.textContent = '✎';
    editBtn.title = 'Редактировать';

    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'button button_icon';
    removeBtn.textContent = '✕';
    removeBtn.title = 'Удалить';

    row.append(checkbox, body, editBtn, removeBtn);
    ticketsEl.append(row);
  });
}

// Загрузка списка с сервера
async function load() {
  toggle(loaderEl, true);
  try {
    render(await getAllTickets());
  } catch (err) {
    showError(err.message);
  } finally {
    toggle(loaderEl, false);
  }
}

// ---------- модалка добавления / редактирования ----------

document.getElementById('add-ticket').addEventListener('click', () => {
  editingId = null;
  modalTitle.textContent = 'Добавить тикет';
  ticketForm.reset();
  openModal(ticketModal);
});

// Редактирование: сначала получаем полное описание тикета
async function openEditModal(id) {
  try {
    const ticket = await getTicketById(id);
    if (!ticket) return;
    editingId = id;
    modalTitle.textContent = 'Редактировать тикет';
    ticketForm.elements.name.value = ticket.name;
    ticketForm.elements.description.value = ticket.description || '';
    openModal(ticketModal);
  } catch (err) {
    showError(err.message);
  }
}

ticketForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const data = {
    name: ticketForm.elements.name.value.trim(),
    description: ticketForm.elements.description.value.trim(),
    status: false,
  };
  if (!data.name) return;

  try {
    if (editingId === null) {
      await createTicket(data);
    } else {
      // status берём из чекбокса тикета, чтобы не сбросить отметку о выполнении
      const row = ticketsEl.querySelector(`[data-id="${editingId}"]`);
      data.status = row ? row.querySelector('.ticket__status').checked : false;
      await updateTicket(editingId, data);
    }
    closeModal(ticketModal);
    load();
  } catch (err) {
    showError(err.message);
  }
});

// ---------- удаление ----------

confirmYes.addEventListener('click', async () => {
  try {
    await deleteTicket(removingId);
  } catch (err) {
    showError(err.message);
  }
  closeModal(confirmModal);
  load();
});

confirmNo.addEventListener('click', () => closeModal(confirmModal));

// Общие кнопки "Отмена"
document.querySelectorAll('[data-close]').forEach((btn) =>
  btn.addEventListener('click', () => closeModal(ticketModal)),
);

// ---------- клики по списку (делегирование) ----------

ticketsEl.addEventListener('click', async (e) => {
  const row = e.target.closest('.ticket');
  if (!row) return;
  const id = row.dataset.id;

  if (e.target.classList.contains('ticket__status')) {
    // Отметка о выполнении: подтягиваем тикет целиком, чтобы не потерять поля
    try {
      const ticket = await getTicketById(id);
      await updateTicket(id, {
        name: ticket.name,
        description: ticket.description,
        status: e.target.checked,
      });
      load();
    } catch (err) {
      showError(err.message);
    }
    return;
  }

  if (e.target.title === 'Редактировать') {
    openEditModal(id);
    return;
  }

  if (e.target.title === 'Удалить') {
    removingId = id;
    openModal(confirmModal);
    return;
  }

  // Клик по телу тикета — показываем/прячем полное описание.
  // Подробное описание специально грузится отдельным запросом ticketById.
  const existing = row.querySelector('.ticket__description');
  if (existing) {
    existing.remove();
    return;
  }

  try {
    const ticket = await getTicketById(id);
    if (!ticket) return;
    const desc = document.createElement('p');
    desc.className = 'ticket__description';
    desc.textContent = ticket.description || '(без подробного описания)';
    row.append(desc);
  } catch (err) {
    showError(err.message);
  }
});

load();

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const screens = $$('[data-screen]');
const yesButton = $('#yes-button');
const noButton = $('#no-button');
const noPlaceholder = $('#no-placeholder');
const hint = $('#question-hint');
const title = $('#question-title');
const finalMessage = $('#final-message');
const finalEmoji = $('#final-emoji');
const shareButton = $('#share-button');
const restartButton = $('#restart-button');
const status = $('#status');
const calendarForm = $('#calendar-form');
const dateInput = $('#date-input');
const timeInput = $('#time-input');
const confirmButton = $('#confirm-button');
const calendarDownload = $('#calendar-download');
const duration = 90; // Duración del evento en minutos.
const params = new URLSearchParams(window.location.search);
const guestName = (params.get('nombre') || 'Tania').trim().slice(0, 40) || 'Tania';
title.textContent = `${guestName}, ¿tenemos una cita? 💗`;

let attempts = 0;
let isRunning = false;
let selectedPlan = '';
let selectedDate = '';
let selectedTime = '';
let icsUrl = '';
const phrases = ['No', '¿Segura, Tania?', '¿Y un besito? 😘', 'Piénsalo, amor', 'Ese no cuenta', 'Mejor di que sí 💕', 'Te adoro 😌'];

function showScreen(name) {
  screens.forEach((screen) => {
    const active = screen.dataset.screen === name;
    screen.hidden = !active;
    screen.classList.toggle('is-active', active);
  });
}

function moveNoButton(pointerX = innerWidth / 2, pointerY = innerHeight / 2) {
  if (!isRunning) {
    const rect = noButton.getBoundingClientRect();
    noPlaceholder.style.width = `${rect.width}px`;
    noPlaceholder.style.height = `${rect.height}px`;
    noButton.style.width = `${rect.width}px`;
    noButton.style.left = `${rect.left}px`;
    noButton.style.top = `${rect.top}px`;
    noButton.classList.add('is-running');
    isRunning = true;
  }
  const rect = noButton.getBoundingClientRect();
  const padding = 14;
  const maxX = Math.max(padding, innerWidth - rect.width - padding);
  const maxY = Math.max(padding, innerHeight - rect.height - padding);
  let x = padding;
  let y = padding;
  for (let i = 0; i < 50; i += 1) {
    x = padding + Math.random() * Math.max(1, maxX - padding);
    y = padding + Math.random() * Math.max(1, maxY - padding);
    if (Math.hypot(x + rect.width / 2 - pointerX, y + rect.height / 2 - pointerY) > 190) break;
  }
  attempts += 1;
  noButton.style.left = `${x}px`;
  noButton.style.top = `${y}px`;
  noButton.textContent = phrases[attempts % phrases.length];
  hint.textContent = attempts === 1
    ? 'Ups, ese botón sabe que Isaí quiere verte feliz. 💞'
    : `Intento ${attempts}. El botón «Sí» te espera, mi amor. 💕`;
}

function pointerNearNoButton(event) {
  if ($('[data-screen="question"]').hidden) return;
  const rect = noButton.getBoundingClientRect();
  const dx = Math.max(rect.left - event.clientX, 0, event.clientX - rect.right);
  const dy = Math.max(rect.top - event.clientY, 0, event.clientY - rect.bottom);
  if (Math.hypot(dx, dy) < 95) moveNoButton(event.clientX, event.clientY);
}
document.addEventListener('pointermove', pointerNearNoButton);
document.addEventListener('pointerdown', pointerNearNoButton);
noButton.addEventListener('click', (event) => {
  event.preventDefault();
  moveNoButton(event.clientX, event.clientY);
});
noButton.addEventListener('focus', () => {
  const rect = noButton.getBoundingClientRect();
  moveNoButton(rect.left + rect.width / 2, rect.top + rect.height / 2);
  yesButton.focus();
});

yesButton.addEventListener('click', () => showScreen('plans'));

$$('.plan').forEach((button) => {
  button.addEventListener('click', () => {
    selectedPlan = button.dataset.plan;
    finalEmoji.textContent = button.dataset.emoji || '✨';
    $('#calendar-plan').textContent = `Elegiste ${selectedPlan}. Escoge cuándo te gustaría que salgamos, amor.`;
    // Fecha minima en horario local del navegador, sin UTC.
    const today = new Date();
    const localDate = [today.getFullYear(), String(today.getMonth() + 1).padStart(2, '0'), String(today.getDate()).padStart(2, '0')].join('-');
    dateInput.min = localDate;
    if (!dateInput.value || dateInput.value < localDate) dateInput.value = localDate;
    showScreen('calendar');
  });
});
$('#back-to-plans').addEventListener('click', () => showScreen('plans'));

function escapeIcs(value) {
  return String(value).replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');
}
function icsStamp(date) {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}
function updateCalendarFile(start) {
  if (icsUrl) URL.revokeObjectURL(icsUrl);
  const end = new Date(start.getTime() + duration * 60000);
  const lines = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Isai para Tania//ES', 'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT', `UID:${crypto.randomUUID ? crypto.randomUUID() : Date.now() + '-invitacion'}@invitacion`,
    `DTSTAMP:${icsStamp(new Date())}`, `DTSTART:${icsStamp(start)}`, `DTEND:${icsStamp(end)}`,
    `SUMMARY:${escapeIcs(`Isaí y Tania 💖 — ${selectedPlan}`)}`,
    `DESCRIPTION:${escapeIcs(`Una cita especial para ${guestName}, preparada con amor por Isaí. Fecha propuesta; pendiente de acordar entre los dos.`)}`,
    'END:VEVENT', 'END:VCALENDAR'
  ];
  icsUrl = URL.createObjectURL(new Blob([lines.join('\r\n') + '\r\n'], { type: 'text/calendar;charset=utf-8' }));
  calendarDownload.href = icsUrl;
}

calendarForm.addEventListener('submit', (event) => {
  event.preventDefault();
  selectedDate = dateInput.value;
  selectedTime = timeInput.value;
  const start = new Date(`${selectedDate}T${selectedTime}:00`);
  if (!selectedDate || !selectedTime || !Number.isFinite(start.getTime()) || start.getTime() < Date.now()) {
    status.textContent = 'Selecciona una fecha y hora futuras.';
    return;
  }
  status.textContent = '';
  const message = `${guestName}, nuestro plan será ${selectedPlan}`;
  finalMessage.textContent = `${message} para el ${new Intl.DateTimeFormat('es', { dateStyle: 'long' }).format(start)} a las ${selectedTime}. ¡Ya quiero verte, amor! — Isaí 💗`;
  updateCalendarFile(start);
  showScreen('final');
});

shareButton.addEventListener('click', async () => {
  const message = `¡Isaí y ${guestName} tienen una cita! 💖 Plan: ${selectedPlan}. Fecha propuesta: ${selectedDate} a las ${selectedTime}.`;
  try {
    if (navigator.share) {
      await navigator.share({ title: 'Isaí y Tania 💌', text: message });
      status.textContent = 'Respuesta compartida.';
      return;
    }
    await navigator.clipboard.writeText(message);
    status.textContent = 'Respuesta copiada al portapapeles.';
  } catch (error) {
    if (error?.name !== 'AbortError') status.textContent = 'No se pudo compartir automáticamente.';
  }
});
restartButton.addEventListener('click', () => {
  attempts = 0;
  selectedPlan = '';
  selectedDate = '';
  selectedTime = '';
  hint.textContent = 'Porque incluso siendo mi novia, me sigue emocionando invitarte a una cita. 💗';
  noButton.textContent = 'No';
  dateInput.value = '';
  if (icsUrl) URL.revokeObjectURL(icsUrl);
  icsUrl = '';
  if (isRunning) {
    noButton.classList.remove('is-running');
    noButton.removeAttribute('style');
    noPlaceholder.removeAttribute('style');
    isRunning = false;
  }
  status.textContent = '';
  showScreen('question');
});
window.addEventListener('resize', () => {
  if (!isRunning) return;
  const rect = noButton.getBoundingClientRect();
  const padding = 14;
  const left = Math.min(Math.max(padding, rect.left), Math.max(padding, innerWidth - rect.width - padding));
  const top = Math.min(Math.max(padding, rect.top), Math.max(padding, innerHeight - rect.height - padding));
  noButton.style.left = `${left}px`;
  noButton.style.top = `${top}px`;
});

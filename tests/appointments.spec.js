const { test, expect } = require('@playwright/test');

const customerUser = {
  email: 'customer@example.com',
  password: 'customer123',
};

const futureDateInput = (minutesAhead = 180) => {
  const date = new Date(Date.now() + minutesAhead * 60 * 1000);
  const tzOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
};

const getDisplayFromInput = (inputValue) => {
  const date = new Date(inputValue);
  return {
    dateText: date.toLocaleDateString(),
    timeText: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };
};

const loginAsCustomer = async (page) => {
  await page.goto('/login');
  await page.fill('input[type="email"]', customerUser.email);
  await page.fill('input[type="password"]', customerUser.password);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/dashboard|\/portal/, { timeout: 15000 });
};

const gotoAppointmentsPage = async (page) => {
  await loginAsCustomer(page);
  await page.goto('/portal/appointments');
  await page.waitForLoadState('networkidle');
  await expect(page.locator('h1.page-title')).toHaveText(/My Appointments/i);
};

const openBookingForm = async (page) => {
  const bookButton = page.getByRole('button', { name: /Book Appointment/i }).first();
  await bookButton.waitFor({ state: 'visible' });
  await bookButton.click();
  await expect(page.locator('.modal-content')).toBeVisible();
};

const createAppointmentViaUI = async (page, {
  service = 'Fitting',
  minutesAhead = 240,
  notes = `QA appointment ${Date.now()}`,
} = {}) => {
  await openBookingForm(page);
  await page.locator('#service').selectOption({ label: service });
  const dateInput = futureDateInput(minutesAhead);
  await page.fill('#scheduledAt', dateInput);
  await page.fill('#notes', notes);
  await page.locator('.modal-content button[type="submit"]').click();
  await expect(page.locator('.modal-content')).toBeHidden({ timeout: 15000 });

  const card = page.locator('.appointment-card', { hasText: notes }).first();
  await expect(card).toBeVisible({ timeout: 15000 });

  return { notes, service, minutesAhead, dateInput, card };
};

test.describe.serial('Customer appointment management', () => {
  test.beforeEach(async ({ page }) => {
    await gotoAppointmentsPage(page);
  });

  test('Customer can book a new appointment and see it listed', async ({ page }) => {
    const uniqueNotes = `QA booking ${Date.now()}`;
    const service = 'Consultation';
    const appointment = await createAppointmentViaUI(page, {
      service,
      minutesAhead: 360,
      notes: uniqueNotes,
    });

    const { dateText, timeText } = getDisplayFromInput(appointment.dateInput);
    const card = page.locator('.appointment-card', { hasText: uniqueNotes }).first();
    await expect(card).toContainText(service);
    await expect(card).toContainText(dateText);
    await expect(card).toContainText(timeText);
    await expect(card.locator('.status-badge')).toHaveText(/Pending|Scheduled/i);
  });

  test('Customer can reschedule an upcoming appointment', async ({ page }) => {
    const original = await createAppointmentViaUI(page, {
      service: 'Measurement',
      minutesAhead: 300,
      notes: `QA reschedule ${Date.now()}`,
    });

    const card = page.locator('.appointment-card', { hasText: original.notes }).first();
    await card.getByRole('button', { name: /Reschedule/i }).click();
    await expect(page.locator('.modal-content h2')).toHaveText(/Reschedule Appointment/i);

    const newDateInput = futureDateInput(original.minutesAhead + 180);
    await page.fill('#scheduledAt', '');
    await page.fill('#scheduledAt', newDateInput);
    await page.locator('.modal-content button[type="submit"]').click();
    await expect(page.locator('.modal-content')).toBeHidden({ timeout: 15000 });

    const { dateText, timeText } = getDisplayFromInput(newDateInput);
    await expect(card).toContainText(dateText, { timeout: 15000 });
    await expect(card).toContainText(timeText, { timeout: 15000 });
    await expect(card.locator('.status-badge')).toHaveText(/Scheduled|Pending/i);
  });

  test('Customer can cancel an appointment and status updates to Cancelled', async ({ page }) => {
    const appt = await createAppointmentViaUI(page, {
      service: 'Fitting',
      minutesAhead: 420,
      notes: `QA cancel ${Date.now()}`,
    });

    const card = page.locator('.appointment-card', { hasText: appt.notes }).first();
    const cancelButton = card.getByRole('button', { name: /Cancel/i });
    await expect(cancelButton).toBeVisible();
    page.once('dialog', (dialog) => dialog.accept());
    await cancelButton.click();

    await expect(card.locator('.status-badge')).toHaveText(/Cancelled/i, { timeout: 15000 });
    await expect(cancelButton).toBeHidden();
  });
});



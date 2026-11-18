
/**
 * Boutique Pet Love
 * Motor de cálculo de retiros PAKET.
 *
 * Calcula la fecha estimada de RETIRO,
 * no la fecha de entrega al cliente.
 *
 * Los días de la semana usan:
 * Lunes = 1 ... Domingo = 7.
 */

const TIME_ZONE = "America/Santiago";
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Obtiene la fecha y hora local de Chile.
 */
function datePartsChile(instant) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(instant);

  const get = (type) =>
    parts.find((part) => part.type === type)?.value;

  return {
    date: `${get("year")}-${get("month")}-${get("day")}`,
    time: `${get("hour")}:${get("minute")}`,
  };
}

/**
 * Convierte una fecha AAAA-MM-DD
 * en un objeto Date seguro.
 */
function utcDay(dateString) {
  if (!DATE_RE.test(dateString)) {
    throw new Error("Fecha inválida: use AAAA-MM-DD.");
  }

  const d = new Date(`${dateString}T12:00:00.000Z`);

  if (
    Number.isNaN(d.getTime()) ||
    d.toISOString().slice(0, 10) !== dateString
  ) {
    throw new Error("Fecha calendario inválida.");
  }

  return d;
}

/**
 * Suma días calendario sin depender
 * de cambios de horario de verano.
 */
function addCalendarDays(dateString, days) {
  const d = utcDay(dateString);

  d.setUTCDate(d.getUTCDate() + days);

  return d.toISOString().slice(0, 10);
}

/**
 * Día de la semana:
 * Lunes = 1 ... Domingo = 7.
 */
function weekdayISO(dateString) {
  return ((utcDay(dateString).getUTCDay() + 6) % 7) + 1;
}

/**
 * Calcula la próxima fecha de retiro PAKET.
 *
 * @param {object} params
 * @param {Date|string} params.purchasedAt
 * Fecha y hora de compra.
 *
 * @param {object} params.settings
 * Configuración de paket_shipping_settings.
 *
 * @param {Array} params.exceptions
 * Fechas de paket_shipping_exceptions.
 *
 * @returns {object}
 */
export function calculatePaketPickup({
  purchasedAt = new Date(),
  purchaseLocal = null,
  settings,
  exceptions = [],
}) {
  if (!settings) {
    throw new Error("Falta la configuración de PAKET.");
  }

  // Servicio deshabilitado.
  if (settings.enabled === false) {
    return {
      pickupDate: null,
      purchaseDate: null,
      afterCutoff: false,
      businessDaysAdded: 0,
      enabled: false,
    };
  }

  // Validar fecha de compra.
  const instant =
    purchasedAt instanceof Date
      ? purchasedAt
      : new Date(purchasedAt);

  if (Number.isNaN(instant.getTime())) {
    throw new Error("Fecha y hora de compra inválidas.");
  }

  // Días habilitados para retiro.
  const weekdays = settings.pickup_weekdays;

  if (
    !Array.isArray(weekdays) ||
    !weekdays.length ||
    weekdays.some(
      (d) =>
        !Number.isInteger(d) ||
        d < 1 ||
        d > 7
    )
  ) {
    throw new Error(
      "Configura al menos un día válido de retiro PAKET."
    );
  }

  // Horario de corte.
  const cutoff = settings.cutoff ?? "22:00";

  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(cutoff)) {
    throw new Error("Horario de corte inválido.");
  }

  // Días adicionales de preparación.
  const prep = Number(
    settings.preparation_days ?? 0
  );

  if (
    !Number.isInteger(prep) ||
    prep < 0 ||
    prep > 30
  ) {
    throw new Error(
      "Días de preparación inválidos."
    );
  }

  // Fechas sin retiro.
  const blocked = new Set(
    exceptions.map((item) =>
      typeof item === "string"
        ? item
        : item.date
    )
  );

  // Comprueba si una fecha permite retiros.
  const isBusinessDay = (date) =>
    weekdays.includes(weekdayISO(date)) &&
    !blocked.has(date);

  // Fecha y hora de compra en Chile.
  let purchase;

if (purchaseLocal) {
  const { date, time } = purchaseLocal;

  if (
    typeof date !== "string" ||
    typeof time !== "string" ||
    !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)
  ) {
    throw new Error("Fecha u hora de simulación inválida.");
  }

  utcDay(date);

  purchase = { date, time };
} else {
  purchase = datePartsChile(instant);
}

  const purchaseIsBusinessDay =
    isBusinessDay(purchase.date);

  // El corte solo aplica cuando la compra
  // se realiza en un día hábil.
  const afterCutoff =
    purchaseIsBusinessDay &&
    purchase.time >= cutoff;

  /**
   * Reglas:
   *
   * Compra en día hábil antes del corte:
   * retiro el próximo día hábil.
   *
   * Compra después del corte:
   * se añade un día hábil adicional.
   *
   * Compra en fin de semana o feriado:
   * retiro el próximo día hábil disponible.
   *
   * Los días de preparación se suman
   * al plazo correspondiente.
   */
  const requiredDays =
    1 +
    (afterCutoff ? 1 : 0) +
    prep;

  let counted = 0;
  let cursor = purchase.date;

  // Límite de seguridad para evitar
  // búsquedas infinitas.
  for (let guard = 0; guard < 3660; guard++) {
    cursor = addCalendarDays(cursor, 1);

    // Saltar fines de semana y fechas bloqueadas.
    if (!isBusinessDay(cursor)) {
      continue;
    }

    counted++;

    if (counted >= requiredDays) {
      return {
        pickupDate: cursor,
        purchaseDate: purchase.date,
        afterCutoff,
        businessDaysAdded: counted,
        enabled: true,
      };
    }
  }

  throw new Error(
    "No se encontró una fecha de retiro dentro de diez años."
  );
}

/**
 * Convierte AAAA-MM-DD a fecha legible.
 *
 * Ejemplo:
 * miércoles, 18 de noviembre de 2026.
 */
export function formatPaketDate(dateString) {
  if (!dateString) {
    return "Sin retiro disponible";
  }

  const d = utcDay(dateString);

  return new Intl.DateTimeFormat("es-CL", {
    timeZone: "UTC",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}

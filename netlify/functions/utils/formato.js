const money = (value) =>
  Number(value || 0).toLocaleString(
    "es-CL"
  );

const escapeHtml = (value) =>
  String(value ?? "")
    .replace(
      /&/g,
      "&amp;"
    )
    .replace(
      /</g,
      "&lt;"
    )
    .replace(
      />/g,
      "&gt;"
    )
    .replace(
      /"/g,
      "&quot;"
    )
    .replace(
      /'/g,
      "&#039;"
    );

module.exports = {
  money,
  escapeHtml,
};

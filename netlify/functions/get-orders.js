const fs = require("fs");
const path = require("path");

exports.handler = async () => {
  const filePath = path.join("/tmp", "orders.json");

  if (!fs.existsSync(filePath)) {
    return {
      statusCode: 200,
      body: JSON.stringify([]),
    };
  }

  const data = JSON.parse(fs.readFileSync(filePath));

  return {
    statusCode: 200,
    body: JSON.stringify(data),
  };
};
const fs = require("fs");
const path = require("path");

exports.handler = async (event) => {
  try {
    const data = JSON.parse(event.body);

    const filePath = path.join("/tmp", "orders.json");

    let orders = [];

    if (fs.existsSync(filePath)) {
      orders = JSON.parse(fs.readFileSync(filePath));
    }

    orders.push({
      ...data,
      id: Date.now(),
    });

    fs.writeFileSync(filePath, JSON.stringify(orders));

    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true }),
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: error.toString(),
    };
  }
};
import {
  createProccesPostSaveTokenCron,
  createProccesTransaction,
  createTransaction,
  getCommerceToken,
  getTransaction,
  saveCardToken,
  savePaymentSource,
} from "../controllers/wompi";

// testing postman Authorization bearer token

module.exports = (app) => {
  // create a new token commerce
  app.get("/api/commerce_token", getCommerceToken);
  // create a new token card
  app.post("/api/card_token", saveCardToken);
  // create a new payment_source
  app.post("/api/payment_source", savePaymentSource);
  // create a new transaction
  app.post("/api/transaction", createTransaction);
  // get transaction
  app.get("/api/transaction/:id", getTransaction);
  // new client procces subcription
  app.post("/api/new/client/transaction", createProccesTransaction);
  // new client procces subcription
  app.post("/api/client/transaction", createProccesPostSaveTokenCron);
};

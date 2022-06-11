import axios from "axios";
require("dotenv").config();

const getHeaderPub = () => {
  return { Authorization: `Bearer ${process.env.pub_key}` };
};

const getHeaderPriv = () => {
  return { Authorization: `Bearer ${process.env.prv_key}` };
};

const getCommerceToken = async (req, res) => {
  try {
    const response = await axios.get(
      `${process.env.url_wompi}/merchants/${process.env.pub_key}`
    );
    console.log(response);
    res.status(200).json({
      error: null,
      data: response.data.data,
    });
  } catch (error) {
    res.status(400).json({
      error: error,
      url: `${process.env.url_wompi}/merchants/${process.env.pub_key}`,
    });
  }
};

const saveCardToken = async (req, res) => {
  try {
    const response = await axios.post(
      `${process.env.url_wompi}/tokens/cards`,
      req.body,
      {
        headers: getHeaderPub(),
      }
    );
    console.log(response);
    res.status(200).json({
      error: null,
      data: response.data.data,
    });
  } catch (error) {
    res.status(400).json({
      error: error,
      url: `${process.env.url_wompi}/tokens/cards`,
    });
  }
};

const savePaymentSource = async (req, res) => {
  try {
    const response = await axios.post(
      `${process.env.url_wompi}/payment_sources`,
      req.body,
      {
        headers: getHeaderPriv(),
      }
    );
    console.log(response);
    res.status(200).json({
      error: null,
      data: response.data.data,
    });
  } catch (error) {
    res.status(400).json({
      error: error.response.data,
      url: `${process.env.url_wompi}/payment_sources`,
      header: { headers: getHeaderPriv() },
    });
  }
};

const createTransaction = async (req, res) => {
  try {
    const response = await axios.post(
      `${process.env.url_wompi}/transactions`,
      req.body,
      {
        headers: getHeaderPriv(),
      }
    );
    console.log(response);
    res.status(200).json({
      error: null,
      data: response.data.data,
    });
  } catch (error) {
    res.status(400).json({
      error: error.response.data,
      url: `${process.env.url_wompi}/transactions`,
      header: { headers: getHeaderPriv() },
    });
  }
};

const getTransaction = async (req, res) => {
  try {
    const response = await axios.get(
      `${process.env.url_wompi}/transactions/${req.params.id}`,
      {
        headers: getHeaderPub(),
      }
    );
    console.log(response);
    res.status(200).json({
      error: null,
      data: response.data.data,
    });
  } catch (error) {
    res.status(400).json({
      error: error.response.data,
      url: `${process.env.url_wompi}/transactions/${req.params.id}`,
      header: { headers: getHeaderPriv() },
    });
  }
};

const createProccesTransaction = async (req, res) => {
  try {
    const token_acept_commerce = await axios.get(
      `${process.env.url_wompi}/merchants/${process.env.pub_key}`
    );
    console.log("Obtuvo el token del comercio");
    try {
      const dataCard = await axios.post(
        `${process.env.url_wompi}/tokens/cards`,
        req.body,
        {
          headers: getHeaderPub(),
        }
      );
      console.log("Obtuvo el token de la tarketa");
      try {
        const dataPayment = await axios.post(
          `${process.env.url_wompi}/payment_sources`,
          {
            type: "CARD",
            token: dataCard.data.data.id,
            acceptance_token:
              token_acept_commerce.data.data.presigned_acceptance
                .acceptance_token,
            customer_email: "johanbguerrero@hotmail.com",
          },
          {
            headers: getHeaderPriv(),
          }
        );
        console.log("Obtuvo la fuente de pago, id:" + dataPayment.data.data.id);
        try {
          const transaction_info = await axios.post(
            `${process.env.url_wompi}/transactions`,
            {
              amount_in_cents: 5090000,
              currency: "COP",
              customer_email: "johanbguerrero@hotmail.com",
              payment_method: {
                installments: 1,
              },
              reference:
                "sJK4489dDjkd390ds01" + Math.floor(Math.random() * 100000),
              payment_source_id: dataPayment.data.data.id,
            },
            {
              headers: getHeaderPriv(),
            }
          );
          console.log("Creo la transaccion");
          try {
            let interval = setInterval(async () => {
              const response = await axios.get(
                `${process.env.url_wompi}/transactions/${transaction_info.data.data.id}`,
                {
                  headers: getHeaderPub(),
                }
              );
              console.log(
                "Long pooling esperando un resultado diferente de pendiente"
              );
              if (response.data.data.status !== "PENDING") {
                clearInterval(interval);
                res.status(200).json({
                  error: null,
                  data: response.data.data,
                });
              }
            }, 1000);
          } catch (error) {
            res.status(400).json({
              error: error.response.data,
              url: `${process.env.url_wompi}/transactions/${req.params.id}`,
              header: { headers: getHeaderPriv() },
            });
          }
        } catch (error) {
          res.status(400).json({
            error: error.response.data,
            url: `${process.env.url_wompi}/transactions`,
            header: { headers: getHeaderPriv() },
          });
        }
      } catch (error) {
        res.status(400).json({
          error: error.response.data,
          url: `${process.env.url_wompi}/payment_sources`,
          header: { headers: getHeaderPriv() },
        });
      }
    } catch (error) {
      res.status(400).json({
        error: error.response,
        url: `${process.env.url_wompi}/tokens/cards`,
      });
    }
  } catch (error) {
    res.status(400).json({
      error: error,
      url: `${process.env.url_wompi}/merchants/${process.env.pub_key}`,
    });
  }
};

const createProccesPostSaveTokenCron = async (req, res) => {
  try {
    const transaction_info = await axios.post(
      `${process.env.url_wompi}/transactions`,
      req.body,
      {
        headers: getHeaderPriv(),
      }
    );
    console.log("Se creo una renovacion de membresia mensual");
    try {
      let interval = setInterval(async () => {
        const response = await axios.get(
          `${process.env.url_wompi}/transactions/${transaction_info.data.data.id}`,
          {
            headers: getHeaderPub(),
          }
        );
        console.log(
          "Long pooling esperando un resultado diferente de pendiente"
        );
        if (response.data.data.status !== "PENDING") {
          clearInterval(interval);
          res.status(200).json({
            error: null,
            data: response.data.data,
          });
        }
      }, 1000);
    } catch (error) {
      res.status(400).json({
        error: error.response.data,
        url: `${process.env.url_wompi}/transactions/${req.params.id}`,
        header: { headers: getHeaderPriv() },
      });
    }
  } catch (error) {
    res.status(400).json({
      error: error.response.data,
      url: `${process.env.url_wompi}/transactions`,
      header: { headers: getHeaderPriv() },
    });
  }
};

export {
  getCommerceToken,
  saveCardToken,
  savePaymentSource,
  createTransaction,
  getTransaction,
  createProccesTransaction,
  createProccesPostSaveTokenCron,
};

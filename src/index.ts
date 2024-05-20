import express from "express";
import { getQueueMessage, setQueueMessage } from "./queue";

const app = express();
const PORT = 3000;
const API_PATH = "/api";

app.use(express.json());

app.get<{ queueName: string }, any, any, { timeout?: number }>(
  `${API_PATH}/:queueName`,
  async (req, res) => {
    const { queueName } = req.params;
    const { timeout = 10000 } = req.query;

    if (!Number(timeout)) {
      res.sendStatus(400);
    } else {
      const message = await getQueueMessage(queueName, Number(timeout));

      if (message) {
        res.send(message);
      } else {
        res.sendStatus(408);
      }
    }
  }
);

app.post<{ queueName: string }, object>(
  `${API_PATH}/:queueName`,
  (req, res) => {
    const { queueName } = req.params;
    setQueueMessage(queueName, req.body);

    res.send();
  }
);

app.listen(PORT, () => {
  console.log(`Queue app listening on port ${PORT}`);
});

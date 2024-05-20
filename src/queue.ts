import { EventEmitter } from "events";

const queues: Record<string, object[]> = {};
const emitter = new EventEmitter();

export const getQueueMessage = async (
  queueName: string,
  timeout = 10000
): Promise<object | undefined> => {
  return new Promise<object | undefined>((resolve) => {
    const queue = queues[queueName];

    if (queue?.length) {
      const message = queue.shift();
      resolve(message);
    } else {
      const abort = setTimeout(() => {
        emitter.removeListener(`message.${queueName}`, listener);
        resolve(undefined);
      }, timeout);
      const listener = (message: object) => {
        clearTimeout(abort);

        if (queues[queueName] && queues[queueName].indexOf(message) !== -1) {
          queues[queueName].splice(queues[queueName].indexOf(message), 1);
        }

        resolve(message);
      };
      emitter.once(`message.${queueName}`, listener);
    }
  });
};

export const setQueueMessage = (queueName: string, message: object) => {
  const queue = queues[queueName] || [];
  queue.push(message);

  if (!queues[queueName]) {
    queues[queueName] = queue;
  }

  emitter.emit(`message.${queueName}`, message);
};

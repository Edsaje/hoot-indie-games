const workerContext: Worker = self as any;

let timerId: number | null = null;

workerContext.addEventListener('message', (event: MessageEvent) => {
  const { action, intervalMs } = event.data;

  if (action === 'start') {
    if (timerId) {
      clearInterval(timerId);
    }
    timerId = self.setInterval(() => {
      workerContext.postMessage({ type: 'tick' });
    }, intervalMs || 200);
  } else if (action === 'stop') {
    if (timerId) {
      clearInterval(timerId);
      timerId = null;
    }
  }
});

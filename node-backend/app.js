const http = require("http");

const PORT = 3000;
let requestsTotal = 0;
let requestDurationSumMs = 0;
let requestDurationCount = 0;

const server = http.createServer((req, res) => {
  const start = Date.now();
  const ip = req.headers["x-forwarded-for"]
    ? req.headers["x-forwarded-for"].split(",")[0].trim()
    : req.socket.remoteAddress;

  requestsTotal += 1;

  if (req.url === "/metrics") {
    const avgLatency =
      requestDurationCount > 0
        ? requestDurationSumMs / requestDurationCount
        : 0;

    res.writeHead(200, {
      "Content-Type": "text/plain; version=0.0.4; charset=utf-8",
    });

    res.end(
      "# HELP node_http_requests_total Total number of HTTP requests\n" +
        "# TYPE node_http_requests_total counter\n" +
        `node_http_requests_total ${requestsTotal}\n` +
        "# HELP node_http_request_duration_ms Average request duration in milliseconds\n" +
        "# TYPE node_http_request_duration_ms gauge\n" +
        `node_http_request_duration_ms ${avgLatency.toFixed(2)}\n`
    );
    return;
  }

  console.log(" ==>>> user connected " + ip);
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Hello");

  const duration = Date.now() - start;
  requestDurationSumMs += duration;
  requestDurationCount += 1;
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
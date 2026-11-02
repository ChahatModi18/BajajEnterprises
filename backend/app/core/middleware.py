import json
from typing import Any, Awaitable, Callable, Dict


class _RequestBodyTooLarge(Exception):
    pass


class RequestSizeLimitMiddleware:
    """Reject oversized API requests before parsing or buffering their bodies."""

    def __init__(self, app: Callable[..., Awaitable[None]], max_bytes: int):
        self.app = app
        self.max_bytes = max_bytes

    async def __call__(self, scope: Dict[str, Any], receive: Callable[..., Awaitable[Any]], send: Callable[..., Awaitable[None]]):
        if scope["type"] != "http" or not scope.get("path", "").startswith("/api/"):
            await self.app(scope, receive, send)
            return

        content_lengths = [value for name, value in scope.get("headers", []) if name.lower() == b"content-length"]
        transfer_encoding = any(name.lower() == b"transfer-encoding" for name, _ in scope.get("headers", []))
        if len(content_lengths) > 1 or (content_lengths and transfer_encoding):
            await self._respond_bad_length(send)
            return
        raw_length = content_lengths[0] if content_lengths else None
        if raw_length:
            try:
                length_text = raw_length.decode("ascii")
                if not length_text.isdigit():
                    raise ValueError
                if int(length_text) > self.max_bytes:
                    await self._respond_too_large(send)
                    return
            except ValueError:
                await self._respond_bad_length(send)
                return

        received = 0
        response_started = False
        terminal = False

        async def tracked_send(message):
            nonlocal response_started
            if terminal:
                return
            if message["type"] == "http.response.start":
                response_started = True
            await send(message)

        async def limited_receive():
            nonlocal received, terminal
            message = await receive()
            if message["type"] == "http.request":
                received += len(message.get("body", b""))
                if received > self.max_bytes:
                    terminal = True
                    if not response_started:
                        await self._respond_too_large(send)
                    raise _RequestBodyTooLarge
            return message

        try:
            await self.app(scope, limited_receive, tracked_send)
        except _RequestBodyTooLarge:
            if not terminal and not response_started:
                await self._respond_too_large(send)

    async def _respond_too_large(self, send):
        body = json.dumps({"detail": "Request body exceeds the configured size limit"}).encode()
        await send({"type": "http.response.start", "status": 413, "headers": [(b"content-type", b"application/json"), (b"content-length", str(len(body)).encode())]})
        await send({"type": "http.response.body", "body": body})

    async def _respond_bad_length(self, send):
        body = b'{"detail":"Invalid Content-Length header"}'
        await send({"type": "http.response.start", "status": 400, "headers": [(b"content-type", b"application/json"), (b"content-length", str(len(body)).encode())]})
        await send({"type": "http.response.body", "body": body})

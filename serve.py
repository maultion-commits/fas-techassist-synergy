"""Lokaler Dev-Server ohne Caching (nur für die Vorschau, nicht fürs Hosting nötig)."""
import os
import sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer


class Handler(SimpleHTTPRequestHandler):
    extensions_map = {
        **SimpleHTTPRequestHandler.extensions_map,
        ".woff2": "font/woff2",
        ".svg": "image/svg+xml",
        ".js": "text/javascript",
    }

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def log_message(self, *args):
        pass


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8813
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    ThreadingHTTPServer(("127.0.0.1", port), Handler).serve_forever()

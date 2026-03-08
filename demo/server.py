import http.server
import socketserver
import urllib.request
import urllib.error
import json
import os

PORT = 8090

def load_env():
    env = {}
    try:
        with open('.env', 'r') as f:
            for line in f:
                line = line.strip()
                if '=' in line and not line.startswith('#'):
                    k, v = line.split('=', 1)
                    env[k.strip()] = v.strip()
    except FileNotFoundError:
        pass
    return env

SECRET_KEY = load_env().get('PAYSTACK_SECRET_KEY')

class Handler(http.server.BaseHTTPRequestHandler):
    def do_GET(self):
        match self.path:
            case '/':
                self.send_file('index.html', 'text/html')
            case '/resume-stack.js':
                self.send_file('resume-stack.js', 'application/javascript')
            case '/style.css':
                self.send_file('style.css', content_type="text/css")
            case _:
                self.send_error(404)

    def do_POST(self):
        match self.path:
            case '/init-transaction':
                if not SECRET_KEY:
                    self.send_json({'error': 'PAYSTACK_SECRET_KEY not set in .env'}, 500)
                    return
                try:
                    content_length = int(self.headers['Content-Length'])
                    post_data = self.rfile.read(content_length)
                    data = json.loads(post_data.decode('utf-8'))
                    # Make request to Paystack
                    url = 'https://api.paystack.co/transaction/initialize'
                    headers = {
                        'Authorization': f'Bearer {SECRET_KEY}',
                        'Content-Type': 'application/json',
                        'User-Agent': 'curl/7.68.0'
                    }
                    req = urllib.request.Request(url, data=json.dumps(data).encode('utf-8'), headers=headers, method='POST')
                    with urllib.request.urlopen(req) as response:
                        resp_data = json.loads(response.read().decode('utf-8'))
                    self.send_json(resp_data)
                except urllib.error.HTTPError as e:
                    error_body = e.read().decode('utf-8')
                    self.send_json({'error': f'HTTP {e.code}: {error_body}'}, 500)
                except Exception as e:
                    self.send_json({'error': str(e)}, 500)
            case _:
                self.send_error(404)

    def send_file(self, filename, content_type):
        try:
            with open(filename, 'rb') as f:
                self.send_response(200)
                self.send_header('Content-Type', content_type)
                self.end_headers()
                self.wfile.write(f.read())
        except FileNotFoundError:
            self.send_error(404)

    def send_json(self, data, code=200):
        self.send_response(code)
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode('utf-8'))

if __name__ == '__main__':
    with socketserver.TCPServer(('', PORT), Handler) as httpd:
        print(f'Serving at http://127.0.0.1:{PORT}')
        httpd.serve_forever()

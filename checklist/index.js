const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');
const chokidar = require('chokidar');

// 从环境变量获取配置
const PORT = process.env.PORT || 8888;
const isDev = process.env.NODE_ENV === 'development';

// 创建 Express 应用
const app = express();

// 创建 WebSocket 服务器（仅在开发模式）
let wss;
if (isDev) {
    // 创建 WebSocket 服务器
    wss = new WebSocket.Server({ port: PORT + 1 });
    
    wss.on('connection', (ws) => {
        console.log('Client connected to WebSocket');
        
        ws.on('close', () => {
            console.log('Client disconnected from WebSocket');
        });
    });
}

// 文件监视器（仅在开发模式）
if (isDev) {
    // 监视静态文件变化
    const staticWatcher = chokidar.watch('static', {
        ignored: /(^|[\/\\])\../,
        persistent: true
    });

    staticWatcher.on('change', (path) => {
        console.log(`Static file changed: ${path}`);
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send('reload');
            }
        });
    });
}

// WebSocket 客户端代码
const wsClientScript = `
<script>
    (function() {
        const ws = new WebSocket('ws://localhost:${PORT + 1}');
        
        ws.onmessage = (event) => {
            if (event.data === 'reload') {
                console.log('Reloading due to file change...');
                window.location.reload();
            }
        };
        
        ws.onclose = () => {
            console.log('Development server disconnected. Attempting to reconnect...');
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        };
    })();
</script>
`;

// 启用 CORS
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// 静态文件中间件
app.use('/static', express.static(path.join(__dirname, 'static')));


// HTML 注入中间件（仅在开发模式）
const injectHtml = (html) => {
    if (!isDev) return html;
    return html.replace('</body>', `${wsClientScript}</body>`);
};

// 首页路由
app.get('/', (req, res) => {
    const indexPath = path.join(__dirname, 'static', 'index.html');

    if (!fs.existsSync(indexPath)) {
        return res.status(404).send('File not found');
    }

    res.setHeader('Content-Type', 'text/html; charset=utf-8');

    if (isDev) {
        // 开发模式：读取文件并注入 WebSocket 客户端代码
        fs.readFile(indexPath, 'utf8', (err, data) => {
            if (err) {
                console.error('Error reading file:', err);
                return res.status(500).send('Error reading file');
            }
            res.send(injectHtml(data));
        });
    } else {
        // 生产模式：直接流式输出
        fs.createReadStream(indexPath).pipe(res);
    }
});

// 错误处理中间件
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).send('Internal Server Error');
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`Server running in ${isDev ? 'development' : 'production'} mode`);
    console.log(`Server URL: http://localhost:${PORT}`);
    if (isDev) {
        console.log(`WebSocket server running on port ${PORT + 1}`);
    }
});
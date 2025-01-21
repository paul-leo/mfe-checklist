const features = {
    hashRouter: false,
    historyRouter: false,
    SSR: false,
    "SSR Streaming": false,
    Muilt: false,
    'CSS Sandbox (Parent Child)': false,
    'CSS Sandbox (Child Parent)': false,
    'CSS Sandbox (Child Child)': false,
    DOM: false,
    'popup': false,
    'js sandbox': false,
}
const parent = window.parent;
function renderTable() {
    const table = document.createElement('table');
    const thead = document.createElement('thead');
    const tbody = document.createElement('tbody');
    table.appendChild(thead);
    table.appendChild(tbody);
    const th = document.createElement('th');
    th.textContent = 'features';
    thead.appendChild(th);
    const th2 = document.createElement('th');
    th2.textContent = 'support';
    thead.appendChild(th2);
    for (const key in features) {
      const tr = document.createElement('tr');
      tbody.appendChild(tr);
        const featureTd = document.createElement('td');
        featureTd.textContent = key;
        tr.appendChild(featureTd);
        const valueTd = document.createElement('td');
        valueTd.textContent = features[key];
        tr.appendChild(valueTd);
    }
    
    document.getElementById("app").appendChild(table);
}

async function main() {
    features.hashRouter = await checkHashRouter();
    features.historyRouter = await checkHistoryFeature();
    renderTable();
}
window.addEventListener('popstate', function (event) {
    console.log('路由变化:', window.location.pathname);
    console.log('状态:', event.state);
});

// 需要验证当前内容渲染正确
function checkHistoryFeature() {
    window.history.pushState({ page: 1 }, 'title 1', '/historychanged');
    const isCorrect = window.location.pathname === '/historychanged' && parent.location.pathname !== '/historychanged';
    console.log('是否支持history:', isCorrect);
    window.history.back();
    return isCorrect;
}

function checkHashRouter() {
    return new Promise((resolve) => {
        let isRight = false;
        let randomHash ='#/hashchanged'+ Math.random();
        window.addEventListener('hashchange', () => {
            console.log('hashchanged', window.location.hash);
            isRight = window.location.hash === randomHash && parent.location.hash !== randomHash;
            resolve(isRight);
        });
        window.location.hash = randomHash;
        console.log('isRight:', isRight);
    });
}

main();

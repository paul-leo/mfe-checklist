function main() {
    // checkHistoryFeature();
    // checkHashRouter();
}
window.addEventListener('popstate', function (event) {
    console.log('路由变化:', window.location.pathname);
    console.log('状态:', event.state);
});

// 需要验证当前内容渲染正确
function checkHistoryFeature() {
    window.history.pushState({ page: 1 }, 'title 1', '/historychanged');
    const isCorrect = window.location.pathname === '/historychanged';
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
            isRight = window.location.hash === randomHash;
            resolve(isRight);
        });
        window.location.hash = randomHash;
        console.log('isRight:', isRight);
    });
}

main();

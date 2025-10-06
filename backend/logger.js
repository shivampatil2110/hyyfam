const originalLog = console.log;
const originalError = console.error;
const originalWarn = console.warn;
const originalInfo = console.info;

function getTimeStamp() {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const hh = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');
    const ss = String(now.getSeconds()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
}

console.log = (...args) => {
    originalLog(`[${getTimeStamp()}]`, ...args);
};

console.error = (...args) => {
    originalError(`[${getTimeStamp()}]`, ...args);
};

console.warn = (...args) => {
    originalWarn(`[${getTimeStamp()}]`, ...args);
};

console.info = (...args) => {
    originalInfo(`[${getTimeStamp()}]`, ...args);
};

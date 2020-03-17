function verifImage(str) {
    return ['jpg', 'png', 'gif', 'jpeg'].includes(getType(str));
}

function getType(str) {
    return str.slice(verifPoint(str) + 1, str.length);
}

function verifPoint(str) {
    const tab = [];
    for (let i = 0; i < str.length; i++) {
        if (str[i] === ".") {
            tab.push(i);
        }
    }
    return tab[tab.length - 1];
}
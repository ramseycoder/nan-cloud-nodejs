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

function getDay(d) {
    switch (d) {
        case 1:
            return 'Lun';
            break;
        case 2:
            return 'Mar';
            break;
        case 3:
            return 'Mer';
            break;
        case 4:
            return 'Jeu';
            break;
        case 5:
            return 'Vend';
            break;
        case 6:
            return 'sam';
            break;
        default:
            return "Dim";
            break;
    }
}


function getMonth(d) {
    switch (d) {
        case 1:
            return 'Fev';
            break;
        case 2:
            return 'Mars';
            break;
        case 3:
            return 'Avril';
            break;
        case 4:
            return 'Mai';
            break;
        case 5:
            return 'Juin';
            break;
        case 6:
            return 'Jul';
            break;
        case 7:
            return "Août";
            break;
        case 8:
            return "Sept";
            break;
        case 9:
            return "Oct";
            break;
        case 10:
            return "Nov";
            break;
        case 11:
            return "Dec";
            break;
        default:
            return "Jan";
            break;
    }
}
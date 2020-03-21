const socket = io();
let s = $('.privileges').text().includes(',') ? $('.privileges').text().split(',') : [$('.privileges').text()];
if (s.includes('write')) {
    var previewNode = document.querySelector("#template");
    var previewTemplate = previewNode.innerHTML;
    previewNode.parentNode.removeChild(previewNode);
    Dropzone.autoDiscover = false;
    const myDropzone = new Dropzone(document.querySelector('#ombre'), {
        url: "/upload-file",
        paramName: "file",
        previewTemplate: previewTemplate,
        previewsContainer: "#previews",
        clickable: false,
        parallelUploads: 2,
        thumbnailHeight: 120,
        thumbnailWidth: 120,
    })

    $('.folders_list').on('dragenter', function () {
        $('#ombre').fadeIn(500);
    });

    myDropzone.on('dragleave', function () {
        $('#ombre').fadeOut(300)
    });

    myDropzone.on('queuecomplete', function () {
        myDropzone.removeAllFiles();
        $('#ombre').fadeOut(300);
        socket.emit('reload');
    })

    function submitForm(el) {
        console.log('yes');
        const dat = el.children[0].value;
        $('.new_folder span').toggleClass('text');
        $('.new_folder span').toggleClass('form');
        $('.new_folder span.text').html('nouveau dossier');
        $('.dropDown').fadeOut(300);
        socket.emit('create_folder', dat);
    }

    $('.dropDown').on('mouseenter', function () {
        mouseOverDropDown = true;
    });

    $('.dropDown').on('mouseleave', function () {
        mouseOverDropDown = false;
    })

    $('.add').on('mouseenter', function () {
        mouseOverDropDown = true;
    });

    $('.add').on('mouseleave', function () {
        mouseOverDropDown = false;
    })

    $('.add').on('click', function (e) {
        $('.dropDown').fadeToggle(300);
    })

    let mouseOverDropDown = false;
    $('.new_folder').on('click', function (e) {
        e.preventDefault();
        console.log($('.new_folder span').hasClass('text'));
        if ($('.new_folder span').hasClass('text')) {
            console.log('oui merci ooh');
            $('.new_folder span').toggleClass('text');
            $('.new_folder span').toggleClass('form');
            $('.new_folder span.form').html(
                '<form method="post" action="/" class="form-inline" onSubmit="event.preventDefault();submitForm(this)"><input type="text" id="name_folder" class="form-control mb-2" value="nouveau dossier" autofocus=true onfocus="this.select()"/></form>'
            );
        }
    })

    $(document).on('click', () => {
        if (!mouseOverDropDown) {
            if ($('.new_folder span').hasClass('form')) {
                $('.new_folder span').toggleClass('text');
                $('.new_folder span').toggleClass('form');
                $('.new_folder span.text').html('nouveau dossier');
            }
            $('.dropDown').fadeOut(300);
        }
    });
}



socket.on('success', (data) => {
    $('.folders_list').html(data);
})

socket.on('addgetFileSize', (data) => {
    let t = $('.deleteDownload .taille span').text();
    let taille = t === '' ? 0 : parseFloat(t).toFixed(2);
    console.log('rmkjqdfj', taille);
    if (taille === 0 || taille === "0.00") {
        $('.deleteDownload').animate({
            "right": "0%"
        }, 500);
    }
    $('.deleteDownload .taille').html('');

    taille = parseFloat(taille) + parseFloat(((data / 1000) / 1000).toFixed(2));
    $('.deleteDownload .taille').html(`<span>${taille.toFixed(2)}</span> Mo`);
});

socket.on('removegetFileSize', (data) => {
    let t = $('.deleteDownload .taille span').text();
    let taille = parseFloat(t).toFixed(2);
    $('.deleteDownload .taille').html('');
    taille = parseFloat(taille) - parseFloat(((data / 1000) / 1000).toFixed(2));
    $('.deleteDownload .taille').html(`<span>${taille.toFixed(2)}</span> Mo`);
    if (taille === 0.00) {
        $('.deleteDownload').animate({
            "right": "-20%"
        }, 500);
    }
});




let showrightside = true;

$('.globalCheck').on('change', function () {
    if (showrightside) {
        showrightside = false;
        $('.childCheck').click();
    } else {
        $('.childCheck').click();
        showrightside = true;
    }

});

$('.download').on('click', function () {
    $('.downloadDiv').html(' ');
    showrightside = false;
    $('.childCheck').each(function () {
        if ($(this).is(':checked')) {
            if (this.nextElementSibling.children[0] === undefined) {
                $('.downloadDiv').html($('.downloadDiv').html() + `<a href="/downloadShare?type=file&file=${this.nextElementSibling.textContent}" >download</a>`);
            } else {
                $('.downloadDiv').html($('.downloadDiv').html() + `<a href="/downloadShare?type=folder&dir=${this.nextElementSibling.children[0].textContent}">download</a>`);
            }
        }
        $(this).click();
        $(this).parents('tr').css('background-color', 'transparent');
    });

    $('.downloadDiv a').each(function (index) {
        setTimeout(() => {
            this.click();
        }, 100 * (index + 1))

    });
    $('.downloadDiv').html('');
    $('.deleteDownload .taille span').html('0.00');
    $('.deleteDownload').fadeOut(300);
});

$('table tbody tr').each(function (index) {
    this.children[2].textContent = getRightFormatDate(this.children[2].textContent);
})


function setFalse() {
    showrightside = false;
}

function setTrue() {
    showrightside = true;
}

function Change(el) {
    if ($(el).is(':checked')) {
        $(el).parents('tr').css('background-color', 'rgb(203, 203, 203)');
        $(el).css('display', 'block');
        if (el.nextElementSibling.children[0] === undefined) {
            socket.emit('addgetFileSize', el.nextElementSibling.textContent)
        } else {
            socket.emit('addgetFileSize', el.nextElementSibling.children[0].textContent)
        };

    } else {
        $(el).parents('tr').css('background-color', 'transparent');
        if (el.nextElementSibling.children[0] === undefined) {
            socket.emit('removegetFileSize', el.nextElementSibling.textContent)
        } else {
            socket.emit('removegetFileSize', el.nextElementSibling.children[0].textContent)
        };
    }
}


$('tr').on('mouseleave', function () {
    this.children[0].children[0].style.display = "none !important";
})

function getRightFormatDate(date) {
    let secondes = (new Date().getTime() / 1000) - (new Date(date).getTime() / 1000);
    let sate = new Date(date);
    if (secondes > 604800) {
        return getDay(sate.getDay()) + ' ' + sate.getDate() + ' ' + getMonth(sate.getMonth()) + ' ' + sate.getFullYear();
    } else if (secondes > 86400) {
        return `il y a ${parseInt(secondes/86400)} jours`;
    } else if (secondes > 3600) {
        return `il y a ${parseInt(secondes/3600)} heures`;
    } else if (secondes > 60) {
        return `il y a ${parseInt(secondes/60)} minutes`;
    } else {
        return `maintenant`;
    }

}
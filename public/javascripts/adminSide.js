const socket = io();
let path = $('.folder_path').text();
if (path.includes(',')) path = path.split(',').join('/')
else if (path === 'none') path = ""
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

let canSupp = true;
let mouseOverDropDown = false;
let showrightside = true;



$(function () {
    $('.globalCheck').on('change', function () {
        if (showrightside) {
            showrightside = false;
            $('.childCheck').click();
        } else {
            $('.childCheck').click();
            showrightside = true;
        }

    });



    $('tr').on('mouseleave', function () {
        this.children[0].children[0].style.display = "none !important";
    })


    socket.on('success', (data) => {
        $('.folders_list').html(data);
    });

    socket.on('successDelete', (data) => {
        $('.folders_list').html(data);
        $('.deleteDownload .taille .span').text('0.00');
        $('.deleteDownload').fadeOut(500);
    })

    socket.on('getFileInfo', (data) => {
        let donne = "";
        let el = '';
        data.sharedOptions.forEach(opt => {
            el += `
            <li><span class="link">http://localhost:5000/shared/${opt.crypt_link}</span><div class="right"><i onclick="updateShared('${data._id}','${opt.crypt_link}','${opt.password}','${opt.expirationDate}','${opt.privileges}','${opt.message}')"  class="fas fa-edit"></i><i onclick="DeleteShared('${data._id}','${opt.crypt_link}')")" class="fas fa-trash"></i></div></li>
        `;
        });
        $('#partager ul').html(el);
        $('#id_file').val(data._id);
        let nameFolder = data.type === "file" ? data.name + '.' + data.mimetype : data.name;
        if (getType(nameFolder) === data.name) {
            donne = `<div class="repre">
                <img src="/public/images/folder.png" width="100" height="100" />
              </div>
              <div class="info">
                <h4>${nameFolder}</h4>
                  <p><span>${((data.size/1000)/1000).toFixed(2)} Mo </span>&nbsp;&nbsp;&nbsp;&nbsp;<span>${getRightFormatDate(data.date_creation)}</span></p>
              </div>`
        } else if (verifImage(nameFolder)) {
            let s = '';
            donne = `<div class="repre" onclick="readImage('${nameFolder}')">`;
            if (path === "") {
                s = `<img src = "/STORAGE/${nameFolder}"
            width = "100"
            height = "100"/>`
            } else {
                s = `<img src = "/STORAGE/${path}/${nameFolder}"
            width = "100"
            height = "100"/>`
            };
            donne += s;
            donne += `  
                </div> <div class = "info">
                <h4>${nameFolder}</h4><p><span>${
                    ((data.size / 1000) / 1000).toFixed(2)
                }Mo</span>&nbsp;&nbsp;&nbsp;&nbsp;<span>${getRightFormatDate(data.date_creation)}</span> </p></div>`;
        } else if (getType(nameFolder) === "mp3") {
            donne = `<div class="repre">
                       <img src="/public/images/folder.png" width="100" height="100" />
              </div>
              <div class="info">
                 <h4>${nameFolder}</h4>
                  <p><span>${((data.size/1000)/1000).toFixed(2)} Mo </span>&nbsp;&nbsp;&nbsp;&nbsp;<span>$${getRightFormatDate(data.date_creation)}</span></p>
              </div>`
        } else if (getType(nameFolder) === "pdf") {
            donne = `<div class="repre" onclick="fileReader('${nameFolder}')">
          <img src="/public/images/pdf.png" width="100" height="100" />
              </div>
              <div class="info">
                <h4>${nameFolder}</h4>
                  <p><span>${((data.size/1000)/1000).toFixed(2)} Mo </span>&nbsp;&nbsp;&nbsp;&nbsp;<span>${getRightFormatDate(data.date_creation)}</span></p>
              </div>`
        } else if (getType(nameFolder) === "txt") {
            donne = `<div class="repre" onclick="fileReader('${nameFolder}')">
          <img src="/public/images/txt.png" width="100" height="100" />
              </div>
              <div class="info">
                <h4>${nameFolder}</h4>
                  <p><span>${((data.size/1000)/1000).toFixed(2)} Mo </span>&nbsp;&nbsp;&nbsp;&nbsp;<span>${getRightFormatDate(data.date_creation)}</span></p>
              </div>`
        } else if (getType(nameFolder) === "mp4") {
            donne = `<div class="repre" onclick="videoReader('${nameFolder}')">
          <img src="/public/images/video-player.png" width="100" height="100" />
              </div>
              <div class="info">
                <h4>${nameFolder}</h4>
                  <p><span>${((data.size/1000)/1000).toFixed(2)} Mo </span>&nbsp;&nbsp;&nbsp;&nbsp;<span>${getRightFormatDate(data.date_creation)}</span></p>
              </div>`
        } else {
            donne = `<div class="repre" onclick="videoReader('${nameFolder}')">
            <i class="fas fa-file"></i>
                </div>
                <div class="info">
                  <h4>${nameFolder}</h4>
                    <p><span>${((data.size/1000)/1000).toFixed(2)} Mo </span>&nbsp;&nbsp;&nbsp;&nbsp;<span>${getRightFormatDate(data.date_creation)}</span></p>
                </div>`
        }
        $('.right_content .contenu_article').html(donne);
        const boxContent = document.querySelector('.box_content');
        setTimeout(() => {
            boxContent.children[0].classList.remove('col-lg-12');
            boxContent.children[0].classList.remove('col-md-12');
            boxContent.children[0].classList.add('col-lg-9');
            boxContent.children[0].classList.add('col-md-9');
        }, 200);
        $('.right_content').fadeIn(200);
    });

    socket.on('deleteShared', (data) => {
        let el = '';
        data.sharedOptions.forEach(opt => {
            el += `
            <li><span class="link">http://localhost:5000/shared/${opt.crypt_link}</span><div class="right"><i onclick="updateShared('${data._id}','${opt.crypt_link}','${opt.password}','${opt.expirationDate}','${opt.privileges}','${opt.message}')"  class="fas fa-edit"></i><i onclick="DeleteShared('${data._id}','${opt.crypt_link}')")" class="fas fa-trash"></i></div></li>
        `;
        });
        $('#partager ul').html(el);
    })

    socket.on('shared', (data) => {
        $('#modalPoll-1').modal('hide');
        resetSharedFormValue();
        let el = '';
        data.sharedOptions.forEach(opt => {
            el += `
            <li><span class="link">http://localhost:5000/shared/${opt.crypt_link}</span><div class="right"><i onclick="updateShared('${data._id}','${opt.crypt_link}','${opt.password}','${opt.expirationDate}','${opt.privileges}','${opt.message}')"  class="fas fa-edit"></i><i onclick="DeleteShared('${data._id}','${opt.crypt_link}')")" class="fas fa-trash"></i></div></li>
        `;
        });
        $('#partager ul').html(el);
    })


    socket.on('addgetFileSize', (data) => {
        let t = $('.deleteDownload .taille span').text();
        let taille = t === '' ? 0 : parseFloat(t).toFixed(2);
        $('.deleteDownload .taille').html('');
        if (taille === 0 || taille === "0.00") {
            $('.deleteDownload').animate({
                "right": "0%",
            }, 500);
        }
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
})

function submitForm(el) {
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

$('.new_folder').on('click', function (e) {
    e.preventDefault();
    if ($('.new_folder span').hasClass('text')) {
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

$('#passwordProtection').on('change', function () {
    if ($(this).is(':checked')) {
        $('#passwordToShare').fadeIn(300);
        $('#passwordToShare').focus();
    } else {
        $('#passwordToShare').fadeOut(300);
    }
})

$('#ExpirationDate').on('change', function () {
    if ($(this).is(':checked')) {
        $('#dateToShare').fadeIn(300);
        $('#dateToShare').focus();
    } else {
        $('#dateToShare').fadeOut(300);
    }
});

$('.suppress').on('click', function () {
    let files = [];
    $('.childCheck').each(function () {
        if ($(this).is(':checked')) {
            if (this.nextElementSibling.children[0] === undefined) {
                files.push(this.nextElementSibling.textContent);
            } else {
                files.push(this.nextElementSibling.children[0].textContent);
            }
        }
    });
    socket.emit('deleteFiles', files);
});

$('.download').on('click', function () {
    $('.downloadDiv').html(' ');
    showrightside = false;
    $('.childCheck').each(function () {
        if ($(this).is(':checked')) {
            if (this.nextElementSibling.children[0] === undefined) {
                $('.downloadDiv').html($('.downloadDiv').html() + `<a href="/download?type=file&file=${this.nextElementSibling.textContent}" >download</a>`);
            } else {
                $('.downloadDiv').html($('.downloadDiv').html() + `<a href="/download?type=folder&dir=${this.nextElementSibling.children[0].textContent}">download</a>`);
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
$('.share').on('click', () => {
    resetSharedFormValue();
});


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


function showRightSide(fileid) {
    if (showrightside) {
        socket.emit('getFileInfo', fileid);
    }
}

function closeRightSide() {
    const boxContent = document.querySelector('.box_content');
    setTimeout(() => {
        boxContent.children[0].classList.remove('col-lg-9');
        boxContent.children[0].classList.remove('col-md-9');
        boxContent.children[0].classList.add('col-lg-12');
        boxContent.children[0].classList.add('col-md-12');
    }, 200);
    $('.right_content').fadeOut(200);
}

function getShareConfig() {
    let checkValue = '';
    $('input[name="group1"]').each(function () {
        if ($(this).is(':checked')) {
            checkValue = $(this).val()
        }
    })
    const data = {
        id_file: $('#id_file').val(),
        privilege: checkValue.includes('&') ?
            checkValue.split('&') : [checkValue],
        password: $('#passwordToShare').val(),
        date: $('#dateToShare').val(),
        message: $('#messageToShare').val()
    }
    socket.emit('shared', data);
}

function getUpdateShared() {
    let checkValue = '';
    $('input[name="group1"]').each(function () {
        if ($(this).is(':checked')) {
            checkValue = $(this).val()
        }
    })
    const data = {
        id_file: $('#id_file').val(),
        crypt_link: $('#id_cryptlink').val(),
        privilege: checkValue.includes('&') ?
            checkValue.split('&') : [checkValue],
        password: $('#passwordToShare').val(),
        date: $('#dateToShare').val(),
        message: $('#messageToShare').val()
    }
    console.log('oui', data);
    socket.emit('updateShared', data);
}

function DeleteShared(id, crypt_link) {
    const data = {
        file_id: id,
        crypt_link: crypt_link
    }
    socket.emit('deleteShared', data);
}

function updateShared(id, cl, password, expiration, privileges, message) {
    let p = privileges.includes(',') ? privileges.split(',') : [privileges.toString()];
    $('#id_file').val(id);
    $('#id_cryptlink').val(cl);
    $('.lead').text('modification de partage');
    $('.text').html('modifier les options de partage de votre fichier')
    $('.modal-footer .btn-primary').css('display', 'none');
    $('.modal-footer .btn-default').css('display', 'block');
    $('#messageToShare').val(message);
    if (password !== '' && password !== 'null') {
        $('#passwordProtection').attr('checked', true);
        $('#passwordToShare').css('display', 'block');
        $('#passwordToShare').val(password);
    }
    if (expiration !== '' && expiration !== 'null') {
        $('#ExpirationDate').attr('checked', true);
        $('#dateToShare').css('display', 'block');
        let year = new Date(expiration).getFullYear();
        let month = (new Date(expiration).getMonth() + 1) < 10 ? '0' + (new Date(expiration).getMonth() + 1) : (new Date(expiration).getMonth() + 1);
        let day = new Date(expiration).getDate();
        $('#dateToShare').val(year + '-' + month + '-' + day);
    }
    if (p.includes('download') && !p.includes('read')) {
        $('#rd').attr('checked', false);
        $('#rwd').attr('checked', false);
        $('#d').attr('checked', true);
    } else if (p.includes('download') && p.includes('read') && !p.includes('write')) {
        $('#d').attr('checked', false);
        $('#rwd').attr('checked', false);
        $('#rd').attr('checked', true);
    } else {
        $('#rd').attr('checked', false);
        $('#d').attr('checked', false);
        $('#rwd').attr('checked', true);
    }
    $('#modalPoll-1').modal('show');
}


function resetSharedFormValue() {
    $('.lead').text('formulaire de partage');
    $('.text').html(`partager vos données avec d'autres personnes
    <strong>veuillez remplir les champs suivants</strong>`);
    $('input[name="group1"]').each(function () {
        $(this).attr('checked', false);
    })
    $('#passwordToShare').val('').css('display', 'none');
    $('#passwordProtection').attr('checked', false);
    $('#ExpirationDate').attr('checked', false);
    $('#dateToShare').val('').css('display', 'none');;
    $('#messageToShare').val('');
    $('.modal-footer .btn-primary').css('display', 'block');
    $('.modal-footer .btn-default').css('display', 'none');
}



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

function setFalse() {
    showrightside = false;
}

function setTrue() {
    showrightside = true;
}
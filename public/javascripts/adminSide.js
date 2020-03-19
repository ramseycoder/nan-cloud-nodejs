const socket = io();

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
$('.childCheck').on('mouseover', function () {
    showrightside = false;
});
$('.childCheck').on('mouseleave', function () {
    showrightside = true
})
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

    $('.childCheck').each(function () {
        $(this).on('change', function () {
            if ($(this).is(':checked')) {
                $(this).parents('tr').css('background-color', 'rgb(203, 203, 203)');
                $(this).css('display', 'block');
                if (this.nextElementSibling.children[0] === undefined) {
                    console.log('oui')
                    console.log(this.nextElementSibling.textContent)
                    socket.emit('addgetFileSize', this.nextElementSibling.textContent)
                } else {
                    console.log('onn');
                    console.log(this.nextElementSibling.children[0].textContent)
                    socket.emit('addgetFileSize', this.nextElementSibling.children[0].textContent)
                };

            } else {
                $(this).parents('tr').css('background-color', 'transparent');
                if (this.nextElementSibling.children[0] === undefined) {
                    socket.emit('removegetFileSize', this.nextElementSibling.textContent)
                } else {
                    socket.emit('removegetFileSize', this.nextElementSibling.children[0].textContent)
                };
            }
        })
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
        <li><span class="link">http://localhost:4000/shared/${opt.crypt_link}</span><div class="right"><i class="fas fa-edit"></i><i class="fas fa-trash"></i></div></li>
        `;
        });
        $('#partager ul').html(el);
        $('#id_file').val(data._id);
        let nameFolder = data.type === "file" ? data.name + '.' + data.mimetype : data.name
        console.log('data.name => ', nameFolder);
        console.log('type => ', getType(nameFolder));
        if (getType(nameFolder) === data.name) {
            donne = `<div class="repre">
                <img src="/public/images/folder.png" width="100" height="100" />
              </div>
              <div class="info">
                <h4>${nameFolder}</h4>
                  <p><span>${((data.size/1000)/1000).toFixed(2)} Mo </span>&nbsp;&nbsp;&nbsp;&nbsp;<span>${data.date_creation}</span></p>
              </div>`
        } else if (verifImage(nameFolder)) {
            donne = `<div class="repre">
                <img src="/STORAGE/${nameFolder}" width="100" height="100"/>
              </div>
              <div class="info">
                  <h4>${nameFolder}</h4>
                  <p><span>${((data.size/1000)/1000).toFixed(2)} Mo </span>&nbsp;&nbsp;&nbsp;&nbsp;<span>${data.date_creation}</span></p>
              </div>`
        } else if (getType(nameFolder) === "mp3") {
            donne = `<div class="repre">
                       <img src="/public/images/folder.png" width="100" height="100" />
              </div>
              <div class="info">
                 <h4>${nameFolder}</h4>
                  <p><span>${((data.size/1000)/1000).toFixed(2)} Mo </span>&nbsp;&nbsp;&nbsp;&nbsp;<span>${data.date_creation}</span></p>
              </div>`
        } else if (getType(nameFolder) === "pdf") {
            donne = `<div class="repre">
          <img src="/public/images/pdf.png" width="100" height="100" />
              </div>
              <div class="info">
                <h4>${nameFolder}</h4>
                  <p><span>${((data.size/1000)/1000).toFixed(2)} Mo </span>&nbsp;&nbsp;&nbsp;&nbsp;<span>${data.date_creation}</span></p>
              </div>`
        } else if (getType(nameFolder) === "txt") {
            donne = `<div class="repre">
          <img src="/public/images/txt.png" width="100" height="100" />
              </div>
              <div class="info">
                <h4>${nameFolder}</h4>
                  <p><span>${((data.size/1000)/1000).toFixed(2)} Mo </span>&nbsp;&nbsp;&nbsp;&nbsp;<span>${data.date_creation}</span></p>
              </div>`
        } else if (getType(nameFolder) === "mp4") {
            donne = `<div class="repre">
          <img src="/public/images/video-player.png" width="100" height="100" />
              </div>
              <div class="info">
                <h4>${nameFolder}</h4>
                  <p><span>${((data.size/1000)/1000).toFixed(2)} Mo </span>&nbsp;&nbsp;&nbsp;&nbsp;<span>${data.date_creation}</span></p>
              </div>`
        }
        $('.right_content .contenu_article').html(donne)
        console.log('data => ', data);
        const boxContent = document.querySelector('.box_content');
        setTimeout(() => {
            boxContent.children[0].classList.remove('col-lg-12');
            boxContent.children[0].classList.remove('col-md-12');
            boxContent.children[0].classList.add('col-lg-9');
            boxContent.children[0].classList.add('col-md-9');
        }, 200);
        $('.right_content').fadeIn(200);
    });


    socket.on('shared', (data) => {
        console.log('données', data);
        $('#modalPoll-1').modal('hide');
        resetSharedFormValue();
        let el = '';
        data.sharedOptions.forEach(opt => {
            el += `
        <li><span class="link">http://localhost:4000/shared/${opt.crypt_link}</span><div class="right"><i class="fas fa-edit"></i><i class="fas fa-trash"></i></div></li>
        `;
        });
        $('#partager ul').html(el);
    })


    socket.on('addgetFileSize', (data) => {
        $('.deleteDownload').css('display', 'block');
        let t = $('.deleteDownload .taille span').text();
        let taille = t === '' ? 0 : parseFloat(t).toFixed(2);
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
            $('.deleteDownload').css('display', 'none');
        }
    });
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
    console.log('files', files);
    socket.emit('deleteFiles', files);
});

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
    console.log('shared', data);
    socket.emit('shared', data);
}

function resetSharedFormValue() {
    $('#id_file').val('');
    $('#passwordToShare').val('');
    $('#passwordProtection').attr('checked', false);
    $('#expirationDate').attr('checked', false);
    $('#dateToShare').val('');
    $('#messageToShare').val('');
}
// declaration de tableau pour les images
let ImageTab = [];
let presentIndex = 0;
let link = path === "" ? `/STORAGE` : `/STORAGE/${path}`;
// récupérer toutes les images du dossier courant
$('.imageSlide').each(function () {
    ImageTab.push($(this).text());
});

///

function readImage(el) {
    showrightside = false;
    $('#ombreView').fadeIn(500);
    $('.imageReader .params a').attr('href', `/download?&type=file&file=${el}`);
    presentIndex = ImageTab.indexOf(el);
    if (presentIndex === ImageTab.length - 1) $('.imageReader .right-slide').css('display', 'none');
    else if (presentIndex === 0) $('.imageReader .left-slide').css('display', 'none');
    else {
        $('.imageReader .left-slide').fadeIn(300);
        $('.imageReader .right-slide').fadeIn(300);
    };
    $('.imageReader .Image img').attr('src', `${link}/${el}`);
    $('.imageReader').fadeIn(500);
}

// afficher l'image suivante et précédente

$('.imageReader .left-slide').on('click', function () {
    $('.imageReader .Image img').attr('src', `${link}/${ImageTab[presentIndex-1]}`);
    $('.imageReader .params a').attr('href', `/download?type=file&file=${ImageTab[presentIndex-1]}`);
    presentIndex = presentIndex - 1;
    if (presentIndex === 0) {
        $(this).fadeOut(300);
    }
    if (presentIndex === ImageTab.length - 2) {
        $('.imageReader .right-slide').fadeIn(300);
    }
});

$('.imageReader .right-slide').on('click', function () {
    $('.imageReader .Image img').attr('src', `${link}/${ImageTab[presentIndex+1]}`);
    $('.imageReader .params a').attr('href', `/download?type=file&file=${ImageTab[presentIndex+1]}`);
    presentIndex = presentIndex + 1;
    if (presentIndex === ImageTab.length - 1) {
        $(this).fadeOut(300);
    }
    if (presentIndex === 1) {
        $('.imageReader .left-slide').fadeIn(300);
    }
});

// download

// fermeture
$('.imageReader .params i.fa-times-circle').on('click', function () {
    showrightside = true;
    $('#ombreView').fadeOut(300);
    $('.imageReader').fadeOut(300);
});



// video reader

function videoReader(el) {
    showrightside = false;
    $('#ombreView').fadeIn(500);
    $('.videoReader').fadeIn(500);
    $('.videoReader').html(`<div class="params">
        <a href="/download?type=file&file=${el}"><i class="fas fa-file-download"></i></a>
        <i  onclick="closeVideoReader()" class="fas fa-times-circle"></i>
    </div>
        <video autoplay controls width="800" height="500">
            <source src="${link}/${el}" type="video/mp4">
        </video>
    `);
}

function closeVideoReader() {
    showrightside = true;
    $('.videoReader').html(' ');
    $('#ombreView').fadeOut(300);
    $('.videoReader').fadeOut(300);
}



// fileReader
function fileReader(el) {
    showrightside = false;
    $('#ombreView').fadeIn(500);
    $('.fileReader').fadeIn(500);
    $('.fileReader').html(`<div class="params">
        <i onclick="closeFileReader()" class="fas fa-times-circle"></i><br>
        <a href="/download?type=file&file=${el}"><i class="fas fa-file-download"></i></a>
    </div>
        <iframe src="${link}/${el}" width="100%", height="100%"></iframe>
    `);
}

function closeFileReader() {
    showrightside = true;
    $('.fileReader').html(' ');
    $('#ombreView').fadeOut(300);
    $('.fileReader').fadeOut(300);
}
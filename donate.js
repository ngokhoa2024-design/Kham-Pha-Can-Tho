document.addEventListener('DOMContentLoaded', function () {
    var qrLink = document.querySelector('.donate-qr-link');

    if (!qrLink) return;

    var qrImage = qrLink.querySelector('.donate-qr');
    var lightbox = document.createElement('div');
    lightbox.className = 'donate-lightbox';
    lightbox.setAttribute('role', 'dialog');
    lightbox.setAttribute('aria-modal', 'true');
    lightbox.setAttribute('aria-label', 'Mã QR ủng hộ dự án');
    lightbox.innerHTML =
        '<div class="donate-lightbox-content">' +
        '<button type="button" class="donate-lightbox-close" aria-label="Đóng">×</button>' +
        '<img class="donate-lightbox-image" src="' + qrImage.src + '" alt="QR Donate">' +
        '<div class="donate-account-box">' +
        '<p class="donate-account-label">Số tài khoản:</p>' +
        '<p class="donate-account-number">0907929689</p>' +
        '<button type="button" class="donate-lightbox-link donate-copy-btn">Sao chép số tài khoản</button>' +
        '</div>' +
        '</div>';

    document.body.appendChild(lightbox);

    var closeButton = lightbox.querySelector('.donate-lightbox-close');
    var copyButton = lightbox.querySelector('.donate-copy-btn');
    var accountNumber = lightbox.querySelector('.donate-account-number');
    var toast = document.createElement('div');
    toast.className = 'donate-toast';
    toast.textContent = 'Đã copy số tài khoản thành công';
    document.body.appendChild(toast);

    function showToast() {
        toast.classList.add('is-visible');
        clearTimeout(showToast.timeout);
        showToast.timeout = setTimeout(function () {
            toast.classList.remove('is-visible');
        }, 2200);
    }

    function closeLightbox() {
        lightbox.classList.remove('is-open');
        document.body.classList.remove('donate-lightbox-open');
        qrLink.focus();
    }

    qrLink.addEventListener('click', function (event) {
        event.preventDefault();
        lightbox.classList.add('is-open');
        document.body.classList.add('donate-lightbox-open');
        closeButton.focus();
    });

    copyButton.addEventListener('click', function () {
        navigator.clipboard.writeText(accountNumber.textContent).then(function () {
            showToast();
        }).catch(function () {
            showToast();
        });
    });

    closeButton.addEventListener('click', closeLightbox);

    lightbox.addEventListener('click', function (event) {
        if (event.target === lightbox) closeLightbox();
    });

    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape' && lightbox.classList.contains('is-open')) {
            closeLightbox();
        }
    });
});

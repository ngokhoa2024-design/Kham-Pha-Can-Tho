const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbyo1Hr2MazAzvoNbo2ebJa4Du07VC_Vk-nstV6Gmvuc7jzMRrsYOLgu9n2QYPDJZHjhew/exec";

document.addEventListener("DOMContentLoaded", function () {
    const links = document.querySelectorAll(".navbar a");
    let currentPage = window.location.pathname.split("/").pop();
    if (currentPage === "") currentPage = "buddy-dong-hanh.html";

    links.forEach(function (link) {
        const href = link.getAttribute("href");
        if (!href || href === "#") return;
        const linkPage = href.split("/").pop();
        if (linkPage === currentPage) link.classList.add("active");
    });

    const heroBtn = document.querySelector(".hero-btn");
    const formSection = document.querySelector("#go-cantho-form");
    const header = document.querySelector(".header");

    if (heroBtn && formSection && header) {
        heroBtn.addEventListener("click", function (event) {
            event.preventDefault();
            const y = formSection.getBoundingClientRect().top + window.scrollY - header.offsetHeight - 12;
            window.scrollTo({ top: y, behavior: "smooth" });
        });
    }

    const form = document.querySelector("#goCanThoForm");
    const formNote = document.querySelector("#goCanThoNote");

    if (form && formNote) {
        form.addEventListener("submit", async function (event) {
            event.preventDefault();

            if (!form.checkValidity()) {
                formNote.textContent = "Vui lòng điền đầy đủ thông tin trước khi gửi.";
                formNote.classList.add("error");
                form.reportValidity();
                return;
            }

            const payload = {
                name: form.name.value.trim(),
                email: form.email.value.trim(),
                phone: form.phone.value.trim(),
                tripDate: form.trip_date.value,
                guestCount: form.guest_count.value.trim(),
                tripType: form.trip_type.value.trim(),
                message: form.message.value.trim()
            };

            const mailMessage = [
                "YEU CAU GO CAN THO - BUDDY DONG HANH",
                "Ho va ten: " + payload.name,
                "Email: " + payload.email,
                "So dien thoai / Zalo: " + payload.phone,
                "Ngay du kien di: " + payload.tripDate,
                "So nguoi tham gia: " + payload.guestCount,
                "Kieu chuyen di: " + payload.tripType,
                "Noi dung yeu cau: " + payload.message
            ].join("\n");

            const body = new URLSearchParams({
                name: payload.name,
                email: payload.email,
                message: mailMessage
            });

            try {
                formNote.textContent = "Đang gửi liên hệ...";
                formNote.classList.remove("error");

                await fetch(WEB_APP_URL, {
                    method: "POST",
                    mode: "no-cors",
                    headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
                    body: body.toString()
                });

                formNote.textContent = "Đã gửi thành công. Tụi mình sẽ liên hệ lại sớm nhất có thể.";
                formNote.classList.remove("error");
                form.reset();
            } catch (error) {
                formNote.textContent = "Gửi thất bại, vui lòng thử lại sau ít phút.";
                formNote.classList.add("error");
            }
        });
    }
});

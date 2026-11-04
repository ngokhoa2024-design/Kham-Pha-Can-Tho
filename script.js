function generateTrip() {
    const mood = document.getElementById('mood').value;
    const time = document.getElementById('time').value;
    const resultBox = document.getElementById('result');
    const content = document.getElementById('trip-content');

    let suggestion = "";

    // Logic gợi ý dựa trên sự kết hợp (Mood + Time)
    if (mood === 'healing' && time === '3h') {
        suggestion = "📍 <b>Thiền viện Trúc Lâm Phương Nam:</b> Tận hưởng không gian thanh tịnh và kiến trúc thuần Việt giữa lòng Cần Thơ.";
    } else if (mood === 'adventure' && time === '3h') {
        suggestion = "📍 <b>Chợ nổi Cái Răng:</b> Thuê một chiếc ghe nhỏ, len lỏi giữa hàng trăm chiếc tàu để cảm nhận nhịp sống sông nước hối hả.";
    } else if (mood === 'foodie') {
        suggestion = "📍 <b>Food Tour Đêm:</b> Thưởng thức vịt nấu chao Thành Giao, nem nướng Cái Răng và kết thúc bằng ly dừa dầm tại bến Ninh Kiều.";
    } else if (mood === 'romantic' && time === '12h') {
        suggestion = "📍 <b>Cầu Tình Yêu & Ăn tối du thuyền:</b> Ngắm hoàng hôn trên cầu đi bộ và thưởng thức bữa tối lãng mạn khi tàu trôi dọc sông Hậu.";
    } else {
        suggestion = "📍 <b>Làng du lịch Mỹ Khánh:</b> Trải nghiệm làm nông dân, xem đua heo và thưởng thức trái cây miệt vườn trĩu quả.";
    }

    content.innerHTML = suggestion;
    resultBox.classList.remove('hidden');
}
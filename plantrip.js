let currentStep = 1;
const totalSteps = 6;
const formData = {};
const headerOffset = 110;

document.addEventListener('DOMContentLoaded', () => {
    initializeQuiz();
});

function initializeQuiz() {
    updateProgress();
    autoScrollOnEntry();

    document.getElementById('quizForm').addEventListener('change', () => {
        validateCurrentStep();
    });
}

function nextStep() {
    if (!validateCurrentStep()) return;

    saveFormData();

    if (currentStep < totalSteps) {
        toggleStep(currentStep, false);
        currentStep += 1;
        toggleStep(currentStep, true);
        updateProgress();
        scrollToActiveStep();
        return;
    }

    generateItinerary();
}

function previousStep() {
    if (currentStep <= 1) return;

    toggleStep(currentStep, false);
    currentStep -= 1;
    toggleStep(currentStep, true);
    updateProgress();
    scrollToActiveStep();
}

function toggleStep(stepNumber, isActive) {
    const step = document.querySelector(`.quiz-step[data-step="${stepNumber}"]`);
    if (step) {
        step.classList.toggle('active', isActive);
    }
}

function updateProgress() {
    const progressPercent = (currentStep / totalSteps) * 100;
    document.getElementById('progressFill').style.width = `${progressPercent}%`;
    document.getElementById('currentStep').textContent = currentStep;
    document.getElementById('prevBtn').style.display = currentStep > 1 ? 'inline-flex' : 'none';

    const nextBtn = document.getElementById('nextBtn');
    nextBtn.innerHTML = currentStep === totalSteps
        ? '<i class="fas fa-magic"></i> Tạo Lịch Trình'
        : 'Tiếp Theo <i class="fas fa-arrow-right"></i>';
}

function validateCurrentStep() {
    let isValid = true;
    let errorMsg = '';

    if (currentStep === 1) {
        isValid = document.querySelector('input[name="duration"]:checked') !== null;
        errorMsg = 'Vui lòng chọn thời gian du lịch';
    } else if (currentStep === 2) {
        const selected = document.querySelectorAll('input[name="interests"]:checked').length;
        isValid = selected >= 2 && selected <= 3;
        errorMsg = 'Vui lòng chọn 2-3 sở thích';
    } else if (currentStep === 3) {
        isValid = document.querySelector('input[name="budget"]:checked') !== null;
        errorMsg = 'Vui lòng chọn mức ngân sách';
    } else if (currentStep === 4) {
        isValid = document.querySelector('input[name="style"]:checked') !== null;
        errorMsg = 'Vui lòng chọn kiểu du lịch';
    } else if (currentStep === 5) {
        isValid = document.querySelector('input[name="pace"]:checked') !== null;
        errorMsg = 'Vui lòng chọn nhịp độ du lịch';
    }

    if (!isValid && errorMsg) {
        alert(errorMsg);
    }

    return isValid;
}

function saveFormData() {
    if (currentStep === 1) {
        formData.duration = document.querySelector('input[name="duration"]:checked').value;
    } else if (currentStep === 2) {
        formData.interests = Array.from(document.querySelectorAll('input[name="interests"]:checked')).map((input) => input.value);
    } else if (currentStep === 3) {
        formData.budget = document.querySelector('input[name="budget"]:checked').value;
    } else if (currentStep === 4) {
        formData.style = document.querySelector('input[name="style"]:checked').value;
    } else if (currentStep === 5) {
        formData.pace = document.querySelector('input[name="pace"]:checked').value;
    } else if (currentStep === 6) {
        formData.needs = Array.from(document.querySelectorAll('input[name="needs"]:checked')).map((input) => input.value);
    }
}

function generateItinerary() {
    saveFormData();

    const itinerary = createSmartItinerary(formData);
    document.getElementById('quizSection').style.display = 'none';
    document.getElementById('resultsSection').style.display = 'block';

    const duration = getDurationLabel(formData.duration);
    const interests = formData.interests.map(getInterestLabel).join(', ').replace(/,([^,]*)$/, ' và$1');

    document.getElementById('tripInfo').innerHTML = `
        <strong>${duration}</strong> - Sở thích: ${interests} - Nhịp độ: ${getPaceLabel(formData.pace)} - Phong cách: ${getStyleLabel(formData.style)}
    `;

    renderItinerary(itinerary);
    scrollToResultsSection();
}

function createSmartItinerary(data) {
    const dayCount = getDurationDays(data.duration);
    const itinerary = [];

    for (let day = 1; day <= dayCount; day += 1) {
        const primaryInterest = data.interests[(day - 1) % data.interests.length];
        const secondaryInterest = data.interests[day % data.interests.length] || primaryInterest;
        const activities = buildDayActivities(day, dayCount, primaryInterest, secondaryInterest, data);

        itinerary.push({
            day,
            title: `Ngày ${day}: ${getDayTitle(data.interests, day)}`,
            activities
        });
    }

    return itinerary;
}

function buildDayActivities(dayNumber, totalDays, primaryInterest, secondaryInterest, data) {
    const scheduleTemplates = getScheduleTemplates(data);
    const slotPlan = getSlotsForPace(data.pace, primaryInterest === 'relax' || secondaryInterest === 'relax');

    return slotPlan.map((slot, index) => {
        const interest = slot.focus === 'secondary' ? secondaryInterest : primaryInterest;
        const fallbackInterest = slot.focus === 'secondary' ? primaryInterest : secondaryInterest;
        const activity = pickActivity(scheduleTemplates, interest, fallbackInterest, slot.key, index, dayNumber, totalDays, data);

        return {
            time: slot.time,
            title: activity.title,
            desc: activity.desc,
            tips: generateTip(activity, data, dayNumber, totalDays)
        };
    }).filter((activity) => {
        if (!activity?.title) return false;
        return true;
    }).filter((activity, index, list) => list.findIndex((item) => item.title === activity.title) === index);
}

function getScheduleTemplates(data) {
    const styleText = getStyleSupportText(data.style);
    const finalDayText = data.duration === '1' ? 'và không phải di chuyển quá gấp' : 'để vẫn còn sức cho phần còn lại của chuyến đi';

    return {
        food: {
            earlyMorning: [
                { title: 'Chợ nổi Cái Răng', desc: `Đi ghe từ sớm để cảm nhận nhịp sống buôn bán trên sông, ${styleText}.` }
            ],
            morning: [
                { title: 'Ăn sáng hủ tiếu hoặc bánh mì chảo', desc: 'Ăn sáng ngay sau chợ nổi để lịch trình liền mạch và hợp giờ sinh hoạt.' }
            ],
            lunch: [
                { title: 'Ăn trưa đặc sản miền Tây', desc: 'Ưu tiên món địa phương như lẩu mắm, cá nướng hoặc bún nước lèo gần khu trung tâm.' }
            ],
            afternoon: [
                { title: 'Cà phê nghỉ chân và thử món ngọt', desc: 'Nghỉ giữa ngày ở quán mát để không bị dồn lịch quá nặng sau bữa trưa.' }
            ],
            evening: [
                { title: 'Food tour bến Ninh Kiều', desc: `Khung giờ đẹp để vừa ăn tối vừa dạo phố ven sông, ${finalDayText}.` }
            ],
            night: [
                { title: 'Dạo ven sông Hậu buổi tối', desc: 'Sau bữa tối có thể đi bộ nhẹ để ngắm thành phố lên đèn.' }
            ]
        },
        culture: {
            earlyMorning: [
                { title: 'Chùa Ông Cần Thơ', desc: 'Buổi sáng yên tĩnh, phù hợp tham quan và tìm hiểu kiến trúc tín ngưỡng.' }
            ],
            morning: [
                { title: 'Nhà cổ Bình Thủy', desc: 'Sắp xếp sau trung tâm thành phố để di chuyển hợp lý và tránh đi vòng.' }
            ],
            lunch: [
                { title: 'Ăn trưa món Việt truyền thống', desc: 'Chọn quán gần điểm tham quan để tiết kiệm thời gian giữa trưa.' }
            ],
            afternoon: [
                { title: 'Đền thờ Vua Hùng hoặc bảo tàng địa phương', desc: 'Buổi chiều phù hợp cho điểm có bóng mát hoặc không gian trưng bày trong nhà.' }
            ],
            evening: [
                { title: 'Dạo bến Ninh Kiều và nghe đờn ca tài tử', desc: 'Kết hợp tham quan cảnh quan và trải nghiệm bản sắc miền Tây vào buổi tối.' }
            ],
            night: [
                { title: 'Chụp ảnh cầu đi bộ về đêm', desc: 'Một điểm dừng ngắn, đẹp ánh sáng, dễ ghép vào cuối ngày.' }
            ]
        },
        nature: {
            earlyMorning: [
                { title: 'Tham quan khu sinh thái buổi sớm', desc: 'Không khí mát và dễ chịu hơn, phù hợp đi bộ giữa vườn cây và kênh rạch.' }
            ],
            morning: [
                { title: 'Vườn trái cây Mỹ Khánh hoặc 9 Hồng', desc: 'Đi buổi sáng sẽ dễ tham quan, chụp ảnh và thưởng thức trái cây tại vườn.' }
            ],
            lunch: [
                { title: 'Ăn trưa tại khu du lịch sinh thái', desc: 'Dùng bữa ngay trong khu tham quan giúp tránh quay lại trung tâm vào giờ nắng.' }
            ],
            afternoon: [
                { title: 'Đi xuồng hoặc trải nghiệm trò chơi dân gian', desc: 'Sau khi nghỉ trưa có thể tham gia hoạt động ngoài trời nhẹ nhàng hơn.' }
            ],
            evening: [
                { title: 'Ngắm hoàng hôn ven sông Hậu', desc: 'Khoảng thời gian thư giãn đẹp nhất trong ngày trước bữa tối.' }
            ],
            night: [
                { title: 'Ăn tối món quê dân dã', desc: 'Khép lại ngày sinh thái bằng bữa tối gần nơi lưu trú hoặc ven sông.' }
            ]
        },
        adventure: {
            earlyMorning: [
                { title: 'Đạp xe quanh Bến Ninh Kiều và cầu đi bộ', desc: 'Khởi động sớm ở khu ven sông nổi tiếng nhất Cần Thơ để tận dụng thời tiết mát và tạo nhịp cho ngày năng động.' }
            ],
            morning: [
                { title: 'Chèo SUP hoặc xuồng nhỏ khu Bến Ninh Kiều', desc: 'Buổi sáng thường ổn định hơn cho hoạt động trên nước, đặc biệt khi xuất phát từ khu trung tâm ven sông.' }
            ],
            lunch: [
                { title: 'Ăn trưa nhanh và đủ năng lượng', desc: 'Ưu tiên món gọn nhẹ để tiếp tục hành trình mà không bị nặng bụng.' }
            ],
            afternoon: [
                { title: 'Trò chơi dân gian tại Mỹ Khánh, Ông Đề hoặc Lung Cột Cầu', desc: 'Buổi chiều hướng tới những khu du lịch sinh thái nổi tiếng để vận động, tham gia trò chơi và khám phá không gian miệt vườn thực tế.' }
            ],
            evening: [
                { title: 'Khám phá chợ đêm Ninh Kiều', desc: 'Đổi nhịp sang không khí sôi động hơn tại khu vực nổi tiếng, dễ ăn vặt, dạo phố và kiểm soát thời gian.' }
            ],
            night: [
                { title: 'Cà phê rooftop view sông Hậu hoặc cầu Cần Thơ', desc: 'Kết ngày năng động bằng một điểm ngắm cảnh thoáng đãng, nhìn ra khu ven sông và các biểu tượng buổi tối của thành phố.' }
            ]
        },
        photo: {
            earlyMorning: [
                { title: 'Săn bình minh tại bến Ninh Kiều', desc: 'Ánh sáng đầu ngày đẹp, mềm và rất hợp cho ảnh phong cảnh.' }
            ],
            morning: [
                { title: 'Chợ nổi hoặc nhà cổ cho bộ ảnh đời sống', desc: 'Buổi sáng có nhiều hoạt động thật, lên ảnh sống động và giàu chất địa phương.' }
            ],
            lunch: [
                { title: 'Ăn trưa ở quán có không gian đẹp', desc: 'Kết hợp nghỉ chân và chụp ảnh món ăn hoặc góc nội thất.' }
            ],
            afternoon: [
                { title: 'Check-in quán cà phê, hẻm nhỏ và cầu đi bộ', desc: 'Ánh sáng chiều phù hợp chụp chân dung và ảnh đường phố.' }
            ],
            evening: [
                { title: 'Chụp hoàng hôn ven sông', desc: 'Khung giờ vàng để ghi lại cảnh sông nước và màu trời đẹp nhất.' }
            ],
            night: [
                { title: 'Chụp đêm ở bến Ninh Kiều', desc: 'Ánh đèn phản chiếu trên mặt nước tạo hiệu ứng ảnh buổi tối rất tốt.' }
            ]
        },
        relax: {
            earlyMorning: [
                { title: 'Ăn sáng chậm tại quán cà phê yên tĩnh', desc: 'Bắt đầu ngày thư thả, không cần dậy quá sớm để giữ năng lượng.' }
            ],
            morning: [
                { title: 'Dạo nhẹ bến Ninh Kiều hoặc công viên ven sông', desc: 'Lịch nhẹ, không áp lực ghé quá nhiều điểm trong một buổi.' }
            ],
            lunch: [
                { title: 'Ăn trưa tại nhà hàng thoáng mát', desc: 'Ưu tiên không gian dễ chịu và món ăn thanh vị để thư giãn thật sự.' }
            ],
            afternoon: [
                { title: 'Spa hoặc nghỉ ngơi tại khách sạn', desc: 'Một khoảng nghỉ rõ ràng để cơ thể hồi phục sau di chuyển.' }
            ],
            evening: [
                { title: 'Du thuyền tối hoặc cà phê ven sông', desc: 'Không gian dịu, phù hợp trò chuyện và ngắm cảnh thành phố lên đèn.' }
            ],
            night: [
                { title: 'Về sớm nghỉ ngơi', desc: 'Giữ nhịp độ nhẹ nhàng cho ngày tiếp theo.' }
            ]
        }
    };
}

function getSlotsForPace(pace, hasRelaxInterest) {
    const earlyTime = hasRelaxInterest ? '08:00' : '06:00';
    const morningTime = hasRelaxInterest ? '09:30' : '08:30';

    const slotSets = {
        relaxed: [
            { key: 'earlyMorning', time: earlyTime, focus: 'primary' },
            { key: 'morning', time: morningTime, focus: 'secondary' },
            { key: 'lunch', time: '12:00', focus: 'primary' },
            { key: 'evening', time: '18:00', focus: 'secondary' }
        ],
        moderate: [
            { key: 'earlyMorning', time: earlyTime, focus: 'primary' },
            { key: 'morning', time: morningTime, focus: 'secondary' },
            { key: 'lunch', time: '12:00', focus: 'primary' },
            { key: 'afternoon', time: '14:30', focus: 'secondary' },
            { key: 'evening', time: '18:00', focus: 'primary' },
            { key: 'night', time: '20:00', focus: 'secondary' }
        ],
        active: [
            { key: 'earlyMorning', time: hasRelaxInterest ? '07:30' : '05:45', focus: 'primary' },
            { key: 'morning', time: '08:00', focus: 'secondary' },
            { key: 'morning', time: '10:00', focus: 'primary' },
            { key: 'lunch', time: '12:15', focus: 'secondary' },
            { key: 'afternoon', time: '14:00', focus: 'primary' },
            { key: 'afternoon', time: '16:00', focus: 'secondary' },
            { key: 'evening', time: '18:30', focus: 'primary' },
            { key: 'night', time: '20:30', focus: 'secondary' }
        ]
    };

    return slotSets[pace] || slotSets.moderate;
}

function pickActivity(templates, interest, fallbackInterest, slotKey, index, dayNumber, totalDays, data) {
    const primaryList = templates[interest]?.[slotKey] || [];
    const fallbackList = templates[fallbackInterest]?.[slotKey] || [];
    const defaultList = templates.relax[slotKey] || [];
    const pool = [...primaryList, ...fallbackList, ...defaultList];
    const selected = pool[(dayNumber + index - 1) % pool.length];

    if (slotKey === 'night' && data.pace === 'relaxed' && totalDays > 1) {
        return {
            title: 'Nghỉ ngơi nhẹ tại khách sạn hoặc quán yên tĩnh',
            desc: 'Giữ sức cho ngày hôm sau thay vì kéo lịch trình quá muộn.'
        };
    }

    return selected;
}

function generateTip(activity, data, dayNumber, totalDays) {
    const tips = [];

    if (data.needs?.includes('wheelchair')) {
        tips.push('nên kiểm tra trước lối đi và phương tiện tiếp cận');
    }
    if (data.needs?.includes('vegetarian') && /Ăn|Food|quán|nhà hàng|món/i.test(activity.title)) {
        tips.push('có thể báo trước nhu cầu món chay');
    }
    if (data.needs?.includes('kids')) {
        tips.push('nên mang theo nước và đồ ăn nhẹ cho trẻ');
    }
    if (data.needs?.includes('petfriendly')) {
        tips.push('nên hỏi trước nơi có nhận thú cưng');
    }
    if (data.needs?.includes('wifi') && /Cà phê|quán|khách sạn|rooftop/i.test(activity.title)) {
        tips.push('phù hợp tranh thủ kết nối Wi-Fi hoặc xử lý công việc');
    }

    if (data.budget === 'budget') {
        tips.push('ưu tiên dịch vụ bình dân để giữ ngân sách');
    } else if (data.budget === 'luxury') {
        tips.push('có thể đặt trước dịch vụ riêng để thoải mái hơn');
    }

    if (dayNumber === totalDays) {
        tips.push('nên chừa thời gian quay về nơi lưu trú hoặc điểm khởi hành');
    }

    return tips.length > 0
        ? tips.join('; ')
        : 'Nên linh hoạt thời gian thực tế theo thời tiết và quãng đường di chuyển';
}

function getDurationDays(duration) {
    const map = { '1': 1, '2-3': 2, '4-5': 4, '7+': 7 };
    return map[duration] || 1;
}

function getDurationLabel(duration) {
    const map = { '1': '1 Ngày', '2-3': '2-3 Ngày', '4-5': '4-5 Ngày', '7+': '1 Tuần Trở Lên' };
    return map[duration] || duration;
}

function getInterestLabel(interest) {
    const map = {
        food: 'Ẩm thực',
        culture: 'Văn hóa',
        nature: 'Thiên nhiên',
        adventure: 'Phiêu lưu',
        photo: 'Chụp ảnh',
        relax: 'Thư giãn'
    };
    return map[interest] || interest;
}

function getStyleLabel(style) {
    const map = {
        solo: 'Một mình',
        couple: 'Cặp đôi',
        family: 'Gia đình',
        group: 'Nhóm bạn'
    };
    return map[style] || style;
}

function getPaceLabel(pace) {
    const map = {
        relaxed: 'Chậm rãi',
        moderate: 'Vừa phải',
        active: 'Năng động'
    };
    return map[pace] || pace;
}

function getStyleSupportText(style) {
    const map = {
        solo: 'dễ chủ động thời gian và nhịp di chuyển',
        couple: 'không khí phù hợp cho trải nghiệm riêng tư',
        family: 'thuận tiện khi đi cùng gia đình',
        group: 'phù hợp khi đi cùng nhóm bạn'
    };
    return map[style] || 'phù hợp cho nhiều kiểu đồng hành';
}

function getDayTitle(interests, dayNumber) {
    const titles = {
        food: 'Ẩm Thực Và Chợ Nổi',
        culture: 'Văn Hóa Và Lịch Sử',
        nature: 'Thiên Nhiên Và Sinh Thái',
        adventure: 'Hoạt Động Và Khám Phá',
        photo: 'Chụp Ảnh Và Check-in',
        relax: 'Thư Giãn Và Dạo Cảnh'
    };
    const index = (dayNumber - 1) % interests.length;
    return titles[interests[index]] || 'Khám Phá Cần Thơ';
}

function renderItinerary(itinerary) {
    const container = document.getElementById('itineraryContainer');
    container.innerHTML = '';

    itinerary.forEach((dayPlan) => {
        const dayDiv = document.createElement('div');
        dayDiv.className = 'itinerary-day';
        dayDiv.innerHTML = `<div class="day-title">${dayPlan.title}</div>`;

        const activitiesContainer = document.createElement('div');
        activitiesContainer.className = 'activities-list';

        dayPlan.activities.forEach((activity) => {
            const activityDiv = document.createElement('div');
            activityDiv.className = 'activity-item';
            activityDiv.innerHTML = `
                <div class="activity-time">${activity.time}</div>
                <div class="activity-title">${activity.title}</div>
                <div class="activity-desc">${activity.desc}</div>
                <div class="activity-tips">💡 ${activity.tips}</div>
            `;
            activitiesContainer.appendChild(activityDiv);
        });

        dayDiv.appendChild(activitiesContainer);
        container.appendChild(dayDiv);
    });
}

function downloadItinerary() {
    const tripInfo = document.getElementById('tripInfo').textContent;
    const activities = document.getElementById('itineraryContainer').innerText;
    const text = `LICH TRINH DU LICH CAN THO\n${tripInfo}\n\n${activities}`;

    const element = document.createElement('a');
    element.setAttribute('href', `data:text/plain;charset=utf-8,${encodeURIComponent(text)}`);
    element.setAttribute('download', 'lich-trinh-can-tho.txt');
    element.click();

    alert('Lịch trình đã được tải xuống!');
}

function shareItinerary() {
    const tripInfo = document.getElementById('tripInfo').textContent;
    const text = `Hãy xem lịch trình du lịch Cần Thơ của tôi: ${tripInfo}`;

    if (navigator.share) {
        navigator.share({
            title: 'Lịch Trình Du Lịch Cần Thơ',
            text
        });
        return;
    }

    navigator.clipboard.writeText(text);
    alert('Đã sao chép nội dung chia sẻ vào clipboard.');
}

function startOver() {
    currentStep = 1;
    Object.keys(formData).forEach((key) => delete formData[key]);
    document.getElementById('quizForm').reset();
    document.querySelectorAll('.quiz-step').forEach((step) => step.classList.remove('active'));
    toggleStep(1, true);
    document.getElementById('quizSection').style.display = 'block';
    document.getElementById('resultsSection').style.display = 'none';
    updateProgress();
    scrollToPlannerSection();
}

function scrollToPlannerSection(smooth = true) {
    scrollWithOffset(document.getElementById('quizSection'), smooth);
}

function scrollToActiveStep() {
    scrollWithOffset(document.querySelector(`.quiz-step[data-step="${currentStep}"]`), true);
}

function scrollToResultsSection() {
    scrollWithOffset(document.getElementById('resultsSection'), true);
}

function scrollWithOffset(element, smooth) {
    if (!element) return;

    const top = element.getBoundingClientRect().top + window.scrollY - headerOffset;
    window.scrollTo({
        top,
        behavior: smooth ? 'smooth' : 'auto'
    });
}

function autoScrollOnEntry() {
    const shouldScrollByHash = window.location.hash === '#quizSection';
    const shouldScrollByQuery = new URLSearchParams(window.location.search).get('start') === 'quiz';

    if (shouldScrollByHash || shouldScrollByQuery) {
        scrollToPlannerSection(false);
    }
}

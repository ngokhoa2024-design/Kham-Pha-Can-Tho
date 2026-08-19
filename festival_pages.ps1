function New-FestivalPage {
    param(
        [string]$Path,
        [string]$Slug,
        [string]$Title,
        [string]$Meta,
        [string]$Eyebrow,
        [string]$Lead,
        [string]$HeroImage,
        [string]$MainImage,
        [string]$PrimaryColor,
        [string]$PrimaryGlow,
        [string]$Icon,
        [int]$CommentId,
        [string[]]$Stats,
        [string[]]$Intro,
        [string[]]$Features,
        [string]$SectionLead,
        [string[]]$Highlights,
        [string]$TimelineLead,
        [string[]]$Timeline,
        [string[]]$Checklist,
        [string[]]$TipsA,
        [string[]]$TipsB,
        [string]$BadgeTitle,
        [string]$BadgeText
    )

    $content = @"
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="$Meta">
    <title>$Title</title>
    <link rel="stylesheet" href="styleCNCR.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
    <style>
        .$Slug-page .sub-header {
            background:
                linear-gradient(135deg, rgba(21, 34, 61, 0.64), rgba($PrimaryGlow, 0.54)),
                url("$HeroImage") center/cover;
        }

        .$Slug-page .hero-btn.primary {
            color: $PrimaryColor;
            background: linear-gradient(135deg, #ffe8be, #ffc26d);
            box-shadow: 0 18px 30px rgba($PrimaryGlow, 0.22);
        }

        .$Slug-page .feature-pill i,
        .$Slug-page .highlight-item i,
        .$Slug-page .quick-plan li i,
        .$Slug-page .travel-tips li i,
        .$Slug-page .timeline-time {
            color: $PrimaryColor;
        }

        .$Slug-page .feature-pill i,
        .$Slug-page .highlight-item i {
            background: rgba($PrimaryGlow, 0.12);
        }
    </style>
</head>
<body class="cncr-page $Slug-page">
<header class="header">
    <div class="container">
        <div class="logo-area">
            <a href="trangchuchinh.html"><img src="images/logo Cần Thơ.png" alt="Logo du lịch Cần Thơ"></a>
            <h1 class="site-title">Khám Phá Cần Thơ</h1>
        </div>
        <nav class="navbar" aria-label="Điều hướng chính">
            <ul>
                <li><a href="trangchuchinh.html"><i class="fa-solid fa-house"></i> Trang Chủ</a></li>
                <li><a href="dulichtest.html"><i class="fa-solid fa-map-location-dot"></i> Du Lịch</a></li>
                <li><a href="doan.html"><i class="fa-solid fa-utensils"></i> Ẩm Thực</a></li>
                <li><a href="vanhoa.html" class="active"><i class="fa-solid fa-landmark"></i> Văn Hóa</a></li>
                <li><a href="contact.html"><i class="fa-solid fa-headset"></i> Hỗ Trợ</a></li>
                <li class="dropdown">
                    <a href="forum.html"><i class="fa-solid fa-ellipsis"></i> Khác</a>
                    <ul class="dropdown-menu">
                        <li><a href="forum.html"><i class="fa-solid fa-comments"></i> Diễn Đàn</a></li>
                        <li><a href="nhatkidulich.html"><i class="fa-solid fa-book-open"></i> Nhật Kí Du Lịch</a></li>
                    </ul>
                </li>
                <li><a href="timkiem.html" class="search-link" aria-label="Tìm kiếm"><i class="fa-solid fa-magnifying-glass"></i></a></li>
                <li><a href="account.html" class="account-link" aria-label="Tài khoản"><i class="fa-solid fa-user"></i></a></li>
            </ul>
        </nav>
    </div>
</header>

<header class="sub-header">
    <div class="hero-shell">
        <div class="hero-copy">
            <div class="eyebrow"><i class="$Icon"></i> $Eyebrow</div>
            <h1>$Title</h1>
            <p class="hero-lead">$Lead</p>
            <div class="hero-actions">
                <a class="hero-btn primary" href="#hanh-trinh"><i class="fa-solid fa-route"></i> Xem nhịp trải nghiệm</a>
                <a class="hero-btn secondary" href="#danh-gia"><i class="fa-solid fa-star"></i> Đọc đánh giá du khách</a>
            </div>
        </div>
        <div class="hero-panel">
            <h2>Điểm nhanh trước khi đi</h2>
            <div class="hero-stats">
                <div class="hero-stat"><strong>$($Stats[0].Split('|')[0])</strong><span>$($Stats[0].Split('|')[1])</span></div>
                <div class="hero-stat"><strong>$($Stats[1].Split('|')[0])</strong><span>$($Stats[1].Split('|')[1])</span></div>
                <div class="hero-stat"><strong>$($Stats[2].Split('|')[0])</strong><span>$($Stats[2].Split('|')[1])</span></div>
                <div class="hero-stat"><strong>$($Stats[3].Split('|')[0])</strong><span>$($Stats[3].Split('|')[1])</span></div>
            </div>
        </div>
    </div>
</header>

<section class="tour-detail">
    <div class="intro-section">
        <div class="intro-text">
            <h2>Vài nét về $Title</h2>
            <p>$($Intro[0])</p>
            <p>$($Intro[1])</p>
        </div>
        <div class="image-placeholder">
            <img src="$MainImage" alt="$Title">
            <div class="image-badge">$BadgeTitle<span>$BadgeText</span></div>
        </div>
    </div>

    <div class="feature-band">
        <div class="feature-pill"><i class="fa-solid fa-star"></i><div><h3>$($Features[0].Split('|')[0])</h3><p>$($Features[0].Split('|')[1])</p></div></div>
        <div class="feature-pill"><i class="fa-solid fa-users"></i><div><h3>$($Features[1].Split('|')[0])</h3><p>$($Features[1].Split('|')[1])</p></div></div>
        <div class="feature-pill"><i class="fa-solid fa-camera-retro"></i><div><h3>$($Features[2].Split('|')[0])</h3><p>$($Features[2].Split('|')[1])</p></div></div>
    </div>

    <hr class="separator">

    <div class="section-block">
        <h2 class="section-heading">Điều làm $Title nổi bật</h2>
        <p class="section-copy">$SectionLead</p>
        <div class="highlights">
            <div class="highlight-item"><i class="fa-solid fa-sparkles"></i><h3>$($Highlights[0].Split('|')[0])</h3><p>$($Highlights[0].Split('|')[1])</p></div>
            <div class="highlight-item"><i class="fa-solid fa-landmark"></i><h3>$($Highlights[1].Split('|')[0])</h3><p>$($Highlights[1].Split('|')[1])</p></div>
            <div class="highlight-item"><i class="fa-solid fa-heart"></i><h3>$($Highlights[2].Split('|')[0])</h3><p>$($Highlights[2].Split('|')[1])</p></div>
        </div>
    </div>

    <div class="section-block" id="hanh-trinh">
        <h2 class="section-heading">Gợi ý một nhịp trải nghiệm</h2>
        <p class="section-copy">$TimelineLead</p>
        <div class="timeline-grid">
            <div class="timeline-card">
                <div class="timeline-item"><div class="timeline-time">Mở đầu</div><div><h3>$($Timeline[0].Split('|')[0])</h3><p>$($Timeline[0].Split('|')[1])</p></div></div>
                <div class="timeline-item"><div class="timeline-time">Tiếp nối</div><div><h3>$($Timeline[1].Split('|')[0])</h3><p>$($Timeline[1].Split('|')[1])</p></div></div>
                <div class="timeline-item"><div class="timeline-time">Điểm vui</div><div><h3>$($Timeline[2].Split('|')[0])</h3><p>$($Timeline[2].Split('|')[1])</p></div></div>
                <div class="timeline-item"><div class="timeline-time">Kết lại</div><div><h3>$($Timeline[3].Split('|')[0])</h3><p>$($Timeline[3].Split('|')[1])</p></div></div>
            </div>
            <aside class="quick-plan">
                <h3>Một chuyến đi hợp lý thường có</h3>
                <ul>
                    <li><i class="fa-solid fa-check"></i><span>$($Checklist[0])</span></li>
                    <li><i class="fa-solid fa-check"></i><span>$($Checklist[1])</span></li>
                    <li><i class="fa-solid fa-check"></i><span>$($Checklist[2])</span></li>
                    <li><i class="fa-solid fa-check"></i><span>$($Checklist[3])</span></li>
                </ul>
            </aside>
        </div>
    </div>

    <div class="travel-tips">
        <h3><i class="fa-solid fa-circle-exclamation"></i> Mẹo nhỏ trước khi ghé</h3>
        <div class="travel-tips-grid">
            <div class="tip-box">
                <strong>Cho trải nghiệm</strong>
                <ul>
                    <li><i class="fa-solid fa-clock"></i><span>$($TipsA[0])</span></li>
                    <li><i class="fa-solid fa-shirt"></i><span>$($TipsA[1])</span></li>
                    <li><i class="fa-solid fa-location-dot"></i><span>$($TipsA[2])</span></li>
                </ul>
            </div>
            <div class="tip-box">
                <strong>Cho ảnh đẹp</strong>
                <ul>
                    <li><i class="fa-solid fa-sun"></i><span>$($TipsB[0])</span></li>
                    <li><i class="fa-solid fa-camera"></i><span>$($TipsB[1])</span></li>
                    <li><i class="fa-solid fa-images"></i><span>$($TipsB[2])</span></li>
                </ul>
            </div>
        </div>
    </div>

    <div class="card comment-section" data-id="$CommentId" id="danh-gia">
        <h3><i class="fa-solid fa-star"></i> Đánh giá từ du khách</h3>
        <p>Hãy chia sẻ cảm nhận của bạn về $Title để những người ghé sau có thêm gợi ý nhé.</p>
        <div class="rating" id="rating-$CommentId"></div>
        <div class="comment-box"></div>
    </div>
</section>

<footer class="footer">
    <div class="footer-container">
        <div class="footer-col">
            <h3>Khám Phá Cần Thơ</h3>
            <p>Khám phá vẻ đẹp miền Tây sông nước, trải nghiệm văn hóa và ẩm thực đặc sắc.</p>
        </div>
        <div class="footer-col">
            <h4>Contact for work</h4>
            <p>Gmail 1: ngokhoa2024@gmail.com</p>
            <p>Gmail 2: thiennn0412@gmail.com</p>
        </div>
    </div>
    <div class="footer-bottom">© 2026 - Website Khám Phá Cần Thơ by Nhật Thiên and Nguyễn Khoa</div>
    <div class="footer-credit">
        <p>Nguồn ảnh: Shutterstock, thamhiemmekong.com, vi.wikipedia.org và một số website du lịch khác. Xin chân thành cảm ơn.</p>
    </div>
</footer>

<script src="scriptCNCR.js"></script>
</body>
</html>
"@

    Set-Content -Path $Path -Value $content -Encoding UTF8
}

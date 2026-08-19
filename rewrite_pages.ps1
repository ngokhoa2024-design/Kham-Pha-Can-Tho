function Render-Page {
    param($Page)

    $heroStatsHtml = ($Page.HeroStats | ForEach-Object {
@"
                <div class="hero-stat">
                    <strong>$($_.Title)</strong>
                    <span>$($_.Text)</span>
                </div>
"@
    }) -join "`n"

    $featuresHtml = ($Page.Features | ForEach-Object {
@"
        <div class="feature-pill">
            <i class="$($_.Icon)"></i>
            <div>
                <h3>$($_.Title)</h3>
                <p>$($_.Text)</p>
            </div>
        </div>
"@
    }) -join "`n"

    $highlightsHtml = ($Page.Highlights | ForEach-Object {
@"
            <div class="highlight-item">
                <i class="$($_.Icon)"></i>
                <h3>$($_.Title)</h3>
                <p>$($_.Text)</p>
            </div>
"@
    }) -join "`n"

    $timelineHtml = ($Page.Timeline | ForEach-Object {
@"
                <div class="timeline-item">
                    <div class="timeline-time">$($_.Time)</div>
                    <div>
                        <h3>$($_.Title)</h3>
                        <p>$($_.Text)</p>
                    </div>
                </div>
"@
    }) -join "`n"

    $quickPlanHtml = ($Page.QuickPlan | ForEach-Object { "<li><i class='fa-solid fa-check'></i><span>$_</span></li>" }) -join "`n"
    $tips1Html = ($Page.Tips1 | ForEach-Object { "<li><i class='fa-solid fa-circle'></i><span>$_</span></li>" }) -join "`n"
    $tips2Html = ($Page.Tips2 | ForEach-Object { "<li><i class='fa-solid fa-circle'></i><span>$_</span></li>" }) -join "`n"

@"
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="$($Page.Description)">
    <title>$($Page.Title)</title>
    <link rel="stylesheet" href="styleCNCR.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
    <style>
        .$($Page.BodyClass) .sub-header {
            background:
                linear-gradient(135deg, rgba(20, 20, 20, 0.15), rgba(20, 20, 20, 0.08)),
                url("$($Page.HeroBg)") center/cover;
        }

        .$($Page.BodyClass) .hero-btn.primary {
            color: $($Page.PrimaryTextColor);
            background: linear-gradient(135deg, $($Page.PrimaryBg1), $($Page.PrimaryBg2));
            box-shadow: 0 18px 30px rgba(0, 0, 0, 0.14);
        }

        .$($Page.BodyClass) .feature-pill i,
        .$($Page.BodyClass) .highlight-item i,
        .$($Page.BodyClass) .quick-plan li i,
        .$($Page.BodyClass) .travel-tips li i,
        .$($Page.BodyClass) .timeline-time {
            color: $($Page.Accent);
        }

        .$($Page.BodyClass) .feature-pill i,
        .$($Page.BodyClass) .highlight-item i {
            background: $($Page.AccentBg);
        }
    </style>
</head>
<body class="cncr-page $($Page.BodyClass)">
<header class="header">
    <div class="container">
        <div class="logo-area">
            <a href="trangchuchinh.html">
                <img src="images/logo Cần Thơ.png" alt="Logo du lịch Cần Thơ">
            </a>
            <h1 class="site-title">Khám Phá Cần Thơ</h1>
        </div>
        <nav class="navbar" aria-label="Điều hướng chính">
            <ul>
                <li><a href="trangchuchinh.html"><i class="fa-solid fa-house"></i> Trang Chủ</a></li>
                <li><a href="dulichtest.html" class="active"><i class="fa-solid fa-map-location-dot"></i> Du Lịch</a></li>
                <li><a href="doan.html"><i class="fa-solid fa-utensils"></i> Ẩm Thực</a></li>
                <li><a href="vanhoa.html"><i class="fa-solid fa-landmark"></i> Văn Hóa</a></li>
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
            <div class="eyebrow"><i class="$($Page.HeroIcon)"></i> $($Page.HeroEyebrow)</div>
            <h1>$($Page.Title)</h1>
            <p class="hero-lead">$($Page.HeroLead)</p>
            <div class="hero-actions">
                <a class="hero-btn primary" href="#hanh-trinh"><i class="fa-solid fa-route"></i> Xem gợi ý tham quan</a>
                <a class="hero-btn secondary" href="#danh-gia"><i class="fa-solid fa-star"></i> Đọc đánh giá du khách</a>
            </div>
        </div>
        <div class="hero-panel">
            <h2>Điểm nhanh trước khi ghé</h2>
            <div class="hero-stats">
$heroStatsHtml
            </div>
        </div>
    </div>
</header>
<section class="tour-detail">
    <div class="intro-section">
        <div class="intro-text">
            <h2>$($Page.MainHeading)</h2>
            <p>$($Page.Intro1)</p>
            <p>$($Page.Intro2)</p>
        </div>
        <div class="image-placeholder">
            <img src="$($Page.MainImage)" alt="$($Page.MainAlt)">
            <div class="image-badge">$($Page.BadgeTitle)<span>$($Page.BadgeText)</span></div>
        </div>
    </div>
    <div class="feature-band">
$featuresHtml
    </div>
    <hr class="separator">
    <div class="section-block">
        <h2 class="section-heading">$($Page.SectionTitle)</h2>
        <p class="section-copy">$($Page.SectionCopy)</p>
        <div class="highlights">
$highlightsHtml
        </div>
    </div>
    <div class="section-block" id="hanh-trinh">
        <h2 class="section-heading">$($Page.TimelineTitle)</h2>
        <p class="section-copy">$($Page.TimelineCopy)</p>
        <div class="timeline-grid">
            <div class="timeline-card">
$timelineHtml
            </div>
            <aside class="quick-plan">
                <h3>$($Page.QuickPlanTitle)</h3>
                <ul>
$quickPlanHtml
                </ul>
            </aside>
        </div>
    </div>
    <div class="travel-tips">
        <h3><i class="fa-solid fa-circle-exclamation"></i> Lưu ý nhỏ</h3>
        <div class="travel-tips-grid">
            <div class="tip-box"><strong>$($Page.TipsTitle1)</strong><ul>
$tips1Html
            </ul></div>
            <div class="tip-box"><strong>$($Page.TipsTitle2)</strong><ul>
$tips2Html
            </ul></div>
        </div>
    </div>
    <div class="card comment-section" data-id="$($Page.CommentId)" id="danh-gia">
        <h3><i class="fa-solid fa-star"></i> Đánh giá từ du khách</h3>
        <p>Hãy chia sẻ cảm nhận của bạn về $($Page.Title) để những người ghé sau có thêm gợi ý nhé.</p>
        <div class="rating" id="rating-$($Page.CommentId)"></div>
        <div class="comment-box"></div>
    </div>
</section>
<footer class="footer">
    <div class="footer-container">
        <div class="footer-col"><h3>Khám Phá Cần Thơ</h3><p>Khám phá vẻ đẹp miền Tây sông nước, trải nghiệm văn hóa và ẩm thực đặc sắc.</p></div>
        <div class="footer-col"><h4>Contact for work</h4><p>Gmail 1: ngokhoa2024@gmail.com</p><p>Gmail 2: thiennn0412@gmail.com</p></div>
    </div>
    <div class="footer-bottom">© 2026 - Website Khám Phá Cần Thơ by Nhật Thiên and Nguyễn Khoa</div>
    <div class="footer-credit"><p>Nguồn ảnh: Shutterstock, thamhiemmekong.com, vi.wikipedia.org và một số website du lịch khác. Xin chân thành cảm ơn.</p></div>
</footer>
<script src="scriptCNCR.js"></script>
</body>
</html>
"@
}
$pages = @(
    @{
        File='dentho.html'; BodyClass='dentho-page'; Title='Đền Thờ Vua Hùng'; Description='Khám phá Đền Thờ Vua Hùng Cần Thơ - công trình trang nghiêm với kiến trúc ấn tượng và không gian rộng lớn giàu ý nghĩa.'; HeroIcon='fa-solid fa-monument'; HeroEyebrow='Không gian trang nghiêm và giàu ý nghĩa'; HeroLead='Một công trình nổi bật về quy mô, hình khối và cảm giác trang trọng. Đây là điểm đến rất hợp cho những ai thích không gian rộng, kiến trúc rõ nét và những nơi mang giá trị biểu tượng văn hóa.'; HeroBg='images/den tho đẹp.jpg'; PrimaryTextColor='#5f3c12'; PrimaryBg1='#ffe3ab'; PrimaryBg2='#f5c25a'; Accent='#9b5e1d'; AccentBg='rgba(155, 94, 29, 0.12)'; MainHeading='Vài nét về Đền Thờ Vua Hùng'; Intro1='Đây là một trong những công trình dễ tạo ấn tượng mạnh ở Cần Thơ nhờ quy mô rõ rệt và kiến trúc bề thế. Cảm giác đầu tiên thường là sự rộng rãi, trang nghiêm và rất chỉn chu trong tổng thể.'; Intro2='Khác với nhiều điểm tham quan thiên về sự gần gũi, nơi đây gây ấn tượng bằng độ mở của không gian và tính biểu tượng. Càng đứng từ xa ngắm, người xem càng cảm nhận rõ vẻ vững chãi của công trình.'; MainImage='images/den tho đẹp.jpg'; MainAlt='Đền Thờ Vua Hùng'; BadgeTitle='Góc nên thử'; BadgeText='Chụp toàn cảnh thường là cách thấy rõ nhất quy mô và hình khối của công trình'; HeroStats=@(@{Title='Kiến trúc ấn tượng';Text='Khối công trình lớn và rõ nét tạo cảm giác bề thế ngay từ cái nhìn đầu tiên'},@{Title='Không gian rộng';Text='Phù hợp để đi dạo, ngắm toàn cảnh và chụp ảnh kiến trúc'},@{Title='Giá trị biểu tượng';Text='Là một điểm nhấn văn hóa rất riêng trong bản đồ tham quan Cần Thơ'},@{Title='Hợp ảnh toàn cảnh';Text='Chụp từ khoảng cách đủ rộng sẽ thấy công trình nổi bật hơn nhiều'}); Features=@(@{Icon='fa-solid fa-landmark';Title='Quy mô rõ rệt';Text='Đây là kiểu công trình thu hút người xem bằng tổng thể trước khi đi vào chi tiết.'},@{Icon='fa-solid fa-shield-halved';Title='Cảm giác trang nghiêm';Text='Không gian mở và sự chỉn chu tạo nên một bầu không khí rất riêng.'},@{Icon='fa-solid fa-camera';Title='Rất hợp chụp ảnh toàn cảnh';Text='Các góc rộng luôn là điểm mạnh khi ghi lại địa điểm này.'}); SectionTitle='Điều làm công trình này nổi bật'; SectionCopy='Sức hút của đền đến từ sự kết hợp giữa tính biểu tượng, kiến trúc và không gian mở, tạo nên một cảm giác khác hẳn nhiều điểm tham quan còn lại.'; Highlights=@(@{Icon='fa-solid fa-crown';Title='Tính biểu tượng cao';Text='Nơi đây gợi cảm giác trân trọng và nhấn mạnh rõ ý nghĩa lịch sử, văn hóa.'},@{Icon='fa-solid fa-expand';Title='Không gian mở và rộng';Text='Đi bộ trong khuôn viên giúp trải nghiệm trở nên thong thả và dễ chịu hơn.'},@{Icon='fa-solid fa-grid-2';Title='Bố cục kiến trúc mạnh';Text='Khối công trình và cảnh quan xung quanh luôn tạo ra những khung nhìn rõ nét.'}); TimelineTitle='Gợi ý tham quan ngắn'; TimelineCopy='Bạn có thể đi theo một nhịp đơn giản để vừa ngắm cảnh, vừa cảm nhận rõ vẻ bề thế của nơi này.'; Timeline=@(@{Time='Bắt đầu';Title='Ngắm toàn cảnh từ xa';Text='Nên đứng đủ xa để cảm nhận rõ nhất hình khối và bố cục tổng thể của công trình.'},@{Time='Tiếp theo';Title='Đi dạo quanh khuôn viên';Text='Không gian rộng là một phần quan trọng của trải nghiệm nên rất đáng dành thời gian.'},@{Time='Sau đó';Title='Chụp góc toàn cảnh và góc chi tiết';Text='Kết hợp cả hai kiểu ảnh sẽ giúp giữ lại trải nghiệm trọn vẹn hơn.'},@{Time='Kết thúc';Title='Nghỉ một chút trước khi đi tiếp';Text='Đây là kiểu điểm tham quan hợp với nhịp đi chậm và có khoảng dừng ngắm cảnh.'}); QuickPlanTitle='Một chuyến đi hợp lý thường có'; QuickPlan=@('Thời gian đủ để đi bộ quanh khuôn viên.','Điện thoại hoặc máy ảnh để chụp góc rộng.','Thời điểm thời tiết dịu để trải nghiệm thoải mái hơn.','Tâm thế thong thả để cảm nhận không gian đúng hơn.'); TipsTitle1='Cho trải nghiệm'; Tips1=@('Nên tránh giờ nắng gắt nếu bạn muốn đi bộ nhiều trong khuôn viên.','Trang phục gọn gàng sẽ giúp di chuyển và chụp ảnh dễ hơn.','Nếu đi ban ngày, nên chuẩn bị nước vì không gian khá rộng.'); TipsTitle2='Cho ảnh đẹp'; Tips2=@('Góc chụp rộng luôn phát huy hiệu quả nhất ở địa điểm này.','Ánh sáng đầu buổi hoặc chiều muộn sẽ cho màu cảnh mềm hơn.','Hãy chụp cả một tấm toàn cảnh và một tấm tập trung vào chi tiết kiến trúc.'); CommentId=9
    },
    @{
        File='mykhanh.html'; BodyClass='mykhanh-page'; Title='Làng Du Lịch Mỹ Khánh'; Description='Khám phá Làng Du Lịch Mỹ Khánh - điểm du lịch sinh thái nổi tiếng của Cần Thơ với không gian xanh và nhiều trải nghiệm vui chơi đa dạng.'; HeroIcon='fa-solid fa-tree'; HeroEyebrow='Một trong những điểm sinh thái nổi bật nhất Cần Thơ'; HeroLead='Không gian xanh rộng, nhiều hoạt động vui chơi và cảm giác miệt vườn rõ nét giúp Mỹ Khánh trở thành điểm đến hợp cho cả gia đình lẫn nhóm bạn khi muốn có một ngày đi chơi thật trọn.'; HeroBg='images/my khánh đẹp.jpg'; PrimaryTextColor='#1f5a2a'; PrimaryBg1='#dff5c8'; PrimaryBg2='#95df7f'; Accent='#2f7d3d'; AccentBg='rgba(47, 125, 61, 0.12)'; MainHeading='Vài nét về Mỹ Khánh'; Intro1='Mỹ Khánh là một điểm đến tiêu biểu khi nhắc đến du lịch sinh thái Cần Thơ. Nơi đây có đủ sự xanh mát, thoáng đãng và những trải nghiệm gần gũi với đời sống miền Tây để tạo nên một ngày đi chơi khá trọn vẹn.'; Intro2='Điều hay của Mỹ Khánh là không chỉ có cảnh mà còn có nhịp. Bạn có thể vừa đi dạo, vừa tham gia hoạt động, vừa thưởng thức món ăn và giữ cho hành trình luôn có sự thay đổi thú vị.'; MainImage='images/my khánh đẹp.jpg'; MainAlt='Làng Du Lịch Mỹ Khánh'; BadgeTitle='Điểm nổi bật'; BadgeText='Không gian xanh và các hoạt động trải nghiệm là phần thu hút nhất của nơi này'; HeroStats=@(@{Title='Không gian xanh rộng';Text='Phù hợp cho một ngày đi chơi theo kiểu thư thả và nhiều trải nghiệm'},@{Title='Nhiều hoạt động';Text='Từ đi dạo, chụp ảnh đến vui chơi và thưởng thức đặc sản'},@{Title='Rất hợp gia đình';Text='Không gian mở giúp trẻ em và người lớn đều dễ tận hưởng'},@{Title='Đậm chất miền Tây';Text='Cảnh quan và nhịp điệu nơi đây tạo cảm giác miệt vườn rõ rệt'}); Features=@(@{Icon='fa-solid fa-seedling';Title='Không gian rất thoáng';Text='Rất phù hợp để tránh nhịp đô thị và dành thời gian thư giãn.'},@{Icon='fa-solid fa-person-running';Title='Hoạt động đa dạng';Text='Đây là điểm đến không dễ gây chán vì luôn có nhiều lựa chọn trải nghiệm.'},@{Icon='fa-solid fa-people-group';Title='Đi nhóm hay gia đình đều hợp';Text='Nhiều khoảng không và nhiều nhịp trải nghiệm giúp nơi này khá dễ đi.'}); SectionTitle='Điều làm Mỹ Khánh được yêu thích'; SectionCopy='Sự hấp dẫn của nơi này đến từ việc cân bằng được giữa cảnh quan, hoạt động và cảm giác gần gũi. Không quá tĩnh cũng không quá ồn, đủ để một ngày đi chơi trở nên nhẹ mà vẫn vui.'; Highlights=@(@{Icon='fa-solid fa-leaf';Title='Cảnh quan dễ chịu';Text='Không gian xanh là thứ giúp nơi này luôn tạo cảm giác thư thái ngay từ đầu.'},@{Icon='fa-solid fa-basket-shopping';Title='Dễ kết hợp ăn uống';Text='Một chuyến đi ở đây có thể vừa chơi vừa thưởng thức hương vị miền Tây.'},@{Icon='fa-solid fa-camera-retro';Title='Ảnh rất có sức sống';Text='Cây xanh, đường dạo và khung cảnh miệt vườn luôn tạo ảnh du lịch khá đẹp.'}); TimelineTitle='Gợi ý một ngày đi Mỹ Khánh'; TimelineCopy='Nếu muốn đi trọn mà không bị vội, bạn có thể chia thời gian theo nhịp dưới đây.'; Timeline=@(@{Time='Buổi sáng';Title='Đến sớm để tận hưởng không khí mát';Text='Sáng là lúc cảnh quan dễ chịu và phù hợp để bắt đầu hành trình nhẹ nhàng nhất.'},@{Time='Giữa buổi';Title='Đi dạo và tham gia hoạt động';Text='Đây là lúc bạn có thể khám phá những trải nghiệm đặc trưng của khu du lịch.'},@{Time='Buổi trưa';Title='Nghỉ và ăn uống';Text='Khoảng dừng giữa ngày giúp chuyến đi không bị mệt và vẫn giữ được năng lượng.'},@{Time='Buổi chiều';Title='Chụp ảnh và kết thúc thong thả';Text='Khi ánh sáng dịu hơn, khuôn viên xanh rất hợp để lưu lại những tấm hình đẹp.'}); QuickPlanTitle='Một chuyến đi trọn vẹn thường có'; QuickPlan=@('Trang phục thoải mái để đi bộ và tham gia hoạt động.','Thời gian đủ rộng để không phải chạy lịch.','Mũ, nước uống và điện thoại đủ pin.','Đi nhóm sẽ vui hơn vì có nhiều trải nghiệm để cùng tham gia.'); TipsTitle1='Cho trải nghiệm'; Tips1=@('Ưu tiên đi từ sáng hoặc chiều để tránh nắng gắt giữa ngày.','Nên mang nước vì bạn có thể di chuyển khá nhiều trong khuôn viên.','Đi cùng bạn bè hoặc gia đình thường vui hơn rất nhiều.'); TipsTitle2='Cho ảnh đẹp'; Tips2=@('Hãy tận dụng các lối đi xanh và khoảng trống rộng để tạo chiều sâu ảnh.','Ánh sáng sáng sớm và chiều muộn luôn cho ảnh mềm hơn.','Ảnh có người trong khung hình thường tạo cảm giác sống động hơn ở nơi này.'); CommentId=10
    },
    @{
        File='ongde.html'; BodyClass='ongde-page'; Title='Khu Du Lịch Sinh Thái Ông Đề'; Description='Khám phá Khu Du Lịch Sinh Thái Ông Đề - điểm đến vui chơi ngoài trời mang đậm chất miền Tây với nhiều hoạt động trải nghiệm.'; HeroIcon='fa-solid fa-tree'; HeroEyebrow='Điểm sinh thái vui nhộn và gần gũi'; HeroLead='Một điểm đến phù hợp cho những ai thích hoạt động ngoài trời, không gian xanh và cảm giác vui chơi mang đậm chất miền Tây. Ông Đề thường được yêu thích bởi sự năng động nhưng vẫn giữ được vẻ mộc mạc dễ gần.'; HeroBg='images/ông đề đẹp.webp'; PrimaryTextColor='#2a6127'; PrimaryBg1='#dff7b9'; PrimaryBg2='#9ddc73'; Accent='#3c8a37'; AccentBg='rgba(60, 138, 55, 0.12)'; MainHeading='Vài nét về Ông Đề'; Intro1='Ông Đề là kiểu điểm đến sinh thái có nhịp vui rất rõ. Không gian cây xanh, mặt nước và các hoạt động trải nghiệm giúp nơi này rất phù hợp cho một ngày đi chơi cần nhiều tiếng cười và cảm giác thoải mái.'; Intro2='Thay vì chỉ ngắm cảnh đơn thuần, nơi đây hấp dẫn ở việc người tham quan thực sự được nhập vào không gian, được di chuyển, thử hoạt động và tận hưởng nhịp vui mang màu sắc miền Tây.'; MainImage='images/ông đề đẹp.webp'; MainAlt='Khu Du Lịch Sinh Thái Ông Đề'; BadgeTitle='Điểm nổi bật'; BadgeText='Không khí vui vẻ và những hoạt động ngoài trời là sức hút lớn nhất'; HeroStats=@(@{Title='Không gian ngoài trời';Text='Rất hợp cho nhóm bạn hoặc gia đình thích vận động và thư giãn'},@{Title='Đậm chất miền Tây';Text='Cảnh quan và cách tổ chức trải nghiệm giữ được cảm giác mộc mạc'},@{Title='Nhiều hoạt động vui';Text='Không dễ bị nhàm chán trong suốt buổi tham quan'},@{Title='Dễ chụp ảnh trải nghiệm';Text='Ảnh có người tham gia hoạt động thường lên rất sống'}); Features=@(@{Icon='fa-solid fa-face-smile';Title='Không khí rất vui';Text='Điểm đến này phù hợp với những ngày muốn xả stress và đi chơi năng động.'},@{Icon='fa-solid fa-seedling';Title='Gần gũi thiên nhiên';Text='Cây xanh và không gian mở giúp trải nghiệm vẫn giữ được sự thoáng đãng.'},@{Icon='fa-solid fa-camera-retro';Title='Ảnh trải nghiệm đẹp';Text='Những khoảnh khắc đang chơi, đang cười thường là phần ảnh hấp dẫn nhất.'}); SectionTitle='Điều làm Ông Đề hấp dẫn'; SectionCopy='Điểm mạnh của nơi này nằm ở cảm giác đi để trải nghiệm, không quá tĩnh cũng không quá ngắm cảnh đơn thuần. Chính sự tương tác ấy làm chuyến đi dễ vui hơn.'; Highlights=@(@{Icon='fa-solid fa-bolt';Title='Nhịp điệu sôi động';Text='Thích hợp cho những ai muốn một điểm đến có nhiều năng lượng hơn.'},@{Icon='fa-solid fa-users';Title='Rất hợp đi theo nhóm';Text='Nhiều hoạt động chỉ thực sự vui khi đi cùng bạn bè hoặc gia đình.'},@{Icon='fa-solid fa-location-dot';Title='Màu sắc địa phương rõ nét';Text='Dù vui chơi nhiều, nơi đây vẫn giữ được cảm giác rất miền Tây.'}); TimelineTitle='Gợi ý một buổi đi Ông Đề'; TimelineCopy='Bạn có thể chia thời gian theo nhịp đơn giản để vừa chơi, vừa nghỉ hợp lý hơn.'; Timeline=@(@{Time='Đầu buổi';Title='Đến sớm để tranh thủ thời tiết mát';Text='Buổi đầu ngày thường dễ chịu hơn cho các hoạt động ngoài trời.'},@{Time='Giữa buổi';Title='Tham gia các hoạt động nổi bật';Text='Đây là lúc không khí vui nhất và cũng là phần đáng nhớ nhất của chuyến đi.'},@{Time='Sau đó';Title='Nghỉ và chụp ảnh';Text='Nên dành một khoảng dừng để không bị đuối nhịp và vẫn có ảnh đẹp lưu lại.'},@{Time='Cuối buổi';Title='Kết hợp ăn uống nhẹ';Text='Một bữa ăn hoặc món nước sau khi vui chơi sẽ giúp chuyến đi trọn vẹn hơn.'}); QuickPlanTitle='Một chuyến đi vui hơn thường có'; QuickPlan=@('Đi theo nhóm để tương tác tốt hơn.','Trang phục thoải mái cho hoạt động ngoài trời.','Pin điện thoại đủ để chụp nhiều khoảnh khắc.','Thời gian rộng để không phải gấp gáp.'); TipsTitle1='Cho trải nghiệm'; Tips1=@('Nên mặc đồ thoải mái vì bạn sẽ di chuyển khá nhiều.','Ưu tiên đi lúc thời tiết dịu để đỡ mệt hơn.','Đi đông người sẽ vui và đúng tinh thần nơi này hơn.'); TipsTitle2='Cho ảnh đẹp'; Tips2=@('Hãy chụp lúc đang tham gia hoạt động thay vì chỉ đứng tạo dáng.','Các góc có cây xanh và nước thường tạo ảnh sinh thái đẹp hơn.','Ảnh có cảm xúc thật sẽ rất hợp với điểm đến này.'); CommentId=11
    }
)

foreach ($page in $pages) {
    $html = Render-Page $page
    Set-Content -Path (Join-Path 'd:\html' $page.File) -Value $html -Encoding UTF8
}
$pages2 = @(
    @{
        File='9hong.html'; BodyClass='hong-page'; Title='Vườn Trái Cây 9 Hồng'; Description='Khám phá Vườn Trái Cây 9 Hồng - điểm miệt vườn xanh mát ở Cần Thơ với trải nghiệm gần gũi thiên nhiên và nhịp đi chậm dễ chịu.'; HeroIcon='fa-solid fa-apple-whole'; HeroEyebrow='Miệt vườn xanh mát và gần gũi'; HeroLead='Một điểm đến rất hợp cho những ai muốn chạm gần hơn vào nhịp sống miệt vườn. 9 Hồng mang cảm giác tự nhiên, nhẹ nhàng và đủ giản dị để người ta thấy mình thật sự đang rời khỏi nhịp thành phố.'; HeroBg='images/vuon9hong đẹp.jfif'; PrimaryTextColor='#2e6b2b'; PrimaryBg1='#e4f8c8'; PrimaryBg2='#9fe07b'; Accent='#3b8d3f'; AccentBg='rgba(59, 141, 63, 0.12)'; MainHeading='Vài nét về Vườn 9 Hồng'; Intro1='Vườn 9 Hồng đem lại đúng cảm giác mà nhiều người tìm kiếm khi đến miền Tây: cây trái, đường đi yên, không khí thoáng và nhịp chậm đủ để thư giãn. Đây là kiểu địa điểm càng đi chậm càng thấy dễ chịu.'; Intro2='Không cần quá nhiều điểm nhấn lớn, nơi đây thu hút bằng sự gần gũi. Chỉ cần bước vào không gian xanh và nghe âm thanh nhẹ của vườn, người xem đã thấy hành trình như dịu lại đáng kể.'; MainImage='images/vuon9hong đẹp.jfif'; MainAlt='Vườn Trái Cây 9 Hồng'; BadgeTitle='Điểm nổi bật'; BadgeText='Không gian xanh và cảm giác miệt vườn chân thật là điều đáng nhớ nhất'; HeroStats=@(@{Title='Không gian miệt vườn';Text='Cảm giác gần thiên nhiên là thứ làm nơi này được yêu thích'},@{Title='Đi chậm rất hợp';Text='Không cần quá nhiều hoạt động, chỉ dạo và ngắm cũng đã thấy dễ chịu'},@{Title='Hợp ảnh xanh mát';Text='Cây trái và các lối đi tạo cảm giác nhẹ nhàng trong từng khung hình'},@{Title='Rất hợp người thích yên tĩnh';Text='Địa điểm này thiên về thư giãn hơn là sôi động'}); Features=@(@{Icon='fa-solid fa-leaf';Title='Không khí rất mát';Text='Một địa điểm thích hợp để nghỉ nhịp và hít thở nhiều hơn.'},@{Icon='fa-solid fa-tree';Title='Miệt vườn rõ nét';Text='Nơi đây giữ được cảm giác gần thiên nhiên rất dễ chịu.'},@{Icon='fa-solid fa-camera';Title='Ảnh xanh và mềm';Text='Khung cảnh phù hợp với kiểu ảnh nhẹ nhàng, trong trẻo và gần gũi.'}); SectionTitle='Điều làm nơi này dễ được yêu thích'; SectionCopy='Điểm mạnh của 9 Hồng không nằm ở sự hoành tráng, mà ở cảm giác thật và dễ chịu mà nó đem lại cho người ghé thăm.'; Highlights=@(@{Icon='fa-solid fa-heart';Title='Cảm giác rất gần gũi';Text='Mọi thứ ở đây đều nhẹ và đủ để người xem thấy mình đang chạm vào miền Tây thực sự.'},@{Icon='fa-solid fa-spa';Title='Thư giãn đúng nghĩa';Text='Rất hợp cho những ai muốn rời xa nhịp gấp của thành phố trong vài giờ.'},@{Icon='fa-solid fa-image';Title='Rất hợp chụp ảnh tự nhiên';Text='Những tấm ảnh ở đây thường đẹp nhờ cảm giác chân thật hơn là dàn dựng.'}); TimelineTitle='Gợi ý tham quan ngắn'; TimelineCopy='Một lịch trình đơn giản sẽ giúp bạn cảm nhận rõ nhất vẻ dễ chịu của nơi này.'; Timeline=@(@{Time='Bắt đầu';Title='Đi dạo quanh vườn';Text='Hãy dành thời gian quan sát cây trái và nhịp sống tự nhiên của không gian.'},@{Time='Tiếp theo';Title='Dừng lại ở những góc mát';Text='Khoảng nghỉ ngắn giữa vườn thường là phần khiến trải nghiệm đáng nhớ hơn.'},@{Time='Sau đó';Title='Chụp ảnh cùng cảnh xanh';Text='Nên để người và cảnh cùng hiện diện để ảnh có cảm giác sinh động.'},@{Time='Kết thúc';Title='Tiếp tục hành trình sinh thái';Text='Nơi này rất hợp để nối sang một điểm sinh thái khác trong cùng ngày.'}); QuickPlanTitle='Một chuyến đi nhẹ thường có'; QuickPlan=@('Tâm thế đi chậm và không chạy lịch.','Trang phục thoải mái và dễ di chuyển.','Điện thoại đủ pin để chụp ảnh xanh.','Thời điểm mát để trải nghiệm dễ chịu hơn.'); TipsTitle1='Cho trải nghiệm'; Tips1=@('Nên đi lúc mát để cảm nhận không gian rõ hơn.','Giày dép thoải mái sẽ phù hợp hơn với kiểu tham quan này.','Nếu đi giữa ngày, nên chuẩn bị nước uống.'); TipsTitle2='Cho ảnh đẹp'; Tips2=@('Ảnh tự nhiên khi đang đi dạo sẽ rất hợp với không khí nơi này.','Ánh sáng mềm luôn giúp màu cây xanh nhìn trong hơn.','Đừng ngại để nhiều cảnh xanh trong khung hình để giữ đúng tinh thần miệt vườn.'); CommentId=12
    },
    @{
        File='lcc.html'; BodyClass='lcc-page'; Title='Khu Du Lịch Sinh Thái Lung Cột Cầu'; Description='Khám phá Khu Du Lịch Sinh Thái Lung Cột Cầu - không gian sinh thái xanh, thoáng và gần gũi với thiên nhiên miền Tây.'; HeroIcon='fa-solid fa-water'; HeroEyebrow='Sinh thái xanh và yên giữa miền Tây'; HeroLead='Một điểm đến dành cho những ai thích không gian mát, thoáng và giàu cảm giác thiên nhiên. Lung Cột Cầu mang lại trải nghiệm nhẹ nhàng, phù hợp để đi chậm, ngắm cảnh và tạm rời nhịp thành phố trong một buổi.'; HeroBg='images/lungcot cau đẹp.jfif'; PrimaryTextColor='#1e5d49'; PrimaryBg1='#daf6e8'; PrimaryBg2='#8ee2bf'; Accent='#277c63'; AccentBg='rgba(39, 124, 99, 0.12)'; MainHeading='Vài nét về Lung Cột Cầu'; Intro1='Lung Cột Cầu là một điểm sinh thái mang cảm giác dịu và khá dễ chịu. Không gian thiên nhiên ở đây không quá phô trương mà đủ để người ghé cảm thấy được thả lỏng và tách khỏi nhịp nhanh thường ngày.'; Intro2='Những ai thích các chuyến đi xanh, chụp ảnh cảnh và tìm nơi nghỉ nhịp nhẹ nhàng thường sẽ thấy rất hợp với kiểu không gian mà Lung Cột Cầu mang lại.'; MainImage='images/lungcot cau đẹp.jfif'; MainAlt='Khu Du Lịch Sinh Thái Lung Cột Cầu'; BadgeTitle='Điểm nổi bật'; BadgeText='Cảnh quan gần nước và mảng xanh là phần tạo cảm giác đặc trưng nhất'; HeroStats=@(@{Title='Không gian xanh mát';Text='Đây là kiểu địa điểm lý tưởng cho một nhịp đi nhẹ và thư giãn'},@{Title='Cảnh quan tự nhiên';Text='Rất hợp với những ai thích cảm giác gần nước và gần cây cối'},@{Title='Đi chụp ảnh sinh thái';Text='Cảnh vật ở đây phù hợp với các khung hình mềm và tự nhiên'},@{Title='Hợp cho ngày nghỉ ngắn';Text='Không cần lịch quá dày vẫn có thể tận hưởng trọn vẹn'}); Features=@(@{Icon='fa-solid fa-wind';Title='Không khí rất dễ chịu';Text='Nơi đây tạo cảm giác đúng kiểu đi để thở và thư giãn nhiều hơn.'},@{Icon='fa-solid fa-tree';Title='Đậm tính sinh thái';Text='Thiên nhiên là yếu tố chính giúp trải nghiệm trở nên khác biệt.'},@{Icon='fa-solid fa-image';Title='Ảnh mang cảm giác yên';Text='Những khung cảnh xanh và thoáng rất hợp cho kiểu ảnh nhẹ nhàng.'}); SectionTitle='Điều làm nơi này đáng ghé'; SectionCopy='Sức hút ở đây không đến từ sự náo nhiệt mà đến từ cảm giác thoáng, xanh và đủ yên để người xem thực sự nghỉ được nhịp.'; Highlights=@(@{Icon='fa-solid fa-leaf';Title='Thư giãn tự nhiên';Text='Không cần quá nhiều hoạt động, chỉ ở trong không gian ấy cũng đã đủ dễ chịu.'},@{Icon='fa-solid fa-water';Title='Gần gũi cảnh quan miền Tây';Text='Yếu tố nước và cây xanh tạo nên cảm giác rất đặc trưng của vùng đất này.'},@{Icon='fa-solid fa-camera';Title='Rất hợp ảnh xanh';Text='Khung hình tại đây thường đẹp nhờ chiều sâu và sắc xanh dịu mắt.'}); TimelineTitle='Gợi ý tham quan ngắn'; TimelineCopy='Một buổi đi thong thả sẽ là nhịp phù hợp nhất khi ghé Lung Cột Cầu.'; Timeline=@(@{Time='Đầu buổi';Title='Đi dạo để làm quen không gian';Text='Bắt đầu bằng một vòng ngắn để cảm nhận sự thoáng và nhịp yên của cảnh quan.'},@{Time='Giữa buổi';Title='Tìm các góc đẹp để chụp ảnh';Text='Những nơi có cây, nước và lối đi thường cho cảm giác sinh thái rõ nhất.'},@{Time='Sau đó';Title='Dành thời gian ngồi nghỉ';Text='Điểm đến này sẽ đáng hơn khi bạn cho mình một khoảng dừng đủ lâu.'},@{Time='Cuối buổi';Title='Kết hợp điểm sinh thái khác';Text='Bạn có thể nối sang một địa điểm xanh khác để giữ cùng mạch trải nghiệm.'}); QuickPlanTitle='Một buổi đi hợp lý thường có'; QuickPlan=@('Thời gian mát để không gian dễ chịu hơn.','Điện thoại hoặc máy ảnh cho ảnh phong cảnh.','Tâm thế đi chậm và ít vội.','Nước uống và đồ gọn nhẹ.'); TipsTitle1='Cho trải nghiệm'; Tips1=@('Ưu tiên đi lúc trời dịu để tận hưởng tốt hơn.','Giày thoải mái sẽ phù hợp với nhịp đi dạo nhẹ quanh khu.','Nên mang theo nước nếu đi vào buổi trưa hoặc đầu chiều.'); TipsTitle2='Cho ảnh đẹp'; Tips2=@('Góc có đường dẫn và lớp cây xanh thường lên hình tốt hơn.','Ánh sáng mềm sẽ làm màu xanh bớt gắt và đẹp hơn.','Ảnh có chiều sâu không gian rất hợp với điểm đến này.'); CommentId=13
    },
    @{
        File='hoasung.html'; BodyClass='hoasung-page'; Title='Khu Du Lịch Sinh Thái Hoa Súng'; Description='Khám phá Khu Du Lịch Sinh Thái Hoa Súng - không gian đồng quê, hồ nước và cảnh sắc dịu dàng rất hợp cho một buổi thư giãn.'; HeroIcon='fa-solid fa-water-ladder'; HeroEyebrow='Cảnh sắc mềm và đậm chất đồng quê'; HeroLead='Một điểm đến nhẹ nhàng và dễ chịu, nơi mặt nước, cây xanh và không khí đồng quê hòa vào nhau để tạo nên một cảm giác rất êm. Hoa Súng phù hợp với những ai thích vẻ đẹp sinh thái mềm và có phần thơ hơn.'; HeroBg='images/hosung đẹp.jfif'; PrimaryTextColor='#466e57'; PrimaryBg1='#e9f7ee'; PrimaryBg2='#cfe4d7'; Accent='#5c8b6d'; AccentBg='rgba(92, 139, 109, 0.12)'; MainHeading='Vài nét về Hoa Súng'; Intro1='Hoa Súng gợi một cảm giác mềm và yên, khác với những điểm sinh thái thiên về hoạt động. Ở đây, cảnh quan là phần quan trọng nhất: mặt nước, cây cối và không khí dịu giúp chuyến đi trở nên thư thái hơn.'; Intro2='Đây là kiểu nơi càng đi chậm càng thấy đẹp. Không quá nhiều chi tiết cầu kỳ, nhưng nhờ sự hài hòa tự nhiên mà nơi này dễ được yêu thích theo cách rất nhẹ nhàng.'; MainImage='images/hosung đẹp.jfif'; MainAlt='Khu Du Lịch Sinh Thái Hoa Súng'; BadgeTitle='Điểm nổi bật'; BadgeText='Cảnh nước và cây xanh tạo nên cảm giác rất mềm cho toàn bộ không gian'; HeroStats=@(@{Title='Không gian dịu và mềm';Text='Phù hợp với những buổi đi thiên về thư giãn, ngắm cảnh và chụp ảnh'},@{Title='Đậm chất đồng quê';Text='Nhịp điệu nơi đây gợi cảm giác gần gũi, chậm và rất dễ chịu'},@{Title='Hợp ảnh sinh thái';Text='Cảnh nước và cây luôn tạo khung hình mộc mạc nhưng đẹp'},@{Title='Đi chậm sẽ thích hơn';Text='Đây là kiểu điểm đến cần sự thong thả để cảm nhận hết'}); Features=@(@{Icon='fa-solid fa-droplet';Title='Cảnh nước dịu mắt';Text='Mặt nước là yếu tố khiến nơi đây luôn tạo cảm giác êm và thư giãn.'},@{Icon='fa-solid fa-feather';Title='Không gian rất nhẹ';Text='Phù hợp với người thích đi dạo và ngắm cảnh hơn là chơi quá nhiều hoạt động.'},@{Icon='fa-solid fa-camera-retro';Title='Ảnh mang chất thơ';Text='Đây là nơi rất hợp với những khung hình mềm, sáng và tự nhiên.'}); SectionTitle='Điều làm nơi này đáng ghé'; SectionCopy='Sức hấp dẫn nằm ở nhịp điệu rất riêng: chậm hơn, mềm hơn và dễ để người xem cảm thấy lòng mình dịu xuống sau một quãng đường di chuyển.'; Highlights=@(@{Icon='fa-solid fa-spa';Title='Thư giãn rõ rệt';Text='Đây là nơi rất phù hợp cho một buổi muốn nghỉ đầu óc và nhìn nhiều màu xanh.'},@{Icon='fa-solid fa-seedling';Title='Gần thiên nhiên';Text='Cảm giác đồng quê và sinh thái được giữ khá rõ trong toàn bộ trải nghiệm.'},@{Icon='fa-solid fa-image';Title='Ảnh rất có cảm xúc';Text='Vẻ đẹp nơi này không quá mạnh nhưng lại rất dễ chạm vào cảm giác người xem.'}); TimelineTitle='Gợi ý tham quan ngắn'; TimelineCopy='Một lịch trình đơn giản và ít gấp gáp sẽ giúp bạn thấy rõ hơn vẻ dễ thương của nơi này.'; Timeline=@(@{Time='Đầu buổi';Title='Đi một vòng làm quen cảnh quan';Text='Hãy bắt đầu bằng việc đi chậm quanh khu để cảm nhận nhịp và màu sắc tổng thể.'},@{Time='Tiếp theo';Title='Tìm góc có nước và cây';Text='Đây thường là những điểm đẹp nhất để dừng lại và chụp vài tấm ảnh.'},@{Time='Sau đó';Title='Ngồi nghỉ một lúc';Text='Chỉ cần cho mình một khoảng ngồi yên, bạn sẽ thấy địa điểm này đáng hơn khá nhiều.'},@{Time='Cuối buổi';Title='Kết hợp điểm sinh thái khác hoặc về thành phố';Text='Đây là một điểm rất hợp để nối vào lịch trình nghỉ nhịp trước khi quay lại trung tâm.'}); QuickPlanTitle='Một buổi đi đúng nhịp thường có'; QuickPlan=@('Tâm thế thong thả và không vội.','Trang phục nhẹ, thoải mái.','Pin điện thoại đủ cho ảnh cảnh.','Thời điểm mát để cảnh và màu lên đẹp hơn.'); TipsTitle1='Cho trải nghiệm'; Tips1=@('Ánh sáng dịu sẽ khiến chuyến đi dễ chịu hơn rất nhiều.','Đi chậm và nghỉ vài lần sẽ đúng nhịp nhất với nơi này.','Nên có nước uống nếu bạn đi vào ban ngày.'); TipsTitle2='Cho ảnh đẹp'; Tips2=@('Ảnh ngang và ảnh có mặt nước thường rất hợp với địa điểm này.','Ánh sáng đầu ngày hoặc cuối chiều sẽ giúp cảnh mềm hơn.','Nên giữ ảnh tự nhiên thay vì cố làm quá nhiều bố cục phức tạp.'); CommentId=14
    },
    @{
        File='bacong.html'; BodyClass='bacong-page'; Title='Vườn Du Lịch Sinh Thái Ba Cống'; Description='Khám phá Vườn Du Lịch Sinh Thái Ba Cống - không gian miệt vườn xanh mát với nhịp tham quan nhẹ nhàng, gần gũi thiên nhiên.'; HeroIcon='fa-solid fa-tree-city'; HeroEyebrow='Một khoảng xanh mộc mạc của Cần Thơ'; HeroLead='Ba Cống phù hợp với những ai thích kiểu đi chơi gần gũi, ít ồn và thiên về cảm giác miệt vườn thật. Không gian xanh, nhịp chậm và sự mộc mạc là điều khiến nơi này dễ tạo thiện cảm với người ghé thăm.'; HeroBg='images/3cong đẹp.webp'; PrimaryTextColor='#25502b'; PrimaryBg1='#e7f4cf'; PrimaryBg2='#abd785'; Accent='#3f7645'; AccentBg='rgba(63, 118, 69, 0.12)'; MainHeading='Vài nét về Ba Cống'; Intro1='Ba Cống là kiểu điểm sinh thái khiến người ta thấy dễ chịu theo cách rất giản dị. Không quá rực rỡ, không quá dày hoạt động, nơi này hấp dẫn bởi vẻ mộc mạc và cảm giác đi để thở giữa thiên nhiên.'; Intro2='Với những người thích cảnh xanh, nhịp chậm và các chuyến đi không cần quá ồn ào, Ba Cống thường là một lựa chọn rất đáng cân nhắc khi khám phá Cần Thơ.'; MainImage='images/3cong đẹp.webp'; MainAlt='Vườn Du Lịch Sinh Thái Ba Cống'; BadgeTitle='Điểm nổi bật'; BadgeText='Màu xanh dịu và cảm giác miệt vườn thật là điều đáng nhớ nhất'; HeroStats=@(@{Title='Không gian xanh gần gũi';Text='Điểm mạnh lớn nhất là cảm giác tự nhiên và không quá du lịch hóa'},@{Title='Hợp đi thư giãn';Text='Đây là nơi hợp để nghỉ nhịp hơn là đi quá nhiều hoạt động mạnh'},@{Title='Đậm tinh thần miệt vườn';Text='Cảnh quan và nhịp trải nghiệm đều mang chất miền Tây rõ nét'},@{Title='Ảnh tự nhiên đẹp';Text='Không cần dàn dựng quá nhiều vẫn có thể có ảnh rất dễ thương'}); Features=@(@{Icon='fa-solid fa-leaf';Title='Không gian dịu và xanh';Text='Một nơi thích hợp cho những buổi muốn rời khỏi nhịp thành phố một chút.'},@{Icon='fa-solid fa-spa';Title='Thư giãn đúng chất';Text='Nơi này đáng đi hơn khi bạn chậm lại và cảm nhận nhiều hơn.'},@{Icon='fa-solid fa-camera';Title='Hợp ảnh miệt vườn';Text='Các khung hình ở đây thường đẹp nhờ sự tự nhiên và mộc mạc.'}); SectionTitle='Điều làm Ba Cống đáng ghé'; SectionCopy='Chính sự giản dị là điểm mạnh. Không quá cầu kỳ nhưng đủ thật, đủ xanh và đủ nhẹ để chuyến đi để lại cảm giác dễ chịu lâu hơn.'; Highlights=@(@{Icon='fa-solid fa-heart';Title='Cảm giác rất thật';Text='Đây là kiểu nơi ít tạo cảm giác du lịch hóa nên trải nghiệm thường gần gũi hơn.'},@{Icon='fa-solid fa-tree';Title='Gần thiên nhiên rõ nét';Text='Màu xanh và không gian mở giúp nơi đây luôn giữ được sự dễ chịu.'},@{Icon='fa-solid fa-camera-retro';Title='Ảnh đẹp theo kiểu tự nhiên';Text='Không cần quá nhiều setup, chính không gian đã đủ tạo cảm xúc cho ảnh.'}); TimelineTitle='Gợi ý tham quan ngắn'; TimelineCopy='Điểm đến này hợp nhất với một nhịp đi chậm, đơn giản và thoải mái.'; Timeline=@(@{Time='Bắt đầu';Title='Đi một vòng quanh khu';Text='Việc làm quen không gian trước sẽ giúp bạn dễ tìm ra các góc đẹp và chỗ nghỉ phù hợp.'},@{Time='Tiếp theo';Title='Chụp vài góc xanh';Text='Những đoạn đường nhỏ, hàng cây và khoảng mở thường là điểm ảnh đẹp nhất.'},@{Time='Sau đó';Title='Dành thời gian nghỉ ngắn';Text='Địa điểm này sẽ đáng hơn khi bạn thật sự chậm lại và thư giãn trong không gian ấy.'},@{Time='Cuối buổi';Title='Kết nối với hành trình sinh thái khác';Text='Ba Cống rất hợp để ghép vào một ngày đi theo chủ đề xanh và miệt vườn.'}); QuickPlanTitle='Một buổi đi đúng nhịp thường có'; QuickPlan=@('Thời gian thoải mái và không gấp gáp.','Trang phục gọn, dễ đi bộ.','Điện thoại đủ pin cho ảnh cảnh tự nhiên.','Thời điểm mát để chuyến đi dễ chịu hơn.'); TipsTitle1='Cho trải nghiệm'; Tips1=@('Đây là nơi hợp với nhịp thong thả, không nên chạy lịch quá nhanh.','Ưu tiên đi lúc mát để cảm giác dễ chịu hơn nhiều.','Nên có nước nếu đi vào khung giờ nắng.'); TipsTitle2='Cho ảnh đẹp'; Tips2=@('Ảnh tự nhiên khi đang đi dạo thường hợp hơn ảnh tạo dáng quá nhiều.','Hãy tận dụng các lớp cây xanh để tạo chiều sâu cho khung hình.','Ánh sáng đầu ngày hoặc cuối chiều luôn dễ lên ảnh hơn.'); CommentId=15
    }
)

foreach ($page in $pages2) {
    $html = Render-Page $page
    Set-Content -Path (Join-Path 'd:\html' $page.File) -Value $html -Encoding UTF8
}

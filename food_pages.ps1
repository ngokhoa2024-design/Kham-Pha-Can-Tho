function Render-FoodPage {
    param($Page)

    $flavorsHtml = ($Page.Flavors | ForEach-Object { "<span class='flavor-chip'>$_</span>" }) -join "`n"
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
    $stepsHtml = ($Page.Steps | ForEach-Object {
@"
            <div class="tasting-step">
                <div class="step-no">$($_.No)</div>
                <div>
                    <h3>$($_.Title)</h3>
                    <p>$($_.Text)</p>
                </div>
            </div>
"@
    }) -join "`n"
    $tipsHtml = ($Page.Tips | ForEach-Object { "<li><i class='fa-solid fa-check'></i><span>$_</span></li>" }) -join "`n"

    $recommendSection = ''
    if ($Page.RecommendDishes) {
        $dishesHtml = ($Page.RecommendDishes | ForEach-Object { "<li><strong>$($_.Name):</strong> $($_.Text)</li>" }) -join "`n"
        $shopsHtml = ($Page.RecommendShops | ForEach-Object { "<li><strong>$($_.Name):</strong> $($_.Text)</li>" }) -join "`n"
        $recommendSection = @"
    <div class="section-block">
        <h2 class="section-heading">Recommend món nên thử</h2>
        <div class="travel-tips-grid">
            <div class="tip-box">
                <strong>Món ngon nên thử</strong>
                <ul>
$dishesHtml
                </ul>
            </div>
            <div class="tip-box">
                <strong>Quán ăn nên thử</strong>
                <ul>
$shopsHtml
                </ul>
            </div>
        </div>
    </div>
"@
    }

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
                linear-gradient(135deg, rgba(95, 40, 18, 0.55), rgba(223, 130, 55, 0.35)),
                url("$($Page.Image)") center/cover;
        }

        .$($Page.BodyClass) .hero-btn.primary {
            color: #6b2f10;
            background: linear-gradient(135deg, #ffe2b4, #ffb867);
            box-shadow: 0 18px 30px rgba(255, 171, 87, 0.28);
        }

        .$($Page.BodyClass) .feature-pill i,
        .$($Page.BodyClass) .highlight-item i,
        .$($Page.BodyClass) .quick-plan li i,
        .$($Page.BodyClass) .travel-tips li i,
        .$($Page.BodyClass) .timeline-time,
        .$($Page.BodyClass) .step-no {
            color: #b65222;
        }

        .$($Page.BodyClass) .feature-pill i,
        .$($Page.BodyClass) .highlight-item i,
        .$($Page.BodyClass) .step-no {
            background: rgba(182, 82, 34, 0.12);
        }

        .flavor-strip {
            display: flex;
            flex-wrap: wrap;
            gap: 12px;
            margin: 26px 0 10px;
        }

        .flavor-chip {
            padding: 10px 16px;
            border-radius: 999px;
            background: linear-gradient(135deg, #fff1da, #ffe0b3);
            color: #8b4318;
            font-weight: 700;
            font-size: 0.95rem;
            box-shadow: 0 10px 22px rgba(179, 96, 32, 0.12);
        }

        .tasting-board {
            display: grid;
            grid-template-columns: 1.25fr 0.95fr;
            gap: 24px;
            margin-top: 24px;
        }

        .tasting-card,
        .pairing-card {
            background: #fff;
            border-radius: 24px;
            padding: 28px;
            box-shadow: 0 18px 40px rgba(69, 33, 11, 0.08);
        }

        .tasting-step {
            display: grid;
            grid-template-columns: 56px 1fr;
            gap: 16px;
            align-items: start;
            margin-bottom: 18px;
        }

        .step-no {
            width: 56px;
            height: 56px;
            border-radius: 18px;
            display: grid;
            place-items: center;
            font-weight: 800;
            font-size: 1.1rem;
        }

        .pairing-card ul {
            padding-left: 0;
            list-style: none;
            margin: 0;
        }

        .pairing-card li {
            display: flex;
            gap: 10px;
            margin-bottom: 14px;
            color: #5f4b40;
        }

        .pairing-card li i {
            color: #c2642c;
            margin-top: 4px;
        }

        @media (max-width: 900px) {
            .tasting-board {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body class="cncr-page $($Page.BodyClass)">
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
                <li><a href="doan.html" class="active"><i class="fa-solid fa-utensils"></i> Ẩm Thực</a></li>
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
            <div class="eyebrow"><i class="$($Page.Icon)"></i> $($Page.Eyebrow)</div>
            <h1>$($Page.Title)</h1>
            <p class="hero-lead">$($Page.Lead)</p>
            <div class="flavor-strip">
$flavorsHtml
            </div>
            <div class="hero-actions">
                <a class="hero-btn primary" href="#thuong-thuc"><i class="fa-solid fa-utensils"></i> Xem cách thưởng thức</a>
                <a class="hero-btn secondary" href="#danh-gia"><i class="fa-solid fa-star"></i> Đọc đánh giá</a>
            </div>
        </div>
        <div class="hero-panel">
            <h2>Điểm nhanh trước khi thử</h2>
            <div class="hero-stats">
                <div class="hero-stat"><strong>Điểm vị giác</strong><span>$($Page.Quick1)</span></div>
                <div class="hero-stat"><strong>Hợp nhất khi</strong><span>$($Page.Quick2)</span></div>
                <div class="hero-stat"><strong>Cảm giác món</strong><span>$($Page.Quick3)</span></div>
                <div class="hero-stat"><strong>Nên đi cùng</strong><span>$($Page.Quick4)</span></div>
            </div>
        </div>
    </div>
</header>

<section class="tour-detail">
    <div class="intro-section">
        <div class="intro-text">
            <h2>$($Page.IntroTitle)</h2>
            <p>$($Page.Intro1)</p>
            <p>$($Page.Intro2)</p>
        </div>
        <div class="image-placeholder">
            <img src="$($Page.Image)" alt="$($Page.Title)">
            <div class="image-badge">Điểm nhấn<span>$($Page.Badge)</span></div>
        </div>
    </div>

    <div class="feature-band">
$featuresHtml
    </div>

    <hr class="separator">

    <div class="section-block" id="thuong-thuc">
        <h2 class="section-heading">Ăn $($Page.ShortTitle) sao cho ngon?</h2>
        <p class="section-copy">$($Page.EnjoyIntro)</p>
        <div class="tasting-board">
            <div class="tasting-card">
                <h3>$($Page.StepTitle)</h3>
$stepsHtml
            </div>
            <div class="pairing-card">
                <h3>Nên đi cùng gì?</h3>
                <ul>
                    <li><i class="fa-solid fa-mug-hot"></i><span>$($Page.Pair1)</span></li>
                    <li><i class="fa-solid fa-seedling"></i><span>$($Page.Pair2)</span></li>
                    <li><i class="fa-solid fa-location-dot"></i><span>$($Page.Pair3)</span></li>
                </ul>
            </div>
        </div>
    </div>

$recommendSection
    <div class="travel-tips">
        <h3><i class="fa-solid fa-circle-exclamation"></i> Mẹo nhỏ khi đi ăn</h3>
        <div class="travel-tips-grid">
            <div class="tip-box">
                <strong>Lưu ý nên nhớ</strong>
                <ul>
$tipsHtml
                </ul>
            </div>
            <div class="tip-box">
                <strong>Cảm giác món ăn</strong>
                <p>$($Page.Feel)</p>
                <p>$($Page.Feel2)</p>
            </div>
        </div>
    </div>

    <div class="card comment-section" data-id="$($Page.CommentId)" id="danh-gia">
        <h3><i class="fa-solid fa-star"></i> Đánh giá từ thực khách</h3>
        <p>Hãy chia sẻ cảm nhận của bạn về $($Page.Title) để người ghé sau có thêm gợi ý nhé.</p>
        <div class="rating" id="rating-$($Page.CommentId)"></div>
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
    <div class="footer-credit"><p>Nguồn ảnh: Shutterstock, thamhiemmekong.com, vi.wikipedia.org và một số website du lịch khác. Xin chân thành cảm ơn.</p></div>
</footer>
<script src="scriptCNCR.js"></script>
</body>
</html>
"@
}
$pages = @(
@{File='banhxeo.html';BodyClass='banhxeo-page';Title='Bánh Xèo';ShortTitle='bánh xèo';Description='Khám phá bánh xèo Cần Thơ với lớp vỏ giòn, nhân đầy và cách ăn đậm chất miền Tây.';Icon='fa-solid fa-bowl-food';Eyebrow='Giòn rụm, nóng hổi, rất miền Tây';Lead='Bánh xèo Cần Thơ hấp dẫn ở tiếng giòn khi vừa ra chảo, phần nhân đậm đà và cảm giác cuốn cùng rau sống, nước chấm cực kỳ đã miệng.';Image='images/banhxeo4.jpg';Quick1='Giòn, béo nhẹ, thơm bột nghệ';Quick2='Ăn nóng ngay lúc mới ra chảo';Quick3='No nhưng vẫn cuốn vì nhiều rau';Quick4='Rau sống, nước mắm chua ngọt';IntroTitle='Vì sao bánh xèo Cần Thơ dễ gây nghiện?';Intro1='Bánh xèo là một trong những món vừa dân dã vừa cuốn hút nhất của miền Tây. Cái hay không chỉ nằm ở lớp vỏ giòn mà còn ở cách ăn rất vui: cắt nhỏ, cuốn rau, chấm nước mắm rồi mới cảm hết vị.';Intro2='Ở Cần Thơ, bánh xèo thường to, vàng ươm, thơm mùi bột và có phần nhân đủ tôm thịt, giá hoặc đôi khi thêm củ hủ dừa. Món này càng ăn đúng kiểu càng thấy đã.';Badge='Lớp vỏ vàng giòn và tiếng xèo trên chảo luôn là phần khiến món này hấp dẫn nhất.';Features=@(@{Icon='fa-solid fa-fire';Title='Ngon nhất khi vừa đổ';Text='Độ giòn và hương thơm rõ nhất ở khoảnh khắc mới ra chảo.'},@{Icon='fa-solid fa-leaf';Title='Ăn cùng rau cực hợp';Text='Rau sống giúp cân lại độ béo và làm món bớt ngấy.'},@{Icon='fa-solid fa-droplet';Title='Nước chấm quyết định cảm giác';Text='Một chén mắm chua ngọt pha vừa tay sẽ nâng món lên hẳn.'});EnjoyIntro='Bánh xèo ngon nhất không phải chỉ ở miếng bánh, mà ở cả cách cuốn, cách chấm và nhịp ăn lúc bánh còn nóng.';StepTitle='3 bước để ăn cho thật đã';Steps=@(@{No='01';Title='Cắt miếng vừa tay';Text='Đừng cắt quá nhỏ, giữ đủ phần vỏ giòn và nhân để miếng ăn còn rõ vị.'},@{No='02';Title='Cuốn nhiều rau';Text='Rau sống, cải xanh hoặc lá to sẽ giúp miếng ăn cân bằng hơn hẳn.'},@{No='03';Title='Chấm nhanh, ăn liền';Text='Chấm vừa đủ rồi ăn ngay để giữ được độ giòn của vỏ bánh.'});Pair1='Thêm một ly nước mát hoặc trà nhẹ sẽ rất hợp.';Pair2='Rau sống tươi là phần không nên thiếu.';Pair3='Đi đông người sẽ vui hơn vì bánh xèo rất hợp ăn kiểu quây quần.';Tips=@('Đi sớm hoặc tránh giờ quá đông để bánh ra nhanh hơn.','Ưu tiên ăn tại chỗ thay vì mang về nếu muốn giữ độ giòn.','Nếu đi nhóm, nên gọi nhiều vị để đỡ ngán.');Feel='Món này cho cảm giác vui, nóng hổi và rất đúng chất bữa ăn miền Tây quây quần.';Feel2='Đây là kiểu món càng ăn đúng cách càng thấy khác biệt rõ.';Flavors=@('giòn rụm','béo nhẹ','rau sống','nước mắm chua ngọt');CommentId=201},
@{File='bunncleo.html';BodyClass='bunncleo-page';Title='Bún Nước Lèo';ShortTitle='bún nước lèo';Description='Khám phá bún nước lèo với hương vị mắm đặc trưng, nước dùng đậm và cách ăn rất cuốn.';Icon='fa-solid fa-bowl-rice';Eyebrow='Đậm mùi, ngọt nước, rất riêng';Lead='Bún nước lèo gây nhớ bởi nồi nước dùng đậm mùi mắm nhưng khi ăn lại tròn vị, thanh và rất cuốn nếu đi cùng rau sống, cá hoặc tôm thịt.';Image='images/bunncleo.jpg';Quick1='Mùi mắm rất riêng nhưng không gắt';Quick2='Hợp nhất vào bữa sáng hoặc trưa';Quick3='Nước dùng là linh hồn của món';Quick4='Rau sống và topping tươi';IntroTitle='Bún nước lèo có gì đặc biệt?';Intro1='Đây là món bún mang hương vị khá riêng của miền Tây. Điểm khó quên nhất nằm ở nước lèo: có chiều sâu, đậm mùi nhưng không nặng, càng ăn càng thấy ngọt hậu.';Intro2='Món này không cần quá nhiều kỹ xảo trình bày, chỉ cần nước dùng chuẩn, topping tươi và bún vừa phải là đã đủ để chinh phục người ăn.';Badge='Nước lèo thơm mắm, nóng và đậm vị là phần quyết định món ngon hay không.';Features=@(@{Icon='fa-solid fa-water';Title='Nước dùng có chiều sâu';Text='Đây là thứ làm nên bản sắc rõ nhất của món.'},@{Icon='fa-solid fa-fish';Title='Topping đi kèm tạo độ ngọt';Text='Cá, tôm hoặc thịt giúp tô bún tròn vị hơn.'},@{Icon='fa-solid fa-seedling';Title='Rau sống làm món sáng hơn';Text='Rau giúp mùi vị cân bằng và dễ ăn hơn nhiều.'});EnjoyIntro='Muốn cảm rõ cái hay của bún nước lèo, hãy ăn chậm để cảm nước dùng trước rồi mới thấy hết độ ngọt hậu.';StepTitle='Nên thưởng thức theo kiểu này';Steps=@(@{No='01';Title='Nếm nước trước';Text='Thử một muỗng nước lèo để cảm nhận độ đậm và hậu vị của món.'},@{No='02';Title='Trộn nhẹ với rau';Text='Rau sống giúp tô bún bớt nặng và dễ ăn hơn.'},@{No='03';Title='Ăn khi còn thật nóng';Text='Món này để nguội sẽ giảm đáng kể độ ngon.'});Pair1='Một ly trà đá hoặc nước mát nhẹ là hợp nhất.';Pair2='Rau sống tươi sẽ làm tô bún dễ ăn hơn nhiều.';Pair3='Đi buổi sáng để cảm món ở trạng thái ngon nhất.';Tips=@('Nếu chưa quen mùi mắm, hãy thử trước một tô nhỏ.','Nên ăn tại quán để giữ nhiệt nước lèo.','Đừng cho quá nhiều gia vị ngay từ đầu.');Feel='Bún nước lèo là kiểu món càng ăn chậm càng thấy tinh tế.';Feel2='Ban đầu có thể lạ, nhưng quen rồi thì rất dễ nhớ vị.';Flavors=@('đậm mắm','ngọt hậu','rau sống','nóng hổi');CommentId=202},
@{File='laumam.html';BodyClass='laumam-page';Title='Lẩu Mắm';ShortTitle='lẩu mắm';Description='Khám phá lẩu mắm miền Tây với hương vị đậm đà, nồi lẩu đầy topping và rau.';Icon='fa-solid fa-pot-food';Eyebrow='Đậm đà, nghi ngút, ăn là nhớ';Lead='Lẩu mắm là kiểu món đại diện cho tinh thần ăn uống miền Tây: đậm, nhiều, vui và càng ăn đông càng thấy ngon. Mùi mắm, rau và đồ nhúng hòa lại tạo nên một nồi lẩu rất khó quên.';Image='images/laumam3.jpg';Quick1='Đậm mùi, rất đầy đặn';Quick2='Ngon nhất khi ăn theo nhóm';Quick3='Rau và đồ nhúng là phần cực quan trọng';Quick4='Càng ăn càng thấy ngọt hậu';IntroTitle='Lẩu mắm vì sao luôn là món “quây quần”?';Intro1='Đây không phải kiểu món ăn một mình cho gọn. Lẩu mắm ngon nhất khi có nhiều người, nhiều loại rau, nhiều đồ nhúng và cả tiếng chuyện trò quanh nồi lẩu đang sôi.';Intro2='Điểm đáng giá nhất của món là chiều sâu nước lẩu. Nếu nấu khéo, mùi mắm lên rõ nhưng không gắt, thay vào đó là vị ngọt đậm rất đã.';Badge='Nồi lẩu sôi với nhiều rau và đồ nhúng luôn là phần khiến món này hấp dẫn nhất.';Features=@(@{Icon='fa-solid fa-users';Title='Ăn đông sẽ ngon hơn';Text='Lẩu mắm là món rất hợp với nhịp quây quần.'},@{Icon='fa-solid fa-seedling';Title='Rau là linh hồn thứ hai';Text='Nhiều loại rau giúp nồi lẩu vừa đậm vừa thanh.'},@{Icon='fa-solid fa-fire-burner';Title='Nước lẩu quyết định tất cả';Text='Một nồi lẩu ngon phải vừa thơm mắm vừa có hậu ngọt.'});EnjoyIntro='Ăn lẩu mắm ngon là phải giữ nhịp nhúng vừa đủ, ăn nóng và đổi nhiều loại rau để không bị nặng vị.';StepTitle='Ăn lẩu mắm sao cho không bị ngấy';Steps=@(@{No='01';Title='Nếm nước lẩu trước';Text='Hãy thử nước lẩu ngay lúc vừa sôi để cảm độ đậm nền của món.'},@{No='02';Title='Nhúng rau theo đợt';Text='Đừng cho tất cả vào cùng lúc, nhúng vừa ăn sẽ giữ độ tươi ngon hơn.'},@{No='03';Title='Luân phiên đồ nhúng';Text='Đổi giữa cá, thịt, hải sản và rau giúp nồi lẩu luôn thú vị.'});Pair1='Đi cùng nhóm bạn hoặc gia đình là hợp nhất.';Pair2='Rau tươi nhiều loại sẽ làm món đúng chất hơn.';Pair3='Buổi chiều tối là thời điểm rất hợp để ăn lẩu.';Tips=@('Nên gọi theo nhóm để ăn được nhiều loại nhúng hơn.','Nếu chưa quen đậm vị, hãy bắt đầu bằng phần rau và cá trước.','Nước lẩu ngon nhất khi luôn giữ nóng đều.');Feel='Đây là kiểu món mang cảm giác no nê, ấm và rất “đã” khi ăn đúng dịp.';Feel2='Không chỉ là món ăn, nó còn là không khí của một bữa quây quần.';Flavors=@('đậm đà','nghi ngút','rau miền Tây','ngọt hậu');CommentId=203},
@{File='banhtetlacam.html';BodyClass='banhtet-page';Title='Bánh Tét Lá Cẩm';ShortTitle='bánh tét lá cẩm';Description='Khám phá bánh tét lá cẩm Cần Thơ với màu tím đẹp mắt và hương vị dẻo thơm.';Icon='fa-solid fa-cake-candles';Eyebrow='Dẻo thơm, đẹp mắt, rất riêng Cần Thơ';Lead='Bánh tét lá cẩm là món vừa mang vẻ đẹp thị giác rất riêng vừa giữ được chất truyền thống. Màu tím từ lá cẩm, nếp dẻo và nhân đậm làm món này luôn nổi bật trong ký ức về ẩm thực Tây Đô.';Image='images/banhtet.jpg';Quick1='Dẻo nếp, thơm lá cẩm';Quick2='Hợp làm quà và ăn nhẹ';Quick3='Nhân là phần tạo chiều sâu';Quick4='Đẹp cả vị lẫn hình';IntroTitle='Bánh tét lá cẩm có gì làm người ta nhớ?';Intro1='Khác với nhiều món ăn nóng phải ăn ngay, bánh tét lá cẩm có sức hút ở sự chỉn chu và cảm giác ấm áp rất truyền thống. Nhìn lát cắt đẹp thôi đã thấy muốn thử.';Intro2='Món này vừa hợp để ăn, vừa hợp để biếu tặng vì mang nhiều dấu ấn Cần Thơ cả về hình thức lẫn hương vị.';Badge='Màu tím đẹp và lát cắt rõ lớp nếp, nhân luôn là điểm gây ấn tượng đầu tiên.';Features=@(@{Icon='fa-solid fa-gift';Title='Rất hợp làm quà';Text='Món này vừa đẹp mắt vừa đậm chất địa phương.'},@{Icon='fa-solid fa-cookie-bite';Title='Dẻo và thơm';Text='Nếp dẻo kết hợp với lá cẩm tạo ra cảm giác rất riêng.'},@{Icon='fa-solid fa-heart';Title='Mang nhiều cảm giác truyền thống';Text='Đây là kiểu món gợi ngay không khí sum vầy và lễ tết.'});EnjoyIntro='Bánh tét lá cẩm không cần ăn vội. Cắt đẹp, ăn chậm và cảm phần nếp lẫn nhân là đã thấy ngon theo cách rất khác.';StepTitle='Cách thưởng thức trọn vị';Steps=@(@{No='01';Title='Cắt lát vừa';Text='Một lát vừa tay sẽ giúp thấy rõ độ dẻo của nếp và độ đầy của nhân.'},@{No='02';Title='Ăn khi bánh còn mềm';Text='Nếu bánh quá nguội, cảm giác dẻo thơm sẽ giảm đi chút ít.'},@{No='03';Title='Thử riêng phần nếp rồi phần nhân';Text='Cách này giúp bạn cảm rõ hơn từng lớp vị của món.'});Pair1='Một tách trà nóng rất hợp với món này.';Pair2='Ăn nhẹ buổi sáng hoặc xế đều ổn.';Pair3='Rất phù hợp để mua làm quà mang về.';Tips=@('Nên chọn bánh mới để nếp còn mềm và thơm.','Nếu mua làm quà, nên hỏi thời gian dùng tốt nhất.','Cắt lát mỏng vừa phải sẽ dễ cảm vị hơn.');Feel='Đây là kiểu món nhẹ nhàng nhưng để lại cảm giác rất đằm.';Feel2='Không ồn ào, nhưng nhìn và ăn đều thấy rất có chất riêng.';Flavors=@('dẻo thơm','lá cẩm','nhân mặn ngọt','truyền thống');CommentId=204},
@{File='hutieugo.html';BodyClass='hutieugo-page';Title='Hủ Tiếu Gõ';ShortTitle='hủ tiếu gõ';Description='Khám phá hủ tiếu gõ với hương vị quen thuộc, dễ ăn và rất hợp nhịp phố xá về đêm.';Icon='fa-solid fa-bowl-food';Eyebrow='Nhanh, nóng, thân quen phố đêm';Lead='Hủ tiếu gõ có sức hút riêng vì đơn giản mà đúng lúc. Một tô nóng hổi giữa buổi tối, nước dùng thơm, sợi hủ tiếu mềm vừa và topping quen thuộc là đủ tạo cảm giác rất dễ chịu.';Image='images/hutieu.jpg';Quick1='Nóng, nhẹ và dễ ăn';Quick2='Hợp nhất vào buổi tối';Quick3='Không cầu kỳ nhưng rất vừa miệng';Quick4='Càng ăn tại chỗ càng ngon';IntroTitle='Hủ tiếu gõ có gì mà ai cũng thích?';Intro1='Đây là kiểu món ăn làm người ta thấy thân quen trước khi thấy ngon. Hủ tiếu gõ không cần trình bày cầu kỳ, chỉ cần nước dùng dễ chịu và sợi hủ tiếu đúng độ là đã ổn.';Intro2='Ở Cần Thơ, món này rất hợp với nhịp sống buổi tối: gọn, nóng, vừa bụng và dễ gọi.';Badge='Tô hủ tiếu nóng nghi ngút và nước dùng trong thơm là cảm giác đáng nhớ nhất.';Features=@(@{Icon='fa-solid fa-moon';Title='Rất hợp ăn đêm';Text='Món này vừa bụng và không quá nặng khi ăn tối muộn.'},@{Icon='fa-solid fa-spoon';Title='Nước dùng dễ chịu';Text='Điểm ngon thường nằm ở độ thanh vừa phải.'},@{Icon='fa-solid fa-bolt';Title='Nhanh và tiện';Text='Đây là món rất hợp với nhịp ăn nhanh nhưng vẫn ngon.'});EnjoyIntro='Hủ tiếu gõ ngon ở cái nóng vừa đủ và nhịp ăn gọn. Đừng để quá lâu nếu muốn cảm rõ nước dùng.';StepTitle='Ăn sao cho đúng kiểu';Steps=@(@{No='01';Title='Ăn lúc còn bốc khói';Text='Nhiệt độ là phần rất quan trọng của món này.'},@{No='02';Title='Nếm nước trước khi nêm';Text='Nước dùng ngon thường không cần chỉnh quá nhiều.'},@{No='03';Title='Thêm rau, tiêu vừa đủ';Text='Nêm nhẹ thôi sẽ giữ được cái chất quen thuộc của tô hủ tiếu.'});Pair1='Một ly trà đá là lựa chọn quen và hợp.';Pair2='Rau, giá hoặc hành sẽ làm món sáng vị hơn.';Pair3='Đi tối và ăn tại chỗ là đúng chất nhất.';Tips=@('Đừng nêm quá tay ngay từ đầu.','Nên ăn lúc tô vừa mang ra.','Nếu đói nhẹ buổi tối, đây là món rất vừa.' );Feel='Món này cho cảm giác gần gũi, ấm và rất đời thường.';Feel2='Không phức tạp, nhưng lại dễ trở thành món “thèm là phải đi ăn”.';Flavors=@('thanh nhẹ','nóng hổi','đời thường','ăn đêm');CommentId=205}
)
foreach ($page in $pages) { Set-Content -Path (Join-Path 'd:\html' $page.File) -Value (Render-FoodPage $page) -Encoding UTF8 }
$pagesB = @(
@{File='banhpia.html';BodyClass='banhpia-page';Title='Bánh Pía';ShortTitle='bánh pía';Description='Khám phá bánh pía với lớp vỏ nhiều tầng, nhân ngọt béo và hương vị dễ nhận ra.';Icon='fa-solid fa-cookie';Eyebrow='Ngọt, béo, thơm mùi sầu riêng';Lead='Bánh pía là món bánh có cá tính rất rõ: mềm, nhiều lớp, ngọt béo và thơm đậm. Đây là món ăn vặt lẫn quà mang về khá quen với nhiều người khi nhắc đến miền Tây.';Image='images/banhpia.jpg';Quick1='Ngọt béo, nhiều lớp';Quick2='Hợp ăn nhẹ và làm quà';Quick3='Mùi rất đặc trưng';Quick4='Ăn với trà sẽ cân vị hơn';IntroTitle='Bánh pía hấp dẫn ở đâu?';Intro1='Điểm thú vị của bánh pía là cảm giác nhiều lớp vỏ mỏng ôm lấy phần nhân đậm vị. Chỉ cần cắn một miếng là thấy rõ ngay nó khác với nhiều loại bánh ngọt khác.';Intro2='Món này thường gây nhớ bởi mùi và độ béo. Ai hợp vị sẽ thích rất nhanh, còn ai chưa quen thì nên thử từ miếng nhỏ trước.';Badge='Lớp vỏ nhiều tầng và phần nhân đậm là thứ tạo nên cá tính rõ nhất cho bánh pía.';Features=@(@{Icon='fa-solid fa-layer-group';Title='Vỏ bánh nhiều lớp';Text='Đây là phần tạo cảm giác rất riêng khi ăn.'},@{Icon='fa-solid fa-star';Title='Nhân có cá tính mạnh';Text='Độ thơm và độ béo của nhân khiến món này rất dễ nhớ.'},@{Icon='fa-solid fa-gift';Title='Rất hợp mua mang về';Text='Món này được chọn làm quà khá nhiều.'});EnjoyIntro='Bánh pía ngon hơn khi ăn chậm, nhấp trà nhẹ và cảm từng lớp vỏ cùng phần nhân.';StepTitle='Cách thưởng thức gọn mà đúng';Steps=@(@{No='01';Title='Cắt nhỏ nếu ăn lần đầu';Text='Vị bánh khá đậm nên bắt đầu bằng miếng nhỏ sẽ dễ cảm hơn.'},@{No='02';Title='Ăn cùng trà nóng';Text='Trà giúp cân lại độ ngọt béo rất hiệu quả.'},@{No='03';Title='Đừng ăn quá nhanh';Text='Món này hợp kiểu nhâm nhi hơn là ăn vội.'});Pair1='Trà nóng là bạn đồng hành hợp nhất.';Pair2='Ăn nhẹ vào buổi xế sẽ hợp hơn.';Pair3='Rất phù hợp để mua làm quà cho người thân.';Tips=@('Nếu không quen vị đậm, hãy thử từ loại ít ngọt hơn.','Bảo quản kỹ để bánh giữ độ mềm.','Ăn với trà sẽ dễ cảm vị hơn nhiều.');Feel='Đây là món ngọt có cá tính khá mạnh, thích là sẽ thích rất rõ.';Feel2='Nó không nhẹ nhàng, nhưng chính điều đó làm bánh pía có nét riêng.';Flavors=@('ngọt béo','nhiều lớp','thơm đậm','ăn với trà');CommentId=206},
@{File='banhcong.html';BodyClass='banhcong-page';Title='Bánh Cống';ShortTitle='bánh cống';Description='Khám phá bánh cống với lớp vỏ chiên giòn, nhân đậm và cách ăn rất cuốn.';Icon='fa-solid fa-shrimp';Eyebrow='Giòn, đậm, rất hợp ăn nóng';Lead='Bánh cống gây thiện cảm ngay ở miếng đầu vì lớp vỏ chiên giòn, phần nhân chắc vị và cảm giác ăn nóng rất đã. Đây là món vừa vui miệng vừa dễ nhớ với người thích đồ chiên kiểu miền Tây.';Image='images/banhcong.webp';Quick1='Giòn bên ngoài, đậm bên trong';Quick2='Ngon nhất khi vừa chiên';Quick3='Ăn cùng rau sẽ cân vị';Quick4='Rất hợp ăn xế hoặc chiều';IntroTitle='Bánh cống ngon ở phần nào?';Intro1='Món này hấp dẫn ở sự đối lập: bên ngoài giòn, bên trong chắc vị và đậm hơn tưởng tượng. Chính cảm giác cắn vào nghe giòn rồi gặp phần nhân làm nó rất dễ ghi điểm.';Intro2='Nếu ăn đúng kiểu có rau và nước chấm, bánh cống sẽ bớt ngấy và trở nên cuốn hơn hẳn.';Badge='Lớp vỏ vàng giòn và phần nhân chắc vị là điểm làm món này nổi bật.';Features=@(@{Icon='fa-solid fa-fire';Title='Ngon nhất lúc nóng';Text='Độ giòn giảm khá nhanh nếu để lâu.'},@{Icon='fa-solid fa-leaf';Title='Rau giúp món cân hơn';Text='Ăn cùng rau sẽ đỡ ngấy và sáng vị hơn.'},@{Icon='fa-solid fa-droplet';Title='Nước chấm làm món tròn vị';Text='Chấm đúng kiểu sẽ làm miếng bánh thú vị hơn hẳn.'});EnjoyIntro='Bánh cống nên ăn lúc nóng, chấm vừa tay và có rau đi kèm để giữ cảm giác ngon lâu hơn.';StepTitle='Ăn theo kiểu này sẽ hợp nhất';Steps=@(@{No='01';Title='Cắn thử miếng nóng đầu tiên';Text='Đây là lúc bạn cảm rõ nhất độ giòn của vỏ bánh.'},@{No='02';Title='Ăn kèm rau';Text='Rau sẽ giúp miếng bánh nhẹ hơn và đỡ ngấy.'},@{No='03';Title='Chấm vừa đủ';Text='Chấm nhiều quá sẽ làm vỏ bánh mất độ giòn.'});Pair1='Một ly nước mát hoặc trà nhẹ là vừa đẹp.';Pair2='Rau sống là phần nên có để món dễ ăn hơn.';Pair3='Ăn buổi xế hoặc chiều là hợp nhất.';Tips=@('Nên ăn tại chỗ nếu muốn giữ độ giòn.','Tránh để nước chấm làm mềm bánh quá nhanh.','Đi với bạn bè sẽ dễ gọi thêm món khác để thử cùng.');Feel='Bánh cống cho cảm giác vui miệng, khá “bắt” ở miếng đầu tiên.';Feel2='Đây là kiểu món đường phố có độ hấp dẫn rất trực diện.';Flavors=@('giòn nóng','đậm vị','rau sống','nước chấm');CommentId=207},
@{File='nemnuong.html';BodyClass='nemnuong-page';Title='Nem Nướng';ShortTitle='nem nướng';Description='Khám phá nem nướng với vị thịt thơm, độ dai vừa và kiểu ăn cuốn rất vui.';Icon='fa-solid fa-drumstick-bite';Eyebrow='Thơm lửa, dai nhẹ, rất vui miệng';Lead='Nem nướng hấp dẫn bởi mùi thịt nướng thơm, độ dai vừa phải và kiểu ăn cuốn cùng rau, bún, bánh tráng rất dễ khiến người ta ăn mãi không chán.';Image='images/nemnuong.jfif';Quick1='Thơm mùi nướng rất rõ';Quick2='Hợp ăn cuốn và ăn nhóm';Quick3='Nước chấm rất quan trọng';Quick4='Rau giúp món bớt nặng';IntroTitle='Nem nướng có gì khiến người ta mê?';Intro1='Món này không chỉ ngon vì phần nem. Cái hay nằm ở cả bộ món đi cùng: rau, bún, bánh tráng và nước chấm. Mỗi lần cuốn là một lần điều chỉnh vị theo ý mình.';Intro2='Ở Cần Thơ, nem nướng vừa hợp làm bữa nhẹ vừa hợp cho những buổi ăn đông vui.';Badge='Mùi nướng thơm và cảm giác cuốn tại bàn là điều làm món này rất cuốn.';Features=@(@{Icon='fa-solid fa-fire';Title='Thơm mùi lửa';Text='Mùi nướng giúp món có độ hấp dẫn rất trực tiếp.'},@{Icon='fa-solid fa-wrap';Title='Ăn cuốn rất vui';Text='Món này làm thực khách có cảm giác tương tác rõ hơn khi ăn.'},@{Icon='fa-solid fa-droplet';Title='Nước chấm nâng món lên rõ';Text='Một chén chấm chuẩn sẽ làm nem nổi bật hơn nhiều.'});EnjoyIntro='Nem nướng ngon nhất khi ăn cuốn tại chỗ, tự chỉnh lượng rau và nước chấm theo đúng gu của mình.';StepTitle='Ăn như vậy sẽ hợp nhất';Steps=@(@{No='01';Title='Chuẩn bị lớp cuốn gọn';Text='Bánh tráng, rau và bún vừa tay sẽ giúp miếng cuốn dễ ăn hơn.'},@{No='02';Title='Để nem là trung tâm vị';Text='Đừng cho quá nhiều thứ để nem vẫn là vị chính.'},@{No='03';Title='Chấm vừa đủ đậm';Text='Nước chấm nên đủ để bật vị nhưng không làm lấn mùi nem.'});Pair1='Rau sống và đồ cuốn là phần không thể thiếu.';Pair2='Đi đông sẽ vui hơn vì món này rất hợp ngồi cuốn cùng nhau.';Pair3='Ăn chiều hoặc tối là thời điểm hợp nhất.';Tips=@('Nếu chưa quen, hãy cuốn ít thành phần trước rồi tăng dần.','Nước chấm nên thử trước để chỉnh lượng phù hợp.','Nem ngon nhất khi còn ấm.');Feel='Nem nướng mang cảm giác vừa vui, vừa thơm và rất dễ ăn kéo dài.';Feel2='Đây là kiểu món càng ngồi lâu càng thấy cuốn đúng nghĩa.';Flavors=@('thơm nướng','dai nhẹ','ăn cuốn','rau sống');CommentId=208},
@{File='banhtnuong.html';BodyClass='banhtnuong-page';Title='Bánh Tráng Nướng';ShortTitle='bánh tráng nướng';Description='Khám phá bánh tráng nướng với lớp đế giòn, topping đậm vị và cảm giác ăn nóng rất vui.';Icon='fa-solid fa-pizza-slice';Eyebrow='Giòn tan, thơm topping, ăn nóng là chuẩn';Lead='Bánh tráng nướng là món ăn vặt có sức hút rất trực diện: giòn, thơm, nóng và đầy topping. Cắn một miếng là nghe rõ độ giòn ngay.';Image='images/banhtnuong.jfif';Quick1='Giòn, thơm và bắt vị';Quick2='Phải ăn nóng mới ngon';Quick3='Topping tạo cá tính món';Quick4='Rất hợp ăn vặt chiều tối';IntroTitle='Vì sao bánh tráng nướng luôn đông khách?';Intro1='Món này vui ở chỗ nhìn đã thích, ngửi đã thơm và ăn thì rất bắt miệng. Phần đế giòn kết hợp topping đậm làm nó dễ được yêu thích ở mọi lứa tuổi.';Intro2='Không cần ăn nhiều, chỉ một chiếc nóng hổi cũng đủ tạo cảm giác rất đã miệng.';Badge='Lớp bánh giòn và topping nóng thơm là phần làm món này lên sức hút rõ nhất.';Features=@(@{Icon='fa-solid fa-fire';Title='Nóng là ngon nhất';Text='Để nguội, món sẽ mất đi khá nhiều độ hấp dẫn.'},@{Icon='fa-solid fa-cheese';Title='Topping tạo dấu ấn';Text='Topping nhiều hay ít sẽ quyết định tính cách của chiếc bánh.'},@{Icon='fa-solid fa-bolt';Title='Ăn vặt rất đã';Text='Đây là món hợp với nhịp vui, nhanh và bắt vị.'});EnjoyIntro='Bánh tráng nướng nên ăn ngay khi còn nóng để thấy rõ độ giòn, độ thơm và độ vui miệng của món.';StepTitle='Thưởng thức sao cho ngon';Steps=@(@{No='01';Title='Ăn ngay khi vừa cắt';Text='Đây là lúc bánh giòn nhất và topping còn thơm nhất.'},@{No='02';Title='Cảm phần đế trước';Text='Đừng chỉ chú ý topping, phần đế mới là thứ tạo cảm giác đã miệng.'},@{No='03';Title='Ăn từng miếng nhỏ';Text='Miếng vừa sẽ giúp giữ topping tốt và không bị rơi.'});Pair1='Một ly trà hoặc nước mát sẽ rất hợp.';Pair2='Đi chiều tối sẽ thấy món đúng không khí hơn.';Pair3='Rất hợp ăn cùng bạn bè lúc đi dạo.';Tips=@('Đừng để bánh nguội quá lâu mới ăn.','Nếu thích đậm vị, hãy chọn loại topping nhiều hơn.','Món này hợp ăn tại chỗ hơn mang về.');Feel='Đây là món tạo cảm giác vui, giòn và rất “đường phố”.';Feel2='Không cầu kỳ nhưng cực kỳ bắt miệng khi ăn đúng lúc.';Flavors=@('giòn tan','nóng hổi','topping đậm','ăn vặt');CommentId=209},
@{File='ocnuongtieu.html';BodyClass='ocnuong-page';Title='Ốc Nướng Tiêu';ShortTitle='ốc nướng tiêu';Description='Khám phá ốc nướng tiêu với mùi thơm tiêu nướng và vị cay ấm rất cuốn.';Icon='fa-solid fa-pepper-hot';Eyebrow='Thơm tiêu, cay ấm, rất bắt mồi';Lead='Ốc nướng tiêu là kiểu món càng ngửi càng muốn ăn. Mùi tiêu thơm bốc lên cùng độ nóng của ốc tạo nên cảm giác rất hợp cho những buổi tụ tập chiều tối.';Image='images/ocnuongtieu.jfif';Quick1='Thơm tiêu rất rõ';Quick2='Hợp ăn nóng và ăn nhóm';Quick3='Cay ấm, đậm vị';Quick4='Rất hợp không khí chiều tối';IntroTitle='Ốc nướng tiêu hấp dẫn ở đâu?';Intro1='Điểm hút nhất của món là mùi. Chỉ cần đĩa ốc vừa lên là hương tiêu, hương nướng và hơi nóng đã đủ kéo người ta nhập cuộc.';Intro2='Món này hợp với kiểu ngồi lâu, vừa ăn vừa nói chuyện hơn là ăn nhanh cho no.';Badge='Mùi tiêu nướng bốc lên từ đĩa ốc luôn là phần tạo cảm giác thèm rõ nhất.';Features=@(@{Icon='fa-solid fa-fire';Title='Cần ăn lúc còn nóng';Text='Ốc nóng sẽ giữ được độ thơm và cảm giác ngon rõ hơn.'},@{Icon='fa-solid fa-pepper-hot';Title='Tiêu là điểm nhấn';Text='Vị cay ấm làm món này khác biệt hẳn.'},@{Icon='fa-solid fa-users';Title='Rất hợp tụ tập';Text='Món này ngon hơn khi ăn trong không khí rôm rả.'});EnjoyIntro='Ốc nướng tiêu hợp nhất khi ăn nóng, nhâm nhi chậm và để vị tiêu lan dần trong miệng.';StepTitle='Ăn kiểu này sẽ rất hợp';Steps=@(@{No='01';Title='Ăn ngay khi vừa lên';Text='Lúc này mùi tiêu và độ nóng đạt đỉnh.'},@{No='02';Title='Cảm mùi trước vị';Text='Đừng ăn quá nhanh, món này hay ở cả phần hương.'},@{No='03';Title='Ăn xen kẽ để đỡ nặng';Text='Đổi nhịp với nước mát hoặc món nhẹ sẽ hợp hơn.'});Pair1='Một ly nước mát giúp cân lại độ cay ấm.';Pair2='Ăn chiều tối sẽ đúng không khí nhất.';Pair3='Đi cùng bạn bè làm món này vui hơn nhiều.';Tips=@('Nếu không ăn cay tốt, nên hỏi mức tiêu trước.','Ốc nướng ngon nhất là ăn liền khi nóng.','Món này hợp gọi chung để chia nhau thử.');Feel='Ốc nướng tiêu cho cảm giác thơm, ấm và rất bắt vị.';Feel2='Đây là món hợp không khí tụ tập hơn là một bữa ăn vội.';Flavors=@('thơm tiêu','cay ấm','ăn nóng','tụ tập');CommentId=210}
)
foreach ($page in $pagesB) { Set-Content -Path (Join-Path 'd:\html' $page.File) -Value (Render-FoodPage $page) -Encoding UTF8 }
$pagesC = @(
@{File='banhmichao.html';BodyClass='banhmichao-page';Title='Bánh Mì Chảo';ShortTitle='bánh mì chảo';Description='Khám phá bánh mì chảo với phần chảo nóng, nước sốt đậm và cảm giác ăn sáng rất đã.';Icon='fa-solid fa-pan-frying';Eyebrow='Nóng, thơm, no bụng buổi sáng';Lead='Bánh mì chảo là kiểu món nhìn thôi đã thấy no và ấm. Chảo nóng với trứng, pate, xúc xích hoặc thịt đi cùng bánh mì giòn tạo nên một bữa ăn vừa vui vừa rất đã miệng.';Image='images/banhmichao.jfif';Quick1='Nóng, thơm và đậm';Quick2='Rất hợp bữa sáng';Quick3='Nước sốt là điểm hút';Quick4='Ăn tại chỗ sẽ ngon hơn';IntroTitle='Bánh mì chảo có gì cuốn?';Intro1='Điểm hay của món này nằm ở cảm giác “sizzle” ngay khi chảo được mang ra. Mùi bơ, sốt và phần topping nóng làm bữa ăn trở nên rất hấp dẫn.';Intro2='Món này vừa hợp với người thích bữa sáng chắc bụng, vừa hợp với những ai thích kiểu ăn có nhiều thứ để chấm, xé và kết hợp.';Badge='Chảo nóng nghi ngút và phần sốt đậm luôn là điểm khiến món này cuốn ngay từ đầu.';Features=@(@{Icon='fa-solid fa-fire';Title='Ăn nóng mới trọn vị';Text='Càng để lâu, chảo càng mất đi cảm giác hấp dẫn nhất.'},@{Icon='fa-solid fa-bread-slice';Title='Bánh mì là bạn đồng hành chính';Text='Phần ngon nằm ở chỗ chấm và ăn cùng sốt.'},@{Icon='fa-solid fa-egg';Title='Topping làm món no và vui';Text='Nhiều thành phần tạo cảm giác bữa ăn đầy đặn hơn.'});EnjoyIntro='Bánh mì chảo nên ăn theo nhịp chấm, xé và ăn nóng để thấy rõ cái vui của món.';StepTitle='Cách ăn đúng chất';Steps=@(@{No='01';Title='Xé bánh mì vừa ăn';Text='Miếng bánh vừa tay sẽ dễ chấm và giữ được độ giòn tốt hơn.'},@{No='02';Title='Chấm vào phần sốt trước';Text='Nước sốt là phần kéo hương vị các topping lại với nhau.'},@{No='03';Title='Ăn xen kẽ từng topping';Text='Trứng, pate, thịt hay xúc xích nên được đổi nhịp để món không bị đơn điệu.'});Pair1='Một ly cà phê hoặc trà sáng là rất hợp.';Pair2='Ăn sáng hoặc brunch là chuẩn nhất.';Pair3='Nên ăn tại chỗ để giữ được cái nóng của chảo.';Tips=@('Đừng để chảo nguội rồi mới ăn.','Nếu thích đậm vị, hãy hỏi thêm sốt hoặc pate.','Món này no khá lâu nên hợp bữa sáng chính.');Feel='Bánh mì chảo cho cảm giác ấm, no và rất “đã” khi bắt đầu ngày mới.';Feel2='Đây là món vừa vui mắt vừa hợp cho người thích bữa sáng chắc bụng.';Flavors=@('nóng sốt','đậm vị','giòn bánh mì','bữa sáng');CommentId=211},
@{File='tramangcau.html';BodyClass='tramangcau-page';Title='Trà Mãng Cầu';ShortTitle='trà mãng cầu';Description='Khám phá trà mãng cầu với vị chua ngọt, thơm nhẹ và cảm giác giải khát rất tốt.';Icon='fa-solid fa-mug-saucer';Eyebrow='Chua ngọt, thơm nhẹ, rất giải nhiệt';Lead='Trà mãng cầu là món uống dễ được yêu thích vì vừa có độ chua dịu, vừa có hậu ngọt dễ chịu. Đây là kiểu thức uống rất hợp với thời tiết nóng và nhịp ăn vặt buổi chiều.';Image='images/tramangcau.jpg';Quick1='Chua ngọt rất vừa miệng';Quick2='Hợp trời nóng';Quick3='Dễ uống, dễ thích';Quick4='Đi cùng món ăn vặt rất hợp';IntroTitle='Trà mãng cầu có gì đáng thử?';Intro1='Cái hay của trà mãng cầu là cảm giác giải khát rất nhanh nhưng không gắt. Mùi trái cây rõ, vị chua ngọt mềm và uống xong thấy miệng khá sạch vị.';Intro2='Đây là món đồ uống dễ tiếp cận, hợp cả người thích trà lẫn người chỉ muốn một ly nước mát có vị thú vị hơn.';Badge='Vị chua ngọt dịu và mùi trái cây thơm là phần làm món này rất dễ gây thiện cảm.';Features=@(@{Icon='fa-solid fa-snowflake';Title='Giải nhiệt tốt';Text='Rất hợp với buổi chiều nắng hoặc sau khi ăn đồ đậm vị.'},@{Icon='fa-solid fa-lemon';Title='Vị chua ngọt cân bằng';Text='Không quá gắt nên khá dễ uống.'},@{Icon='fa-solid fa-heart';Title='Dễ hợp nhiều người';Text='Đây là món nước có độ an toàn cao về vị giác.'});EnjoyIntro='Trà mãng cầu ngon nhất khi lạnh vừa, đá không quá nhiều và giữ được mùi trái cây rõ.';StepTitle='Uống kiểu này sẽ hợp hơn';Steps=@(@{No='01';Title='Thử ngụm đầu khi chưa tan đá';Text='Đây là lúc vị trà và vị mãng cầu rõ nhất.'},@{No='02';Title='Khuấy nhẹ rồi uống chậm';Text='Khuấy sẽ giúp hương vị đều hơn mà không bị loãng quá nhanh.'},@{No='03';Title='Uống xen với món ăn';Text='Ly trà này hợp để cân lại vị giác sau đồ chiên hoặc món nướng.'});Pair1='Đi cùng món ăn vặt sẽ rất hợp vị.';Pair2='Buổi chiều nóng là thời điểm uống thích nhất.';Pair3='Nếu thích chua hơn, có thể chỉnh ít ngọt.';Tips=@('Đừng để quá nhiều đá nếu muốn giữ vị trà rõ.','Món này hợp với người thích vị trái cây thanh hơn trà sữa.','Uống lúc lạnh vừa sẽ ngon hơn quá lạnh.');Feel='Trà mãng cầu cho cảm giác mát, sạch miệng và khá thư giãn.';Feel2='Đây là kiểu thức uống nhẹ nhàng nhưng rất dễ thành “món ruột”.';Flavors=@('chua ngọt','thơm nhẹ','mát lạnh','dễ uống');CommentId=212},
@{File='trasua.html';BodyClass='trasua-page';Title='Trà Sữa';ShortTitle='trà sữa';Description='Khám phá trà sữa với vị béo ngọt quen thuộc và không khí quán xá hiện đại của Cần Thơ.';Icon='fa-solid fa-glass-water';Eyebrow='Ngọt béo, chill quán xá, rất dễ gọi';Lead='Trà sữa ở Cần Thơ là một phần rất rõ của nhịp ăn uống hiện đại. Từ ly truyền thống đến các biến thể topping, đây là món uống đi cùng tụ tập, học nhóm và những buổi ngồi quán rất nhiều.';Image='images/trasua.jfif';Quick1='Ngọt béo, dễ uống';Quick2='Hợp ngồi quán lâu';Quick3='Topping tạo niềm vui riêng';Quick4='Rất hợp giới trẻ';IntroTitle='Trà sữa vì sao vẫn luôn hot?';Intro1='Sức hút của trà sữa nằm ở sự dễ tiếp cận. Dễ chọn vị, dễ chỉnh ngọt đá, dễ thêm topping và rất hợp với những buổi tụ tập không cần quá cầu kỳ.';Intro2='Ở Cần Thơ, trà sữa không chỉ là món uống mà còn là một phần của văn hóa quán xá hiện đại.';Badge='Ly trà sữa mát lạnh cùng topping luôn là hình ảnh quen thuộc của những buổi ngồi quán.';Features=@(@{Icon='fa-solid fa-ice-cream';Title='Dễ uống, dễ chọn';Text='Món này có rất nhiều biến thể để hợp nhiều gu khác nhau.'},@{Icon='fa-solid fa-gem';Title='Topping tạo vui miệng';Text='Topping là phần khiến mỗi ly có cá tính riêng.'},@{Icon='fa-solid fa-users';Title='Rất hợp tụ tập';Text='Đây là món uống gắn với nhịp ngồi quán rất rõ.'});EnjoyIntro='Trà sữa ngon hay không nằm ở tỷ lệ trà, sữa và mức ngọt đá hợp gu. Chọn đúng là uống rất cuốn.';StepTitle='Gọi sao cho hợp gu';Steps=@(@{No='01';Title='Chọn nền trà trước';Text='Nền trà quyết định ly của bạn thiên thơm, béo hay thanh.'},@{No='02';Title='Chỉnh ngọt đá vừa';Text='Giảm một chút ngọt thường sẽ dễ uống lâu hơn.'},@{No='03';Title='Thêm topping đúng kiểu';Text='Chọn topping bạn thật sự thích sẽ làm ly nước đáng tiền hơn.'});Pair1='Ngồi cùng bạn bè hoặc học nhóm là đúng vibe nhất.';Pair2='Hợp nhất với món ăn vặt nhẹ hoặc bánh ngọt.';Pair3='Buổi chiều và tối là thời điểm quán xá sôi động nhất.';Tips=@('Giảm ngọt nếu bạn dễ ngán.','Đừng thêm quá nhiều topping nếu muốn giữ vị trà rõ.','Chọn ly size vừa nếu muốn uống gọn mà vẫn đủ vui.');Feel='Trà sữa mang cảm giác thoải mái, hiện đại và rất đúng nhịp quán xá.';Feel2='Đây là món uống của tụ tập, trò chuyện và thư giãn nhiều hơn là chỉ giải khát.';Flavors=@('ngọt béo','topping vui','mát lạnh','quán xá');CommentId=213},
@{File='chuoinepnuong.html';BodyClass='chuoi-page';Title='Chuối Nếp Nướng';ShortTitle='chuối nếp nướng';Description='Khám phá chuối nếp nướng với vị thơm khói, dẻo nếp và nước cốt dừa béo dịu.';Icon='fa-solid fa-fire';Eyebrow='Thơm khói, dẻo nếp, béo cốt dừa';Lead='Chuối nếp nướng là món ăn vặt vừa thơm vừa ấm. Chuối chín ngọt, lớp nếp dẻo và nước cốt dừa béo nhẹ kết hợp lại tạo nên một món rất có chiều sâu dù nguyên liệu rất giản dị.';Image='images/chuoinuong.jpg';Quick1='Thơm mùi nướng rất rõ';Quick2='Ngon khi còn ấm';Quick3='Ngọt dịu chứ không gắt';Quick4='Cốt dừa làm món lên hẳn';IntroTitle='Chuối nếp nướng hay ở đâu?';Intro1='Món này cuốn ở cảm giác tương phản: mùi khói nướng nhưng vị lại mềm, dẻo và ngọt dịu. Đây là kiểu món càng ăn nóng càng thấy đúng.';Intro2='Dù nhìn mộc mạc, chuối nếp nướng lại khá “nhiều lớp” về cảm giác: khói, nếp, chuối, cốt dừa và độ bùi đi kèm.';Badge='Mùi nướng thơm và phần nếp ôm chuối tạo nên dấu ấn rất riêng cho món này.';Features=@(@{Icon='fa-solid fa-fire';Title='Mùi nướng là linh hồn';Text='Mùi khói nhẹ giúp món có cảm giác rất hấp dẫn.'},@{Icon='fa-solid fa-bowl-rice';Title='Lớp nếp tạo độ dẻo';Text='Nếp không chỉ no mà còn giúp món có chiều sâu hơn.'},@{Icon='fa-solid fa-droplet';Title='Cốt dừa làm món mềm hơn';Text='Phần sốt béo dịu là thứ khiến món lên hẳn.'});EnjoyIntro='Chuối nếp nướng ngon nhất khi còn ấm, có cốt dừa vừa đủ và ăn chậm để cảm mùi nướng thật rõ.';StepTitle='Thưởng thức sao cho trọn';Steps=@(@{No='01';Title='Ăn khi còn ấm';Text='Nhiệt độ ấm giúp mùi nướng và độ dẻo của nếp rõ nhất.'},@{No='02';Title='Cho cốt dừa vừa đủ';Text='Nhiều quá dễ át phần thơm của chuối và nếp.'},@{No='03';Title='Cảm từng lớp';Text='Món này ngon ở sự hòa của chuối, nếp và phần sốt.'});Pair1='Một ly trà nhẹ sẽ cân lại độ béo tốt hơn.';Pair2='Ăn xế hoặc chiều tối rất hợp.';Pair3='Rất hợp cho người thích món ngọt theo kiểu truyền thống.';Tips=@('Ăn ngay khi còn ấm là ngon nhất.','Nếu thích thơm hơn, hãy chọn phần vừa mới nướng xong.','Đừng chan quá nhiều cốt dừa nếu muốn cảm rõ mùi chuối.');Feel='Đây là món ngọt cho cảm giác ấm, thơm và rất “nhớ nhà”.';Feel2='Nó mộc mạc nhưng có sức hút rất riêng nhờ mùi nướng.';Flavors=@('thơm khói','dẻo nếp','ngọt chuối','cốt dừa');CommentId=214}
)
foreach ($page in $pagesC) { Set-Content -Path (Join-Path 'd:\html' $page.File) -Value (Render-FoodPage $page) -Encoding UTF8 }
$pagesD = @(
@{File='banhdalon.html';BodyClass='banhdalon-page';Title='Bánh Da Lợn';ShortTitle='bánh da lợn';Description='Khám phá bánh da lợn với lớp bánh dẻo mềm, thơm lá dứa và vị ngọt dịu dễ ăn.';Icon='fa-solid fa-layer-group';Eyebrow='Mềm dẻo, thơm lá dứa, rất tuổi thơ';Lead='Bánh da lợn là kiểu món nhìn đơn giản nhưng ăn lại rất dễ mến. Từng lớp bánh mềm, dẻo nhẹ, thơm lá dứa hoặc đậu xanh tạo cảm giác vừa quen vừa dễ chịu.';Image='images/banhdalon.jpg';Quick1='Dẻo mềm và thơm nhẹ';Quick2='Hợp ăn xế hoặc tráng miệng';Quick3='Ngọt vừa, dễ ăn';Quick4='Đẹp ở từng lớp bánh';IntroTitle='Bánh da lợn vì sao luôn có chỗ riêng?';Intro1='Món này không phải kiểu gây ấn tượng mạnh ở miếng đầu, nhưng lại rất dễ khiến người ta thấy thân thuộc. Sự mềm, dẻo và hương thơm nhẹ làm nó dễ được nhớ theo cách rất dịu.';Intro2='Bánh da lợn cũng là món đẹp mắt nhờ các lớp màu và kết cấu rõ ràng, rất hợp để vừa ngắm vừa ăn chậm.';Badge='Từng lớp bánh xếp rõ và độ dẻo mềm là điểm làm món này dễ được yêu thích.';Features=@(@{Icon='fa-solid fa-leaf';Title='Thơm lá dứa nhẹ';Text='Mùi thơm dịu là phần tạo cảm giác rất dễ chịu.'},@{Icon='fa-solid fa-layer-group';Title='Các lớp bánh rõ ràng';Text='Nhìn thôi cũng đã thấy món có sự chỉn chu.'},@{Icon='fa-solid fa-heart';Title='Rất hợp ăn nhẹ';Text='Đây là món ngọt không quá áp lực vị giác.'});EnjoyIntro='Bánh da lợn hợp nhất với kiểu ăn chậm, cắt miếng nhỏ và cảm độ mềm của từng lớp.';StepTitle='Ăn sao cho cảm rõ nhất';Steps=@(@{No='01';Title='Cắt miếng nhỏ';Text='Miếng nhỏ sẽ giúp thấy rõ độ dẻo và kết cấu từng lớp.'},@{No='02';Title='Ăn chậm từng lớp';Text='Món này hay ở cảm giác hơn là độ bùng nổ vị.'},@{No='03';Title='Dùng với trà nhẹ';Text='Một ngụm trà sẽ làm món dễ chịu hơn nhiều.'});Pair1='Trà nóng hoặc trà nhạt là rất hợp.';Pair2='Ăn xế chiều hoặc sau bữa chính đều ổn.';Pair3='Món này hợp với người thích đồ ngọt mềm và dịu.';Tips=@('Đừng để bánh quá lạnh nếu muốn giữ độ mềm.','Cắt gọn từng miếng sẽ ăn đẹp hơn.','Món này hợp để ăn chậm, không cần vội.');Feel='Bánh da lợn cho cảm giác mềm, dịu và khá thư giãn.';Feel2='Đây là món ngọt mang màu sắc tuổi thơ và rất dễ tạo thiện cảm.';Flavors=@('dẻo mềm','lá dứa','ngọt dịu','nhiều lớp');CommentId=215},
@{File='ptay.html';BodyClass='ptay-page';Title='Ẩm Thực Phương Tây';ShortTitle='ẩm thực phương Tây';Description='Khám phá góc ẩm thực phương Tây ở Cần Thơ với nhiều món hiện đại, dễ hẹn bạn bè và trải nghiệm mới.';Icon='fa-solid fa-utensils';Eyebrow='Hiện đại, thoải mái và nhiều lựa chọn';Lead='Bên cạnh món miền Tây, Cần Thơ cũng có một nhịp ẩm thực phương Tây khá sôi động với pizza, steak, pasta, burger và nhiều quán cà phê - nhà hàng có không gian đẹp để hẹn hò, tụ tập hoặc đổi vị.';Image='images/ptay.png';Quick1='Nhiều món hiện đại dễ chọn';Quick2='Hợp hẹn hò, tụ tập hoặc đổi vị';Quick3='Không gian quán thường rất quan trọng';Quick4='Đi nhóm hay cặp đôi đều hợp';IntroTitle='Ẩm thực phương Tây ở Cần Thơ có gì thú vị?';Intro1='Điều thú vị là bạn có thể chuyển từ một bữa ăn rất miền Tây sang một buổi tối pizza, steak hay pasta chỉ trong cùng thành phố. Nhịp ăn uống này khiến trải nghiệm Cần Thơ phong phú hơn nhiều.';Intro2='Ẩm thực phương Tây ở đây thường gắn với không gian đẹp, cách phục vụ hiện đại và cảm giác “đi ăn để chill” nhiều hơn là chỉ ăn cho no.';Badge='Không gian quán và cách lên món thường là thứ quyết định trải nghiệm phần này.';Features=@(@{Icon='fa-solid fa-pizza-slice';Title='Dễ đổi vị';Text='Rất hợp khi bạn muốn tạm đổi khỏi món quen miền Tây.'},@{Icon='fa-solid fa-champagne-glasses';Title='Hợp cho dịp hẹn hò';Text='Không gian và cách phục vụ thường phù hợp cho những buổi đi ăn đẹp.'},@{Icon='fa-solid fa-burger';Title='Nhiều lựa chọn hiện đại';Text='Từ món no bụng đến món ăn nhanh hay đồ uống đều khá đa dạng.'});EnjoyIntro='Muốn trải nghiệm phần ẩm thực này trọn hơn, hãy chọn quán theo đúng nhu cầu: ăn no, hẹn hò, ngồi lâu hay chụp ảnh đẹp.';StepTitle='Nên đi theo kiểu nào?';Steps=@(@{No='01';Title='Chọn đúng mood';Text='Đi ăn tối lãng mạn, tụ tập bạn bè hay đổi vị nhẹ sẽ hợp với những kiểu quán khác nhau.'},@{No='02';Title='Ưu tiên món signature';Text='Quán phương Tây thường có vài món “chủ lực”, gọi đúng sẽ dễ thấy quán ngon hay không.'},@{No='03';Title='Kết hợp món chính và đồ uống';Text='Một set món đúng kiểu sẽ làm trải nghiệm đầy đủ và đáng tiền hơn.'});Pair1='Đi cùng bạn bè, người yêu hoặc đồng nghiệp đều hợp.';Pair2='Nên chọn quán theo gu: chill, sang, nhanh gọn hay no bụng.';Pair3='Buổi tối là thời điểm phần ẩm thực này lên vibe rõ nhất.';Tips=@('Nên xem trước menu nếu đi nhóm đông để dễ chọn.','Ưu tiên món signature thay vì gọi quá dàn trải.','Không gian đẹp thường đi cùng giờ cao điểm, nên canh thời gian phù hợp.');Feel='Ẩm thực phương Tây ở Cần Thơ mang lại cảm giác hiện đại, thoải mái và khá khác so với nhịp ăn uống truyền thống.';Feel2='Đây là lựa chọn rất ổn khi bạn muốn đổi vị hoặc cần một buổi ăn có mood riêng.';Flavors=@('pizza','steak','pasta','burger');RecommendDishes=@(@{Name='Pizza';Text='Dễ gọi theo nhóm, hợp chia sẻ và khá an toàn nếu đi đông người.'},@{Name='Steak';Text='Hợp cho bữa tối chỉnh chu, nên thử nếu muốn cảm giác ăn uống rõ “phương Tây”.'},@{Name='Pasta';Text='Phù hợp cho ai thích món mềm, dễ ăn và có nhiều loại sốt.'},@{Name='Burger';Text='Nhanh gọn, no bụng và rất hợp với những buổi tụ tập nhẹ.'});RecommendShops=@(@{Name='Pizza Hut Cần Thơ';Text='Phù hợp đi nhóm, menu dễ chọn và khá quen vị.'},@{Name='The Pizza Company';Text='Hợp cho những buổi ăn kiểu hiện đại, gọi món chia sẻ.'},@{Name='Highlands / The Coffee House khu trung tâm';Text='Hợp nếu muốn kết hợp đồ uống và món nhẹ theo kiểu ngồi lâu.'},@{Name='Các quán steak - pasta khu Ninh Kiều';Text='Nên ưu tiên quán có review tốt và không gian hợp đúng mood bạn cần.'});CommentId=216}
)
foreach ($page in $pagesD) { Set-Content -Path (Join-Path 'd:\html' $page.File) -Value (Render-FoodPage $page) -Encoding UTF8 }


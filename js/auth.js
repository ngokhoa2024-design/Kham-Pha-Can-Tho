async function signUp() {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    if (!email || !password) {
        alert("Vui lòng nhập đầy đủ email và mật khẩu!");
        return;
    }

    const { data, error } = await supabaseClient.auth.signUp({
        email: email,
        password: password
    });

    if (error) {
        alert("Đăng ký thất bại: " + error.message);
        return;
    }

    alert("Đăng ký thành công! Hãy kiểm tra email để xác nhận tài khoản.");
}
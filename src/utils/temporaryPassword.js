export default function generateTemporaryPassword() {
    const letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const digits = "0123456789";
    const allChars = letters + digits;

    let password = "";

    // Bắt buộc có ít nhất 1 chữ cái
    password += letters.charAt(Math.floor(Math.random() * letters.length));

    // Bắt buộc có ít nhất 1 chữ số
    password += digits.charAt(Math.floor(Math.random() * digits.length));

    // Thêm ngẫu nhiên 6 ký tự còn lại
    for (let i = 0; i < 6; i++) {
        password += allChars.charAt(
            Math.floor(Math.random() * allChars.length)
        );
    }

    // Trộn ngẫu nhiên chuỗi
    password = password
        .split("")
        .sort(() => 0.5 - Math.random())
        .join("");

    return password;
}

// const temporaryPassword = generateTemporaryPassword();
// console.log(temporaryPassword);

import { slugify } from "../utils/formatters";

// xử lý logic : controller là xử lý điều hướng xong chuyển sang service
const createNew = async (reqbody) => {
    try {
        // Xử lý logic dữ liệu tùy đặc thù dự án
        const newBoard = {
            ...reqbody,
            slug: slugify(reqbody.title),
        };

        // Gọi tới tầng Model để xử lý lưu bản ghi newBoard vào trong Database

        // Làm thêm các xử lý logic khác với các collection khác tùy đặc thù dự án
        // Bắn email, notification về cho admin khi có 1 cái board được tạo,...

        // Trả kết quả về, trong Service luôn phải có return
        return newBoard;
    } catch (error) {
        throw error;
    }
};
export const boardService = {
    createNew,
};

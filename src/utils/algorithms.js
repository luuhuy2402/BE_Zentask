//Tính toán giá trị skip phụ vụ cho tác vụ phân trang
export const pagingSkipValue = (page, itemsPerPage) => {
    //luôn đảm bảo khi giá trị ko hợp lệ return 0
    if (!page || !itemsPerPage) return 0;
    if (page <= 0 || itemsPerPage <= 0) return 0;
    /**
     * Giai thích
     * - Ví dụ trường hợp mỗi page hiển thị 12 sp (itemsPerPage = 12)
     * - Case1: User đứng ở page 1 (page =1 )  thì sẽ lấy  1-1 =0 su đó nhân với 12 thì cũng = 0 tức là giá trị skip là 0 => ko skip bản ghi
     * - Case2: User đứng ở page 2 (page =2 )  thì sẽ lấy  2-1 =1 su đó nhân với 12 thì cũng = 12 tức là giá trị skip là 12 => nghĩa là sẽ skip 12 bản ghi của 1 page trước đó
     * - Case3: User đứng ở page 3 (page =3 )  thì sẽ lấy  3-1 =2 su đó nhân với 12 thì cũng = 24 tức là giá trị skip là 24 => nghĩa là sẽ skip 24 bản ghi của 1 page trước đó
     * .....
     *
     */
    return (page - 1) * itemsPerPage;
};

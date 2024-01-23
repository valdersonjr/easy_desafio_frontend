interface jsonResponseStructure {
    code: number;
    message?: string[] | string | null;
    data?: any | null;
    meta?: any | null
}


export default interface apiResponseDto {
    data: jsonResponseStructure;
    status: number;
}
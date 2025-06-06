import { IsNumber, IsString, IsUUID } from "class-validator"


export class PaymentDto {
    @IsString()
    transactionRef:string
    @IsUUID()
    senderId:string
    @IsUUID()
    receiverId:string
    @IsNumber()
    amount:number
}
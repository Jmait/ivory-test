import { Body, Controller, Post } from "@nestjs/common";
import { PaymentDto } from "./dto/payment.dto";
import { PaymentService } from "./payment.service";

@Controller('payment')

export class PaymentController{
    constructor(private  paymentService:PaymentService){}
    @Post('/transfer')
    transfer(@Body()dto:PaymentDto){
     return this.paymentService.initiatePayment(dto);
    }
    
}
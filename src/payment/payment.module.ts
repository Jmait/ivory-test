import { Module } from "@nestjs/common";
import { PaymentController } from "./payment.controller";
import { PaymentService } from "./payment.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserEntity } from "src/user/entities/user.entity";
import { PaymentEntities } from "./entities/payment.entity";

@Module({
    imports:[
    TypeOrmModule.forFeature([UserEntity, PaymentEntities])
    ],
    providers:[
     PaymentService
    ],
    controllers:[
    PaymentController
    ]
})
export class PaymentModule{}
import { Column, CreateDateColumn, Entity, Unique } from "typeorm"

@Entity('Payment'
)
@Unique('transactionRef',['transactionRef']) //avoid duplicate transaction
export class PaymentEntities{
    @Column()
    
    transactionRef: string
    @Column()
    senderId:string
    @Column()
    amount:number
    @CreateDateColumn()
    createdAt:Date
}
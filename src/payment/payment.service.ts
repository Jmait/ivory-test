import { BadRequestException, HttpException, HttpStatus, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UserEntity } from "src/user/entities/user.entity";
import { Repository } from "typeorm";
import { PaymentDto } from "./dto/payment.dto";
import { PaymentEntities } from "./entities/payment.entity";

@Injectable()
export class PaymentService {
    constructor(
        @InjectRepository(UserEntity)
        private readonly userRepository:Repository<UserEntity>,
        @InjectRepository(PaymentEntities)
        private readonly paymentRepository:Repository<PaymentEntities>,
    ){}
    //implementation assumes user has already been created and authenticated
    //this is a protected endpoint
    //rate limiting applied to prevent abuse
    async initiatePayment(dto:PaymentDto){
        try {
            const {senderId, receiverId, amount, transactionRef} = dto;
            const [sender, receiver] = await  Promise.all([
                this.userRepository.findOne({where:{userId:senderId}}),
                  this.userRepository.findOne({where:{userId:receiverId}}),

            ]);
            if (!sender) {
               throw new NotFoundException('No corresponnding sender with provided senderId') 
            }
            if (!receiver) {
                  throw new NotFoundException('No corresponnding reciever with provided receiverId')   
            }  
            if (amount<=0) {
                  throw new BadRequestException('amount must greater than 0')
            }
          
             if (sender.balance>=amount) {
                const alreadyProcessed = await this.paymentRepository.findOne({where:{transactionRef}})
                if (alreadyProcessed)
                     {
                 throw new BadRequestException('Duplicate transaction detected. Please retry after some minutes');
                }
                //optimistic locking
                const newBalance = sender.balance -amount;
                const balanceDeduction = await this.userRepository.update({
                    userId:senderId, version:sender.version},
                    {
                    balance: newBalance,
                    version: sender.version+1// increase the version prevent double charging
                });
                if (balanceDeduction.affected==0) {
                 throw new BadRequestException('Transaction failed due to concurrent update. Please try again.'); 
                }
                if (balanceDeduction) {
                    const amountCredited = receiver.balance+amount;
                    //prevent double crediting
                    const receiverBalanceUpdated = await this.userRepository.update({
                        userId:senderId,
                        version: receiver.version
                    },{
                    balance: amountCredited,
                    version: receiver.version+1
                  });
                 if (receiverBalanceUpdated.affected==0) {
                 throw new BadRequestException('Transaction failed due to concurrent update. Please try again.'); 
                }
                  if (receiverBalanceUpdated) {
                    return new HttpException('Payment successfuly sent', HttpStatus.OK);
                  }
                }
             }else{
               throw new BadRequestException('Insufficient fund');
             }
            
          
        } catch (error) {
            throw new InternalServerErrorException('Internal server error');
        }
    }
}